import { useRef, useState } from 'react'

import { defaultMax, defaultMin, defaultStep, touchSlop } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { lastStep, percentOf, snap } from './sliderMath.ts'
import { composeProps } from '@utils/composeProps.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'

import type { UseSliderOptions, UseSliderReturn } from './types.ts'
import type { KeyboardEvent, PointerEvent, Ref } from 'react'

type Props = Record<string, unknown>

export const useSlider = ({ value, defaultValue, onValueChange, min = defaultMin, max = defaultMax, step = defaultStep, formatValue, disabled }: UseSliderOptions): UseSliderReturn => {
  const trackRef = useRef<HTMLElement>(null)
  const thumbRef = useRef<HTMLElement>(null)
  const pointer = useRef<{ id: number; x: number; y: number; engaged: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [pointerFocus, setPointerFocus] = useState(false)
  const size = step > 0 ? step : defaultStep
  const top = Math.max(max, min)
  const [stored, setStored] = useControllableState<number>(value, defaultValue ?? min, onValueChange)
  const current = snap(stored, min, top, size)
  const percent = percentOf(current, min, top)
  const text = formatValue ? formatValue(current) : String(current)
  const pageSize = size * Math.max(1, Math.round((top - min) / size / 10))
  const setValue = (next: number) => setStored(snap(next, min, top, size))

  const moveTo = (clientX: number) => {
    const track = trackRef.current

    if (!track) return

    const box = track.getBoundingClientRect()
    const ratio = box.width > 0 ? Math.min(Math.max((clientX - box.left) / box.width, 0), 1) : 0
    const oriented = getComputedStyle(track).direction === 'rtl' ? 1 - ratio : ratio

    setValue(min + oriented * (top - min))
  }

  const engage = (clientX: number) => {
    thumbRef.current?.focus({ preventScroll: true })
    setPointerFocus(true)
    setDragging(true)
    moveTo(clientX)
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (disabled || pointer.current !== null || (event.pointerType === 'mouse' && event.button !== 0)) return

    const immediate = event.pointerType !== 'touch'

    event.preventDefault()
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, engaged: immediate }
    event.currentTarget.setPointerCapture?.(event.pointerId)

    if (immediate) engage(event.clientX)
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const active = pointer.current

    if (!active || active.id !== event.pointerId) return

    if (active.engaged) {
      moveTo(event.clientX)

      return
    }

    const across = Math.abs(event.clientX - active.x)

    if (across < touchSlop || Math.abs(event.clientY - active.y) > across) return

    active.engaged = true
    engage(event.clientX)
  }

  const handlePointerEnd = (event: PointerEvent<HTMLElement>, confirmed: boolean) => {
    const active = pointer.current

    if (!active || active.id !== event.pointerId) return

    pointer.current = null

    if (confirmed && !active.engaged) engage(event.clientX)

    setDragging(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    setPointerFocus(false)

    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return

    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'

    const targets: Record<string, number> = {
      ArrowRight: current + (rtl ? -size : size),
      ArrowLeft: current + (rtl ? size : -size),
      ArrowUp: current + size,
      ArrowDown: current - size,
      PageUp: current + pageSize,
      PageDown: current - pageSize,
      Home: min,
      End: lastStep(min, top, size)
    }

    if (!(event.key in targets)) return

    event.preventDefault()
    setValue(targets[event.key])
  }

  const getTrackProps = ((props?: object) => {
    const { ref, ...rest } = (props ?? {}) as { ref?: Ref<HTMLElement> | undefined } & Props

    return { ref: mergeRefs<HTMLElement>(trackRef, ref), ...rest }
  }) as UseSliderReturn['getTrackProps']

  const getControlProps: UseSliderReturn['getControlProps'] = (props) => {
    const own: ReturnType<UseSliderReturn['getControlProps']> = {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: (event) => handlePointerEnd(event, true),
      onPointerCancel: (event) => handlePointerEnd(event, false),
      onLostPointerCapture: (event) => handlePointerEnd(event, false)
    }

    return composeProps(own, props)
  }

  const getThumbProps = ((props?: object) => {
    const { ref, ...rest } = (props ?? {}) as { ref?: Ref<HTMLElement> | undefined } & Props

    const own: Omit<ReturnType<UseSliderReturn['getThumbProps']>, 'ref'> = {
      role: 'slider',
      tabIndex: disabled ? undefined : 0,
      'aria-valuemin': min,
      'aria-valuemax': top,
      'aria-valuenow': current,
      'aria-valuetext': formatValue ? text : undefined,
      'aria-disabled': disabled ? true : undefined,
      onKeyDown: handleKeyDown,
      onBlur: () => setPointerFocus(false)
    }

    return { ref: mergeRefs<HTMLElement>(thumbRef, ref), ...composeProps(own, rest) }
  }) as UseSliderReturn['getThumbProps']

  return { value: current, percent, valueText: text, dragging, pointerFocus, setValue, getTrackProps, getControlProps, getThumbProps }
}
