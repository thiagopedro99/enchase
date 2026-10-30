import { forwardRef, useId } from 'react'

import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SwitchProps } from './types.ts'

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ label, error, helperText, wrapperClassName, wrapperStyle, animation, ...props }, ref) => {
  const generatedId = useId()
  const motionStyle = useMotionStyle('fade', 'switch', animation)
  const fieldId = props.id ?? generatedId
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-helper`
  const hasError = !!error
  const messageId = hasError ? errorId : helperText ? helperId : undefined
  const hasMessage = messageId !== undefined
  const describedBy = hasMessage ? [props['aria-describedby'], messageId].filter(Boolean).join(' ') : props['aria-describedby']
  const wrapper = mergeProps({ ...slot('switch'), className: styles.wrapper, style: motionStyle, 'data-disabled': props.disabled ? '' : undefined }, { className: wrapperClassName, style: wrapperStyle })
  const field = mergeProps({ ...slot('switch', 'input'), className: styles.hidden }, props)

  return (
    <span className={styles.field} data-has-message={hasMessage ? '' : undefined} {...slot('switch', 'field')}>
      <label {...wrapper}>
        <input ref={ref} {...field} type="checkbox" role="switch" aria-invalid={hasError ? true : props['aria-invalid']} aria-describedby={describedBy} />
        <span className={styles.track} aria-hidden="true" {...slot('switch', 'track')}>
          <span className={styles.thumb} {...slot('switch', 'thumb')} />
        </span>
        {label && (
          <span className={styles.label} {...slot('switch', 'label')}>
            {label}
          </span>
        )}
      </label>

      {error && (
        <span id={errorId} role="alert" className={styles.error} {...slot('switch', 'error')}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} className={styles.helper} {...slot('switch', 'helper')}>
          {helperText}
        </span>
      )}
    </span>
  )
})

Switch.displayName = 'Switch'

export default Switch
