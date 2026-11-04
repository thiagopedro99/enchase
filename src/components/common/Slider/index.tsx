import { forwardRef, useId } from 'react'

import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { defaultShowValue } from './defaultData.ts'
import { useSlider } from './useSlider.ts'
import styles from './styles.module.css'

import type { SliderProps } from './types.ts'

export const Slider = forwardRef<HTMLDivElement, SliderProps>(({ value, defaultValue, onValueChange, min, max, step, label, ariaLabel, formatValue, showValue = defaultShowValue, name, disabled, animation, ...props }, ref) => {
  const labelId = useId()
  const slider = useSlider({ value, defaultValue, onValueChange, min, max, step, formatValue, disabled })
  const motionStyle = useMotionStyle('fade', 'slider', animation)
  const { 'aria-labelledby': labelledBy, ...rest } = props
  const naming = [label ? labelId : undefined, labelledBy].filter(Boolean).join(' ') || undefined

  const root = mergeProps(
    {
      ...slot('slider'),
      className: styles.slider,
      style: motionStyle,
      'data-dragging': slider.dragging ? '' : undefined,
      'data-pointer-focus': slider.pointerFocus ? '' : undefined,
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
              {slider.valueText}
            </span>
          )}
        </div>
      )}

      <div {...slider.getControlProps({ className: styles.control, ...slot('slider', 'control') })}>
        <div {...slider.getTrackProps({ className: styles.track, ...slot('slider', 'track') })}>
          <div className={styles.range} style={{ inlineSize: `${slider.percent}%` }} {...slot('slider', 'range')} />

          <div className={styles.anchor} style={{ insetInlineStart: `${slider.percent}%` }}>
            <div {...slider.getThumbProps({ 'aria-label': ariaLabel, 'aria-labelledby': naming, className: styles.thumb, ...slot('slider', 'thumb') })} />
          </div>
        </div>
      </div>

      {name && <input type="hidden" name={name} value={slider.value} disabled={disabled} />}
    </div>
  )
})

Slider.displayName = 'Slider'

export default Slider
