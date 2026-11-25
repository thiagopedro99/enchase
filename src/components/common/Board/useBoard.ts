import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { useUIConfig } from '@hooks/useUIConfig.ts'
import { boardLabelsFor } from './locales.ts'
import { defaultReadOnly, defaultSortable, dragThreshold, edgeScrollZone, edgeScrollSpeed } from './defaultData.ts'

import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, RefCallback } from 'react'
import type { BoardLabels } from './locales.ts'
import type { BoardColumn, BoardItem, BoardMoveState, BoardPosition, BoardProps } from './types.ts'

type UseBoardOptions<Item extends BoardItem> = Pick<BoardProps<Item>, 'columns' | 'items' | 'onMove' | 'getItemLabel' | 'sortable' | 'readOnly' | 'labels'>

type DragState = {
  pointerId: number
  itemId: string
  from: BoardPosition
  startX: number
  startY: number
  offsetX: number
  offsetY: number
  width: number
  menuWidth: number
  thresholdCrossed: boolean
}

type PendingFocus = {
  id: string
  kind: 'handle' | 'menu'
}

export type BoardCardView<Item> = {
  item: Item
  dimmed: boolean
  picked: boolean
}

export type BoardColumnView<Item> = {
  column: BoardColumn
  cards: BoardCardView<Item>[]
  isDropTarget: boolean
  linePosition: number | null
}

export type BoardMenuEntry =
  | { kind: 'column'; id: string; title: ReactNode; current: boolean; onSelect: () => void }
  | { kind: 'separator'; id: string }
  | { kind: 'move'; id: string; label: string; disabled: boolean; onSelect: () => void }

const draggingAttribute = 'data-enchase-board-dragging'

const labelForColumn = (columns: BoardColumn[], columnId: string) => {
  const column = columns.find((candidate) => candidate.id === columnId)
  if (!column) return ''
  return column.label ?? (typeof column.title === 'string' ? column.title : '')
}

const lengthWithItem = <Item extends BoardItem>(itemsByColumn: Map<string, Item[]>, columnId: string, itemId: string) => {
  const list = itemsByColumn.get(columnId) ?? []
  return list.some((candidate) => candidate.id === itemId) ? list.length : list.length + 1
}

const groupByColumn = <Item extends BoardItem>(columns: BoardColumn[], items: Item[]) => {
  const map = new Map<string, Item[]>()
  for (const column of columns) map.set(column.id, [])
  for (const item of items) map.get(item.columnId)?.push(item)
  return map
}

const resolveTarget = <Item extends BoardItem>(hit: BoardPosition, from: BoardPosition, sortable: boolean, itemsByColumn: Map<string, Item[]>, excludeId: string): BoardPosition => {
  if (sortable) return hit
  if (hit.columnId === from.columnId) return from
  const length = (itemsByColumn.get(hit.columnId) ?? []).filter((item) => item.id !== excludeId).length
  return { columnId: hit.columnId, index: length }
}

export type UseBoardResult<Item extends BoardItem> = ReturnType<typeof useBoard<Item>>

