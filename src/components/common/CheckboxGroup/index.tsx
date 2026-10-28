import { forwardRef, useId } from 'react'

import { defaultOrientation } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { Checkbox } from '../Checkbox/index.tsx'
import styles from './styles.module.css'

import type { ChangeEvent } from 'react'
import type { CheckboxGroupProps } from './types.ts'

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  ({ options, label, name, value, defaultValue, onValueChange, error, helperText, orientation = defaultOrientation, animation, id, ...props }, ref) => {
    const generatedId = useId()
    const groupId = id ?? generatedId
    const errorId = `${groupId}-error`
    const helperId = `${groupId}-helper`
    const hasError = !!error
    const controlled = value !== undefined
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const root = mergeProps(
      {
        ...slot('checkbox-group'),
        className: styles.group,
        'data-orientation': orientation,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      props
    )

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const boxes = event.currentTarget.closest('fieldset')?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') ?? []

      onValueChange?.([...boxes].filter((box) => box.checked).map((box) => box.value))
    }

    return (
      <fieldset {...root} ref={ref} id={groupId} aria-describedby={describedBy}>
        {label && (
          <legend className={styles.legend} {...slot('checkbox-group', 'legend')}>
            {label}
          </legend>
        )}

        <div className={styles.options} {...slot('checkbox-group', 'options')}>
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              name={name}
              value={option.value}
              checked={controlled ? value.includes(option.value) : undefined}
              defaultChecked={controlled ? undefined : defaultValue?.includes(option.value)}
              disabled={props.disabled || option.disabled}
              aria-invalid={hasError || undefined}
              animation={animation}
              onChange={handleChange}
            />
          ))}
        </div>

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('checkbox-group', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('checkbox-group', 'helper')}>
            {helperText}
          </span>
        )}
      </fieldset>
    )
  }
)

CheckboxGroup.displayName = 'CheckboxGroup'

export default CheckboxGroup
