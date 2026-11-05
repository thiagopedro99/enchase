import { useCallback, useState, useSyncExternalStore } from 'react'

import { shared } from '@utils/shared.ts'

import type { ToastPosition } from './types.ts'
import type { RefCallback } from 'react'

interface ViewportSnapshot {
  owner: symbol | undefined
  element: HTMLElement | null
  paused: boolean
}

interface Viewport {
  claims: symbol[]
  element: HTMLElement | null
  hovered: boolean
  focused: boolean
  flip: (() => void) | undefined
  detach: (() => void) | undefined
  snapshot: ViewportSnapshot
  listeners: Set<() => void>
}

const registry = shared('toastViewport.v1', () => new WeakMap<Element, Map<ToastPosition, Viewport>>())

const idle: ViewportSnapshot = { owner: undefined, element: null, paused: false }

const find = (target: Element | null, position: ToastPosition) => (target ? registry.get(target)?.get(position) : undefined)

const publish = (viewport: Viewport) => {
  viewport.snapshot = { owner: viewport.claims[0], element: viewport.element, paused: viewport.hovered || viewport.focused }
  viewport.listeners.forEach((listener) => listener())
}

const setPause = (viewport: Viewport, key: 'hovered' | 'focused', value: boolean) => {
  if (viewport[key] === value) return

  viewport[key] = value
  publish(viewport)
}

const watch = (viewport: Viewport, element: HTMLElement) => {
  const enter = () => setPause(viewport, 'hovered', true)
  const leave = () => setPause(viewport, 'hovered', false)
  const focusIn = () => setPause(viewport, 'focused', true)
  const focusOut = (event: FocusEvent) => {
    if (!element.contains(event.relatedTarget as Node | null)) setPause(viewport, 'focused', false)
  }

  element.addEventListener('mouseenter', enter)
  element.addEventListener('mouseleave', leave)
  element.addEventListener('focusin', focusIn)
  element.addEventListener('focusout', focusOut)

  return () => {
    element.removeEventListener('mouseenter', enter)
    element.removeEventListener('mouseleave', leave)
    element.removeEventListener('focusin', focusIn)
    element.removeEventListener('focusout', focusOut)
  }
}

const create = (): Viewport => ({ claims: [], element: null, hovered: false, focused: false, flip: undefined, detach: undefined, snapshot: idle, listeners: new Set() })

const reset = (viewport: Viewport) => {
  viewport.detach?.()
  viewport.detach = undefined
  viewport.element = null
  viewport.hovered = false
  viewport.focused = false
  viewport.flip = undefined
}

const claim = (target: HTMLElement, position: ToastPosition, token: symbol, listener: () => void) => {
  const positions = registry.get(target) ?? new Map<ToastPosition, Viewport>()
  const viewport = positions.get(position) ?? create()

  registry.set(target, positions)
  positions.set(position, viewport)
  viewport.claims.push(token)
  viewport.listeners.add(listener)
  publish(viewport)

  return () => {
    const index = viewport.claims.indexOf(token)

    viewport.listeners.delete(listener)

    if (index < 0) return

    viewport.claims.splice(index, 1)

    if (viewport.claims.length === 0) {
      reset(viewport)
      positions.delete(position)
      if (positions.size === 0) registry.delete(target)

      return
    }

    if (index === 0) reset(viewport)

    publish(viewport)
  }
}

const place = (viewport: Viewport, token: symbol, element: HTMLElement | null) => {
  if (viewport.claims[0] !== token || viewport.element === element) return

  viewport.detach?.()
  viewport.detach = element ? watch(viewport, element) : undefined
  viewport.element = element

  if (!element) {
    viewport.hovered = false
    viewport.focused = false
  }

  publish(viewport)
}

export const useToastViewport = (target: HTMLElement | null, position: ToastPosition) => {
  const [token] = useState(() => Symbol('toastViewport'))

  const subscribe = useCallback((listener: () => void) => (target ? claim(target, position, token, listener) : () => undefined), [target, position, token])
  const getSnapshot = useCallback(() => find(target, position)?.snapshot ?? idle, [target, position])
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => idle)

  const setElement = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      const viewport = find(target, position)

      if (viewport) place(viewport, token, element)
    },
    [target, position, token]
  )

  const registerFlip = useCallback(
    (flip: () => void) => {
      const viewport = find(target, position)

      if (!viewport) return undefined

      viewport.flip = flip

      return () => {
        if (viewport.flip === flip) viewport.flip = undefined
      }
    },
    [target, position]
  )

  const reflow = useCallback(() => find(target, position)?.flip?.(), [target, position])

  return { owner: snapshot.owner === token, element: snapshot.element, paused: snapshot.paused, setElement, registerFlip, reflow }
}
