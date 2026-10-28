import { forwardRef, useId, useRef, useState } from 'react'

import { defaultMax, defaultMin, defaultShowValue, defaultStep, touchSlop } from './defaultData.ts'
import { lastStep, percentOf, snap } from './sliderMath.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { KeyboardEvent, PointerEvent } from 'react'
import type { SliderProps } from './types.ts'

export const Slider = forwardRef<HTMLDivElement, SliderProps>(
  ({ value, defaultValue, onValueChange, min = defaultMin, max = defaultMax, step = defaultStep, label, ariaLabel, formatValue, showValue = defaultShowValue, name, disabled, animation, ...props }, ref) => {
    const labelId = useId()
    const trackRef = useRef<HTMLDivElement>(null)
    const thumbRef = useRef<HTMLDivElement>(null)
    const pointer = useRef<{ id: number; x: number; y: number; engaged: boolean } | null>(null)
    const [dragging, setDragging] = useState(false)
    const [pointerFocus, setPointerFocus] = useState(false)
    const motionStyle = useMotionStyle('fade', 'slider', animation)
    const size = step > 0 ? step : defaultStep
    const top = Math.max(max, min)
    const [stored, setValue] = useControllableState<number>(value, defaultValue ?? min, onValueChange)
    const current = snap(stored, min, top, size)
    const percent = percentOf(current, min, top)
    const text = formatValue ? formatValue(current) : String(current)
    const pageSize = size * Math.max(1, Math.round((top - min) / size / 10))
    const { 'aria-labelledby': labelledBy, ...rest } = props
    const naming = [label ? labelId : undefined, labelledBy].filter(Boolean).join(' ') || undefined

    const moveTo = (clientX: number) => {
      const track = trackRef.current

      if (!track) return

      const box = track.getBoundingClientRect()
      const ratio = box.width > 0 ? Math.min(Math.max((clientX - box.left) / box.width, 0), 1) : 0
      const oriented = getComputedStyle(track).direction === 'rtl' ? 1 - ratio : ratio

      setValue(snap(min + oriented * (top - min), min, top, size))
    }

    const engage = (clientX: number) => {
      thumbRef.current?.focus({ preventScroll: true })
      setPointerFocus(true)
      setDragging(true)
      moveTo(clientX)
    }

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
      if (disabled || pointer.current !== null || (event.pointerType === 'mouse' && event.button !== 0)) return

      const immediate = event.pointerType !== 'touch'

      event.preventDefault()
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, engaged: immediate }
      event.currentTarget.setPointerCapture?.(event.pointerId)

      if (immediate) engage(event.clientX)
    }

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
      const current = pointer.current

      if (!current || current.id !== event.pointerId) return

      if (current.engaged) {
        moveTo(event.clientX)

        return
      }

      const across = Math.abs(event.clientX - current.x)

      if (across < touchSlop || Math.abs(event.clientY - current.y) > across) return

      current.engaged = true
      engage(event.clientX)
    }

    const handlePointerEnd = (event: PointerEvent<HTMLDivElement>, confirmed: boolean) => {
      const current = pointer.current

      if (!current || current.id !== event.pointerId) return

      pointer.current = null

      if (confirmed && !current.engaged) engage(event.clientX)

      setDragging(false)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
      setValue(snap(targets[event.key], min, top, size))
    }

    const root = mergeProps(
      {
        ...slot('slider'),
        className: styles.slider,
        style: motionStyle,
        'data-dragging': dragging ? '' : undefined,
        'data-pointer-focus': pointerFocus ? '' : undefined,
        'data-disabled': disabled ? '' : undefined
      },
      rest
    )

    return (
      <div {...root} ref={ref}>
        {(label || showValue) && (
          <div className={styles.header} {...slot('slider', 'header')}>
            {label && (
              <span id={labelId} className={styles.label} {...slot('slider', 'label')}>
                {label}
              </span>
            )}

            {showValue && (
              <span aria-hidden="true" className={styles.value} {...slot('slider', 'value')}>
                {text}
              </span>
            )}
          </div>
        )}

        <div className={styles.control} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={(event) => handlePointerEnd(event, true)} onPointerCancel={(event) => handlePointerEnd(event, false)} onLostPointerCapture={(event) => handlePointerEnd(event, false)} {...slot('slider', 'control')}>
          <div ref={trackRef} className={styles.track} {...slot('slider', 'track')}>
            <div className={styles.range} style={{ inlineSize: `${percent}%` }} {...slot('slider', 'range')} />

            <div className={styles.anchor} style={{ insetInlineStart: `${percent}%` }}>
              <div
                ref={thumbRef}
                role="slider"
                tabIndex={disabled ? undefined : 0}
                aria-label={ariaLabel}
                aria-labelledby={naming}
                aria-valuemin={min}
                aria-valuemax={top}
                aria-valuenow={current}
                aria-valuetext={formatValue ? text : undefined}
                aria-disabled={disabled || undefined}
                className={styles.thumb}
                onKeyDown={handleKeyDown}
                onBlur={() => setPointerFocus(false)}
                {...slot('slider', 'thumb')}
              />
            </div>
          </div>
        </div>

        {name && <input type="hidden" name={name} value={current} disabled={disabled} />}
      </div>
    )
  }
)

Slider.displayName = 'Slider'

export default Slider
