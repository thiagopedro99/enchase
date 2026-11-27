import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'

import { defaultOrientation } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'
import { Checkbox } from '../Checkbox/index.tsx'
import styles from './styles.module.css'

import type { ChangeEvent } from 'react'
import type { CheckboxGroupProps } from './types.ts'

export const CheckboxGroup = forwardRef<HTMLFieldSetElement, CheckboxGroupProps>(
  ({ options, label, name, value, defaultValue, onValueChange, required, error, helperText, orientation = defaultOrientation, animation, id, ...props }, ref) => {
    const generatedId = useId()
    const groupId = id ?? generatedId
    const errorId = `${groupId}-error`
    const helperId = `${groupId}-helper`
    const hasError = !!error
    const controlled = value !== undefined
    const groupRef = useRef<HTMLFieldSetElement>(null)
    const mergedRef = useMemo(() => mergeRefs(groupRef, ref), [ref])
    const [chosen, setChosen] = useState(defaultValue?.length ?? 0)
    const missing = Boolean(required) && (controlled ? value.length : chosen) === 0
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

      const next = [...boxes].filter((box) => box.checked).map((box) => box.value)

      setChosen(next.length)
      onValueChange?.(next)
    }

    useEffect(() => {
      const form = required ? groupRef.current?.form : null
      const restore = () => setChosen(defaultValue?.length ?? 0)

      form?.addEventListener('reset', restore)

      return () => form?.removeEventListener('reset', restore)
    }, [required, defaultValue])

    return (
      <fieldset {...root} ref={mergedRef} id={groupId} aria-describedby={describedBy}>
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
              required={missing || undefined}
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
