import { forwardRef, useId } from 'react'

import { defaultFullWidth, defaultStep, defaultSteppers, defaultValue } from './defaultData.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useThemeDefaults } from '@components/colorMode/themeDefaults.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useRepeatPress } from '@hooks/useRepeatPress.ts'
import { useNumberField } from '@hooks/useNumberField.ts'
import { MinusIcon } from '../Icon/icons/MinusIcon.tsx'
import { PlusIcon } from '../Icon/icons/PlusIcon.tsx'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { NumberInputProps } from './types.ts'

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    { value, defaultValue: initialValue = defaultValue, onValueChange, min, max, step = defaultStep, largeStep, formatOptions, label, labelPlacement, error, helperText, placeholder, fullWidth = defaultFullWidth, steppers = defaultSteppers, id, name, form, wrapperClassName, wrapperStyle, ...props },
    ref
  ) => {
    const generatedId = useId()
    const { labels } = useUIConfig()
    const field = useNumberField({ value, defaultValue: initialValue, onValueChange, min, max, step, largeStep, formatOptions, disabled: props.disabled, readOnly: props.readOnly })
    const decrease = useRepeatPress(field.decrease, field.canDecrease)
    const increase = useRepeatPress(field.increase, field.canIncrease)
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasLabel = !!label
    const themeDefaults = useThemeDefaults()
    const stacked = (labelPlacement ?? themeDefaults.labelPlacement) === 'stacked'
    const floating = hasLabel && !stacked
    const hasError = !!error
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const wrapper = mergeProps(
      {
        ...slot('number-input'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-label-placement': stacked ? 'stacked' : undefined,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )
    const input = mergeProps(
      {
        ...slot('number-input', 'field'),
        className: styles.input,
        'data-has-label': floating ? '' : undefined,
        'data-has-steppers': steppers ? '' : undefined,
        value: field.text,
        inputMode: field.inputMode,
        autoComplete: 'off',
        autoCorrect: 'off',
        spellCheck: false,
        'aria-valuenow': field.current ?? undefined,
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuetext': field.valueText,
        onChange: field.onTextChange,
        onBeforeInput: field.onBeforeInput,
        onKeyDown: field.onKeyDown,
        onBlur: field.onBlur
      },
      props
    )

    const labelElement = hasLabel && (
      <label htmlFor={inputId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('number-input', 'label')}>
        {label}
      </label>
    )

    return (
      <div {...wrapper}>
        {stacked && labelElement}

        <div className={styles.field} {...slot('number-input', 'control')}>
          <input {...input} ref={ref} id={inputId} type="text" role="spinbutton" placeholder={floating ? (placeholder ?? ' ') : placeholder} aria-invalid={hasError || undefined} aria-describedby={describedBy} />

          {!stacked && labelElement}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={floating ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('number-input', 'outline')}>
            <legend>
              <span>{(floating ? label : undefined) ?? '​'}</span>
            </legend>
          </fieldset>

          {steppers && (
            <div className={styles.steppers} {...slot('number-input', 'steppers')}>
              <button type="button" tabIndex={-1} className={styles.stepper} aria-label={labels.decreaseValue} aria-controls={inputId} disabled={!field.canDecrease} {...decrease} {...slot('number-input', 'decrease')}>
                <MinusIcon size={20} />
              </button>

              <button type="button" tabIndex={-1} className={styles.stepper} aria-label={labels.increaseValue} aria-controls={inputId} disabled={!field.canIncrease} {...increase} {...slot('number-input', 'increase')}>
                <PlusIcon size={20} />
              </button>
            </div>
          )}
        </div>

        {name && <input type="hidden" name={name} form={form} value={field.hiddenValue} disabled={props.disabled} />}

        {steppers && (
          <VisuallyHidden aria-live="polite" aria-atomic="true">
            {field.announcement}
          </VisuallyHidden>
        )}

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('number-input', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('number-input', 'helper')}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'

export default NumberInput
