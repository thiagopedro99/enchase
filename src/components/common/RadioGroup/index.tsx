import { forwardRef, useId } from 'react'

import { defaultOrientation, dotBase } from './defaultData.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { RadioGroupProps } from './types.ts'

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  ({ options, label, name, value, defaultValue, onValueChange, required, error, helperText, orientation = defaultOrientation, animation, id, ...props }, ref) => {
    const generatedId = useId()
    const groupId = id ?? generatedId
    const errorId = `${groupId}-error`
    const helperId = `${groupId}-helper`
    const hasError = !!error
    const controlled = value !== undefined
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const motionStyle = useMotionStyle('pop', 'radio-group', animation, undefined, dotBase)
    const root = mergeProps(
      {
        ...slot('radio-group'),
        className: styles.group,
        style: motionStyle,
        'data-orientation': orientation,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      props
    )

    return (
      <fieldset {...root} ref={ref} id={groupId} role="radiogroup" aria-invalid={hasError || undefined} aria-required={required || undefined} aria-describedby={describedBy}>
        {label && (
          <legend className={styles.legend} {...slot('radio-group', 'legend')}>
            {label}
          </legend>
        )}

        <div className={styles.options} {...slot('radio-group', 'options')}>
          {options.map((option) => (
            <label key={option.value} className={styles.option} data-disabled={props.disabled || option.disabled ? '' : undefined} {...slot('radio-group', 'option')}>
              <input
                type="radio"
                className={styles.hidden}
                name={name ?? generatedId}
                value={option.value}
                checked={controlled ? value === option.value : undefined}
                defaultChecked={controlled ? undefined : option.value === defaultValue}
                disabled={option.disabled}
                required={required}
                onChange={() => onValueChange?.(option.value)}
                {...slot('radio-group', 'input')}
              />
              <span className={styles.control} aria-hidden="true" {...slot('radio-group', 'control')}>
                <span className={styles.dot} />
              </span>
              <span className={styles.label} {...slot('radio-group', 'label')}>
                {option.label}
              </span>
            </label>
          ))}
        </div>

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('radio-group', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('radio-group', 'helper')}>
            {helperText}
          </span>
        )}
      </fieldset>
    )
  }
)

RadioGroup.displayName = 'RadioGroup'

export default RadioGroup
