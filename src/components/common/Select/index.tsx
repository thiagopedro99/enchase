import { forwardRef, useId } from 'react'

import { defaultFullWidth, defaultVariant } from './defaultData.ts'
import { useLabelPlacement } from '@components/colorMode/themeDefaults.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SelectProps } from './types.ts'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, labelPlacement, variant = defaultVariant, error, helperText, required, options, placeholder, fullWidth = defaultFullWidth, id, wrapperClassName, wrapperStyle, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id ?? generatedId
    const errorId = `${selectId}-error`
    const helperId = `${selectId}-helper`
    const hasLabel = !!label
    const placement = useLabelPlacement(labelPlacement, variant)
    const floating = hasLabel && placement === 'floating'
    const hasError = !!error
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const wrapper = mergeProps(
      {
        ...slot('select'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-label-placement': placement === 'floating' ? undefined : placement,
        'data-variant': variant === defaultVariant ? undefined : variant,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )
    const field = mergeProps({ ...slot('select', 'field'), className: styles.select, 'data-has-label': floating ? '' : undefined }, props)

    const labelElement = hasLabel && (
      <label htmlFor={selectId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('select', 'label')}>
        {label}
        {required && <span aria-hidden="true" className={styles.required} {...slot('select', 'required')} />}
      </label>
    )

    return (
      <div {...wrapper}>
        {placement !== 'floating' && labelElement}

        <div className={styles.field} {...slot('select', 'control')}>
          <select {...field} ref={ref} id={selectId} required={required} aria-invalid={hasError || undefined} aria-describedby={describedBy}>
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

          {placement === 'floating' && labelElement}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={floating ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('select', 'outline')}>
            <legend>
              <span>
                {(floating ? label : undefined) ?? '​'}
                {floating && required && <span className={styles.required} />}
              </span>
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