export const useBoard = <Item extends BoardItem>({ columns, items, onMove, getItemLabel, sortable = defaultSortable, readOnly = defaultReadOnly, labels: labelOverrides }: UseBoardOptions<Item>) => {
  const { dir, locale } = useUIConfig()
  const labels = useMemo(() => boardLabelsFor(locale, labelOverrides), [locale, labelOverrides])
  const [activeMove, setActiveMove] = useState<BoardMoveState | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const instructionsId = useId()

  const trackRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const columnListRefs = useRef(new Map<string, HTMLUListElement>())
  const cardRefs = useRef(new Map<string, HTMLLIElement>())
  const handleRefs = useRef(new Map<string, HTMLButtonElement>())
  const menuButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const pendingFocusRef = useRef<PendingFocus | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const pointerRef = useRef({ x: 0, y: 0 })
  const suppressClickRef = useRef<string | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const activeMoveRef = useRef(activeMove)
  activeMoveRef.current = activeMove

  const itemsByColumn = useMemo(() => groupByColumn(columns, items), [columns, items])

  const positionById = useMemo(() => {
    const map = new Map<string, BoardPosition>()
    for (const [columnId, list] of itemsByColumn) list.forEach((item, index) => map.set(item.id, { columnId, index }))
    return map
  }, [itemsByColumn])

  const latest = useRef({ columns, itemsByColumn, items, onMove, getItemLabel, labels, sortable })
  latest.current = { columns, itemsByColumn, items, onMove, getItemLabel, labels, sortable }

  const columnLengthWith = useCallback((columnId: string, itemId: string) => lengthWithItem(itemsByColumn, columnId, itemId), [itemsByColumn])

  const columnLabel = useCallback((columnId: string) => labelForColumn(columns, columnId), [columns])

  const cancel = useCallback(() => {
    const current = activeMoveRef.current
    if (!current) return
    const item = items.find((candidate) => candidate.id === current.itemId)
    if (item) setAnnouncement(labels.boardCancelled(getItemLabel(item), columnLabel(current.from.columnId)))
    if (current.to.columnId !== current.from.columnId) pendingFocusRef.current = { id: current.itemId, kind: 'handle' }
    setActiveMove(null)
  }, [items, labels, getItemLabel, columnLabel])

  const stopAutoScroll = useCallback(() => {
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current)
      scrollFrameRef.current = null
    }
  }, [])

  const withinTrack = useCallback((x: number, y: number) => {
    const track = trackRef.current
    if (!track) return true
    const rect = track.getBoundingClientRect()
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  }, [])

  const hitTest = useCallback((x: number, y: number, excludeId: string): BoardPosition | null => {
    const { columns: cols, itemsByColumn: byColumn } = latest.current
    let targetColumnId: string | null = null
    let bestDistance = Infinity

    for (const column of cols) {
      const node = columnListRefs.current.get(column.id)
      if (!node) continue
      const rect = node.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right) {
        targetColumnId = column.id
        bestDistance = 0
        break
      }
      const distance = x < rect.left ? rect.left - x : x - rect.right
      if (distance < bestDistance) {
        bestDistance = distance
        targetColumnId = column.id
      }
    }

    if (targetColumnId === null) return null

    const candidates = (byColumn.get(targetColumnId) ?? []).filter((item) => item.id !== excludeId)
    let index = candidates.length

    for (let i = 0; i < candidates.length; i += 1) {
      const node = cardRefs.current.get(candidates[i].id)
      if (!node) continue
      const rect = node.getBoundingClientRect()
      if (y < rect.top + rect.height / 2) {
        index = i
        break
      }
    }

    return { columnId: targetColumnId, index }
  }, [])

  const updateTarget = useCallback((x: number, y: number) => {
    const drag = dragRef.current
    if (!drag) return

    if (!withinTrack(x, y)) {
      setActiveMove((current) => (current && current.withinTrack ? { ...current, withinTrack: false } : current))
      return
    }

    const { sortable: currentSortable, itemsByColumn: currentItemsByColumn } = latest.current
    const hit = hitTest(x, y, drag.itemId)
    if (!hit) return

    const next = resolveTarget(hit, drag.from, currentSortable, currentItemsByColumn, drag.itemId)

    setActiveMove((current) => {
      if (!current) return current
      if (current.withinTrack && current.to.columnId === next.columnId && current.to.index === next.index) return current
      return { ...current, to: next, withinTrack: true }
    })
  }, [withinTrack, hitTest])

  const runAutoScroll = useCallback(() => {
    const { x, y } = pointerRef.current
    const track = trackRef.current
    let scrolled = false

    if (track) {
      const rect = track.getBoundingClientRect()
      if (x - rect.left < edgeScrollZone) {
        track.scrollLeft -= edgeScrollSpeed
        scrolled = true
      } else if (rect.right - x < edgeScrollZone) {
        track.scrollLeft += edgeScrollSpeed
        scrolled = true
      }
    }

    if (y < edgeScrollZone) {
      window.scrollBy(0, -edgeScrollSpeed)
      scrolled = true
    } else if (window.innerHeight - y < edgeScrollZone) {
      window.scrollBy(0, edgeScrollSpeed)
      scrolled = true
    }

    if (scrolled) updateTarget(x, y)

    scrollFrameRef.current = requestAnimationFrame(runAutoScroll)
  }, [updateTarget])

  const stableHandlers = useRef({
    onPointerMove: (event: PointerEvent) => stableHandlers.current.onPointerMoveImpl(event),
    onPointerUp: (event: PointerEvent) => stableHandlers.current.onPointerUpImpl(event),
    onPointerCancel: (event: PointerEvent) => stableHandlers.current.onPointerCancelImpl(event),
    onDragKeyDown: (event: KeyboardEvent) => stableHandlers.current.onDragKeyDownImpl(event),
    onPointerMoveImpl: (event: PointerEvent) => void event,
    onPointerUpImpl: (event: PointerEvent) => void event,
    onPointerCancelImpl: (event: PointerEvent) => void event,
    onDragKeyDownImpl: (event: KeyboardEvent) => void event
  })

  const detachDragListeners = useCallback(() => {
    window.removeEventListener('pointermove', stableHandlers.current.onPointerMove)
    window.removeEventListener('pointerup', stableHandlers.current.onPointerUp)
    window.removeEventListener('pointercancel', stableHandlers.current.onPointerCancel)
    window.removeEventListener('keydown', stableHandlers.current.onDragKeyDown, true)
  }, [])

  const finishPointerDrag = useCallback((forceCancel: boolean) => {
    const drag = dragRef.current
    dragRef.current = null
    stopAutoScroll()
    detachDragListeners()
    copyRef.current?.style.removeProperty('--board-drag-x')
    copyRef.current?.style.removeProperty('--board-drag-y')
    copyRef.current?.style.removeProperty('--board-drag-width')
    copyRef.current?.style.removeProperty('--board-drag-menu-width')
    document.documentElement.removeAttribute(draggingAttribute)

    const current = activeMoveRef.current
    setActiveMove(null)

    if (!drag || !drag.thresholdCrossed || !current) return

    const { items: allItems, onMove: notify, getItemLabel: label, labels: allLabels, columns: allColumns, itemsByColumn: byColumn } = latest.current
    const cancelled = forceCancel || !current.withinTrack
    const item = allItems.find((candidate) => candidate.id === drag.itemId)
    const changed = current.to.columnId !== current.from.columnId || current.to.index !== current.from.index

    if (!item) return

    if (cancelled || !changed) {
      setAnnouncement(allLabels.boardCancelled(label(item), labelForColumn(allColumns, current.from.columnId)))
      return
    }

    notify({ item, from: current.from, to: current.to })
    const total = lengthWithItem(byColumn, current.to.columnId, drag.itemId)
    setAnnouncement(allLabels.boardDropped(label(item), current.to.index + 1, total, labelForColumn(allColumns, current.to.columnId)))
  }, [stopAutoScroll, detachDragListeners])

  stableHandlers.current.onPointerMoveImpl = (event: PointerEvent) => {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return

    pointerRef.current = { x: event.clientX, y: event.clientY }

    if (!drag.thresholdCrossed) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < dragThreshold) return
      drag.thresholdCrossed = true
      suppressClickRef.current = drag.itemId
      document.documentElement.setAttribute(draggingAttribute, '')
      setActiveMove({ itemId: drag.itemId, from: drag.from, to: drag.from, via: 'pointer', withinTrack: true })
      scrollFrameRef.current = requestAnimationFrame(runAutoScroll)
    }

    if (copyRef.current) {
      copyRef.current.style.setProperty('--board-drag-x', `${event.clientX - drag.offsetX}px`)
      copyRef.current.style.setProperty('--board-drag-y', `${event.clientY - drag.offsetY}px`)
      copyRef.current.style.setProperty('--board-drag-width', `${drag.width}px`)
      copyRef.current.style.setProperty('--board-drag-menu-width', `${drag.menuWidth}px`)
    }

    updateTarget(event.clientX, event.clientY)
  }

  stableHandlers.current.onPointerUpImpl = (event: PointerEvent) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    finishPointerDrag(false)
  }

  stableHandlers.current.onPointerCancelImpl = (event: PointerEvent) => {
    if (dragRef.current?.pointerId !== event.pointerId) return
    finishPointerDrag(true)
  }

  stableHandlers.current.onDragKeyDownImpl = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && dragRef.current) {
      event.preventDefault()
      event.stopPropagation()
      finishPointerDrag(true)
    }
  }

  const beginDrag = useCallback((itemId: string, event: ReactPointerEvent) => {
    if (readOnly) return
    const from = positionById.get(itemId)
    if (!from) return

    const cardNode = cardRefs.current.get(itemId)
    const rect = cardNode?.getBoundingClientRect()
    const menuWidth = menuButtonRefs.current.get(itemId)?.getBoundingClientRect().width ?? 0

    dragRef.current = {
      pointerId: event.pointerId,
      itemId,
      from,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: rect ? event.clientX - rect.left : 0,
      offsetY: rect ? event.clientY - rect.top : 0,
      width: rect?.width ?? 0,
      menuWidth,
      thresholdCrossed: false
    }
    pointerRef.current = { x: event.clientX, y: event.clientY }

    window.addEventListener('pointermove', stableHandlers.current.onPointerMove)
    window.addEventListener('pointerup', stableHandlers.current.onPointerUp)
    window.addEventListener('pointercancel', stableHandlers.current.onPointerCancel)
    window.addEventListener('keydown', stableHandlers.current.onDragKeyDown, true)
  }, [readOnly, positionById])

  const announceStep = useCallback((itemId: string, position: BoardPosition) => {
    const item = items.find((candidate) => candidate.id === itemId)
    if (!item) return
    const total = columnLengthWith(position.columnId, itemId)
    setAnnouncement(labels.boardStep(getItemLabel(item), position.index + 1, total, columnLabel(position.columnId)))
  }, [items, columnLengthWith, labels, getItemLabel, columnLabel])

  const pickUp = useCallback((itemId: string) => {
    if (readOnly) return
    const from = positionById.get(itemId)
    const item = items.find((candidate) => candidate.id === itemId)
    if (!from || !item) return

    setActiveMove({ itemId, from, to: from, via: 'keyboard', withinTrack: true })
    const total = itemsByColumn.get(from.columnId)?.length ?? 0
    const pickedUp = labels.boardPickedUp(getItemLabel(item), from.index + 1, total, columnLabel(from.columnId))
    setAnnouncement(`${pickedUp} ${labels.boardPickedUpInstructions}`.trim())
  }, [readOnly, positionById, items, itemsByColumn, labels, getItemLabel, columnLabel])

  const moveWithinColumn = useCallback((step: number) => {
    const current = activeMoveRef.current
    if (!current || current.via !== 'keyboard') return
    const length = columnLengthWith(current.to.columnId, current.itemId)
    const nextIndex = Math.min(Math.max(current.to.index + step, 0), Math.max(length - 1, 0))
    if (nextIndex === current.to.index) return
    const next = { columnId: current.to.columnId, index: nextIndex }
    announceStep(current.itemId, next)
    setActiveMove({ ...current, to: next })
  }, [columnLengthWith, announceStep])

  const jumpWithinColumn = useCallback((edge: 'start' | 'end') => {
    const current = activeMoveRef.current
    if (!current || current.via !== 'keyboard') return
    const length = columnLengthWith(current.to.columnId, current.itemId)
    const nextIndex = edge === 'start' ? 0 : Math.max(length - 1, 0)
    if (nextIndex === current.to.index) return
    const next = { columnId: current.to.columnId, index: nextIndex }
    announceStep(current.itemId, next)
    setActiveMove({ ...current, to: next })
  }, [columnLengthWith, announceStep])

  const moveToAdjacentColumn = useCallback((step: 1 | -1) => {
    const current = activeMoveRef.current
    if (!current || current.via !== 'keyboard') return
    const order = columns.map((column) => column.id)
    const fromIndex = order.indexOf(current.to.columnId)
    const targetIndex = fromIndex + step
    if (targetIndex < 0 || targetIndex >= order.length) return

    const targetColumnId = order[targetIndex]
    const nativeLength = itemsByColumn.get(targetColumnId)?.length ?? 0
    const nextIndex = sortable ? Math.min(current.to.index, nativeLength) : nativeLength
    const next = { columnId: targetColumnId, index: nextIndex }

    pendingFocusRef.current = { id: current.itemId, kind: 'handle' }
    announceStep(current.itemId, next)
    setActiveMove({ ...current, to: next })
  }, [columns, itemsByColumn, sortable, announceStep])

  const drop = useCallback(() => {
    const current = activeMoveRef.current
    if (!current || current.via !== 'keyboard') return
    const item = items.find((candidate) => candidate.id === current.itemId)
    if (!item) {
      setActiveMove(null)
      return
    }

    const changed = current.to.columnId !== current.from.columnId || current.to.index !== current.from.index

    if (changed) {
      if (current.from.columnId !== current.to.columnId) pendingFocusRef.current = { id: current.itemId, kind: 'handle' }
      onMove({ item, from: current.from, to: current.to })
    }

    const total = columnLengthWith(current.to.columnId, current.itemId)
    setAnnouncement(labels.boardDropped(getItemLabel(item), current.to.index + 1, total, columnLabel(current.to.columnId)))
    setActiveMove(null)
  }, [items, onMove, columnLengthWith, labels, getItemLabel, columnLabel])

  const moveViaMenu = useCallback((itemId: string, targetColumnId: string) => {
    const from = positionById.get(itemId)
    const item = items.find((candidate) => candidate.id === itemId)
    if (!from || !item || from.columnId === targetColumnId) return

    const targetLength = itemsByColumn.get(targetColumnId)?.length ?? 0
    const to = { columnId: targetColumnId, index: sortable ? 0 : targetLength }
    pendingFocusRef.current = { id: itemId, kind: 'menu' }
    onMove({ item, from, to })
    const total = columnLengthWith(targetColumnId, itemId)
    setAnnouncement(labels.boardMovedByMenu(getItemLabel(item), to.index + 1, total, columnLabel(targetColumnId)))
  }, [positionById, items, itemsByColumn, sortable, onMove, columnLengthWith, labels, getItemLabel, columnLabel])

  const moveBySteps = useCallback((itemId: string, step: number) => {
    const from = positionById.get(itemId)
    const item = items.find((candidate) => candidate.id === itemId)
    if (!from || !item) return

    const list = itemsByColumn.get(from.columnId) ?? []
    const index = Math.min(Math.max(from.index + step, 0), list.length - 1)
    if (index === from.index) return

    const to = { columnId: from.columnId, index }
    onMove({ item, from, to })
    setAnnouncement(labels.boardMovedByMenu(getItemLabel(item), index + 1, list.length, columnLabel(from.columnId)))
  }, [positionById, items, itemsByColumn, onMove, labels, getItemLabel, columnLabel])

  useLayoutEffect(() => {
    const pending = pendingFocusRef.current
    if (!pending) return

    const map = pending.kind === 'handle' ? handleRefs.current : menuButtonRefs.current
    const node = map.get(pending.id)

    if (document.activeElement === document.body) {
      if (node) {
        node.focus({ preventScroll: true })
        node.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
      }
      pendingFocusRef.current = null
    } else if (!trackRef.current?.contains(document.activeElement)) {
      pendingFocusRef.current = null
    }
  })

  useEffect(() => () => {
    if (!dragRef.current) return
    stopAutoScroll()
    detachDragListeners()
    document.documentElement.removeAttribute(draggingAttribute)
  }, [stopAutoScroll, detachDragListeners])

  const handleKeyDown = useCallback((itemId: string) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (readOnly) return

    const picked = activeMove?.itemId === itemId && activeMove.via === 'keyboard'

    if (!picked) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        pickUp(itemId)
      }
      return
    }

    const rtl = dir === 'rtl'

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      drop()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      cancel()
    } else if (event.key === 'ArrowUp' && sortable) {
      event.preventDefault()
      moveWithinColumn(-1)
    } else if (event.key === 'ArrowDown' && sortable) {
      event.preventDefault()
      moveWithinColumn(1)
    } else if (event.key === 'Home' && sortable) {
      event.preventDefault()
      jumpWithinColumn('start')
    } else if (event.key === 'End' && sortable) {
      event.preventDefault()
      jumpWithinColumn('end')
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveToAdjacentColumn(rtl ? 1 : -1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveToAdjacentColumn(rtl ? -1 : 1)
    }
  }, [readOnly, activeMove, dir, sortable, pickUp, drop, cancel, moveWithinColumn, jumpWithinColumn, moveToAdjacentColumn])

  const handleBlur = useCallback((itemId: string) => () => {
    if (pendingFocusRef.current) return
    const current = activeMoveRef.current
    if (current?.itemId === itemId && current.via === 'keyboard') cancel()
  }, [cancel])

  const getHandleRef = useCallback((itemId: string): RefCallback<HTMLButtonElement> => (node) => {
    if (node) handleRefs.current.set(itemId, node)
    else handleRefs.current.delete(itemId)
  }, [])

  const getMenuButtonRef = useCallback((itemId: string): RefCallback<HTMLButtonElement> => (node) => {
    if (node) menuButtonRefs.current.set(itemId, node)
    else menuButtonRefs.current.delete(itemId)
  }, [])

  const getCardProps = useCallback((itemId: string) => ({
    ref: ((node: HTMLLIElement | null) => {
      if (node) cardRefs.current.set(itemId, node)
      else cardRefs.current.delete(itemId)
    }) as RefCallback<HTMLLIElement>,
    onPointerDown: (event: ReactPointerEvent<HTMLLIElement>) => {
      if (readOnly || event.pointerType !== 'mouse' || event.button !== 0) return
      const target = event.target as HTMLElement
      if (target.closest('button, a, input, select, textarea, [contenteditable], [role="button"]')) return
      beginDrag(itemId, event)
    },
    onClickCapture: (event: ReactMouseEvent<HTMLLIElement>) => {
      if (suppressClickRef.current !== itemId) return
      suppressClickRef.current = null
      event.preventDefault()
      event.stopPropagation()
    }
  }), [readOnly, beginDrag])

  const getHandleProps = useCallback((itemId: string) => {
    const picked = activeMove?.itemId === itemId && activeMove.via === 'keyboard'
    return {
      ref: getHandleRef(itemId),
      type: 'button' as const,
      'aria-describedby': instructionsId,
      'aria-pressed': picked,
      onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        beginDrag(itemId, event)
      },
      onKeyDown: handleKeyDown(itemId),
      onBlur: handleBlur(itemId)
    }
  }, [activeMove, getHandleRef, instructionsId, beginDrag, handleKeyDown, handleBlur])

  const getMenuButtonProps = useCallback((itemId: string) => ({
    ref: getMenuButtonRef(itemId)
  }), [getMenuButtonRef])

  const getMenuItems = useCallback((itemId: string): BoardMenuEntry[] => {
    const position = positionById.get(itemId)
    if (!position) return []

    const entries: BoardMenuEntry[] = columns.map((column) => ({
      kind: 'column' as const,
      id: column.id,
      title: column.title,
      current: column.id === position.columnId,
      onSelect: () => moveViaMenu(itemId, column.id)
    }))

    if (sortable) {
      const list = itemsByColumn.get(position.columnId) ?? []
      entries.push({ kind: 'separator', id: '__separator__' })
      entries.push({
        kind: 'move',
        id: '__move-up__',
        label: labels.boardMoveUp,
        disabled: position.index === 0,
        onSelect: () => moveBySteps(itemId, -1)
      })
      entries.push({
        kind: 'move',
        id: '__move-down__',
        label: labels.boardMoveDown,
        disabled: position.index === list.length - 1,
        onSelect: () => moveBySteps(itemId, 1)
      })
    }

    return entries
  }, [positionById, columns, sortable, itemsByColumn, labels, moveViaMenu, moveBySteps])

  const columnViews = useMemo((): BoardColumnView<Item>[] => columns.map((column) => {
    const native = itemsByColumn.get(column.id) ?? []
    let cards: BoardCardView<Item>[] = native.map((item) => ({
      item,
      dimmed: activeMove?.via === 'pointer' && activeMove.itemId === item.id,
      picked: activeMove?.via === 'keyboard' && activeMove.itemId === item.id
    }))

    if (activeMove?.via === 'keyboard') {
      if (column.id === activeMove.from.columnId && column.id !== activeMove.to.columnId) {
        cards = cards.filter((card) => card.item.id !== activeMove.itemId)
      } else if (column.id === activeMove.to.columnId) {
        const withoutMoving = cards.filter((card) => card.item.id !== activeMove.itemId)
        const movingItem = items.find((candidate) => candidate.id === activeMove.itemId)
        if (movingItem) withoutMoving.splice(activeMove.to.index, 0, { item: movingItem, dimmed: false, picked: true })
        cards = withoutMoving
      }
    }

    const movedFromStart = activeMove !== null && (activeMove.to.columnId !== activeMove.from.columnId || activeMove.to.index !== activeMove.from.index)
    const isDropTarget = activeMove !== null && activeMove.withinTrack && movedFromStart && column.id === activeMove.to.columnId

    let linePosition: number | null = null
    if (activeMove?.via === 'pointer' && activeMove.withinTrack && movedFromStart && sortable && column.id === activeMove.to.columnId) {
      let count = 0
      linePosition = cards.length
      for (let i = 0; i < cards.length; i += 1) {
        if (cards[i].dimmed) continue
        if (count === activeMove.to.index) {
          linePosition = i
          break
        }
        count += 1
      }
    }

    return { column, cards, isDropTarget, linePosition }
  }), [columns, itemsByColumn, items, activeMove, sortable])

  const getColumnListRef = useCallback((columnId: string): RefCallback<HTMLUListElement> => (node) => {
    if (node) columnListRefs.current.set(columnId, node)
    else columnListRefs.current.delete(columnId)
  }, [])

  const draggingItem = activeMove?.via === 'pointer' ? items.find((item) => item.id === activeMove.itemId) ?? null : null

  return {
    trackRef,
    copyRef,
    dragging: activeMove?.via === 'pointer',
    readOnly,
    sortable,
    labels: labels satisfies BoardLabels,
    instructionsId,
    liveRegionText: announcement,
    draggingItem,
    columns: columnViews,
    getColumnListRef,
    getCardProps,
    getHandleProps,
    getMenuButtonProps,
    getMenuItems
  }
}
