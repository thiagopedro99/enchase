import { forwardRef, useId } from 'react'

import { defaultFullWidth } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SelectProps } from './types.ts'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, fullWidth = defaultFullWidth, id, wrapperClassName, wrapperStyle, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`
    const hasLabel = !!label
    const hasError = !!error
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const wrapper = mergeProps(
      {
        ...slot('select'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )
    const field = mergeProps({ ...slot('select', 'field'), className: styles.select, 'data-has-label': hasLabel ? '' : undefined }, props)

    return (
      <div {...wrapper}>
        <div className={styles.field} {...slot('select', 'control')}>
          <select {...field} ref={ref} id={selectId} aria-invalid={hasError || undefined} aria-describedby={describedBy}>
            {placeholder && (
              <option value="" disabled data-placeholder="">
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {hasLabel && (
            <label htmlFor={selectId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('select', 'label')}>
              {label}
            </label>
          )}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={hasLabel ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('select', 'outline')}>
            <legend>
              <span>{label ?? '​'}</span>
            </legend>
          </fieldset>

          <div aria-hidden="true" className={styles.icon} {...slot('select', 'icon')} />
        </div>

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('select', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('select', 'helper')}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
