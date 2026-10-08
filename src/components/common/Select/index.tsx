import { forwardRef, useId } from 'react'

import { defaultFullWidth } from './defaultData.ts'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { SelectProps } from './types.ts'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, helperText, options, placeholder, fullWidth = defaultFullWidth, id, className, ...props }, ref) => {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`
  const hasLabel = !!label
  const hasError = !!error
  const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className={styles.wrapper} data-full-width={fullWidth ? '' : undefined}>
      <div className={styles.field}>
        <select {...props} ref={ref} id={selectId} className={classNames(styles.select, className)} data-has-label={hasLabel ? '' : undefined} aria-invalid={hasError || undefined} aria-describedby={describedBy}>
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
          <label htmlFor={selectId} className={styles.label} data-has-error={hasError ? '' : undefined}>
            {label}
          </label>
        )}

        <fieldset aria-hidden="true" className={styles.outline} data-has-label={hasLabel ? '' : undefined} data-has-error={hasError ? '' : undefined}>
          <legend>
            <span>{label ?? '​'}</span>
          </legend>
        </fieldset>

        <div aria-hidden="true" className={styles.icon} />
      </div>

      {error && (
        <span id={errorId} role="alert" className={styles.error}>
          {error}
        </span>
      )}

      {helperText && !error && (
        <span id={helperId} className={styles.helper}>
          {helperText}
        </span>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
