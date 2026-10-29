import { forwardRef, useId, useLayoutEffect, useMemo, useRef } from 'react'

import { defaultIndeterminate } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'
import styles from './styles.module.css'

import type { CheckboxProps } from './types.ts'

const markBase = { duration: 0.15, scale: 0.6, distance: 0 }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, error, helperText, indeterminate = defaultIndeterminate, wrapperClassName, wrapperStyle, animation, ...props }, ref) => {
  const generatedId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const indeterminateRef = useRef(indeterminate)
  const mergedRef = useMemo(() => mergeRefs(inputRef, ref), [ref])
  const motionStyle = useMotionStyle('pop', 'checkbox', animation, undefined, markBase)
  const fieldId = props.id ?? generatedId
  const errorId = `${fieldId}-error`
  const helperId = `${fieldId}-helper`
  const hasError = !!error
  const messageId = hasError ? errorId : helperText ? helperId : undefined
  const hasMessage = messageId !== undefined
  const describedBy = hasMessage ? [props['aria-describedby'], messageId].filter(Boolean).join(' ') : props['aria-describedby']

  const keepIndeterminate = () => {
    queueMicrotask(() => {
      if (inputRef.current) inputRef.current.indeterminate = indeterminateRef.current
    })
  }

  const wrapper = mergeProps({ ...slot('checkbox'), className: styles.wrapper, style: motionStyle, 'data-disabled': props.disabled ? '' : undefined }, { className: wrapperClassName, style: wrapperStyle })
  const field = mergeProps({ ...slot('checkbox', 'input'), className: styles.hidden, onClick: keepIndeterminate }, props)

  useLayoutEffect(() => {
    indeterminateRef.current = indeterminate

    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <span className={styles.field} data-has-message={hasMessage ? '' : undefined} {...slot('checkbox', 'field')}>
      <label {...wrapper}>
        <input ref={mergedRef} type="checkbox" {...field} aria-invalid={hasError ? true : props['aria-invalid']} aria-describedby={describedBy} />
        <span className={styles.box} aria-hidden="true" {...slot('checkbox', 'box')}>
          <span className={styles.icon} />
        </span>
        {label && (
          <span className={styles.label} {...slot('checkbox', 'label')}>
            {label}
          </span>
        )}
      </label>

      {error && (
        <span id={errorId} role="alert" className={styles.error} {...slot('checkbox', 'error')}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} className={styles.helper} {...slot('checkbox', 'helper')}>
          {helperText}
        </span>
      )}
    </span>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
