import { forwardRef, useId, useState } from 'react'

import { EyeOffIcon } from '../Icon/icons/EyeOffIcon.tsx'
import { EyeIcon } from '../Icon/icons/EyeIcon.tsx'
import { defaultFullWidth, defaultPasswordToggle, defaultVariant } from './defaultData.ts'
import { useLabelPlacement } from '@components/colorMode/themeDefaults.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { InputProps } from './types.ts'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, labelPlacement, variant = defaultVariant, error, helperText, placeholder, type, passwordToggle = defaultPasswordToggle, fullWidth = defaultFullWidth, id, wrapperClassName, wrapperStyle, ...props }, ref) => {
    const generatedId = useId()
    const { labels } = useUIConfig()
    const [passwordVisible, setPasswordVisible] = useState(false)
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasLabel = !!label
    const placement = useLabelPlacement(labelPlacement, variant)
    const stacked = placement === 'stacked'
    const floating = hasLabel && !stacked
    const hasError = !!error
    const hasToggle = type === 'password' && passwordToggle
    const inputType = hasToggle && passwordVisible ? 'text' : type
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const wrapper = mergeProps(
      {
        ...slot('input'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-label-placement': stacked ? 'stacked' : undefined,
        'data-variant': variant === defaultVariant ? undefined : variant,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )
    const field = mergeProps(
      {
        ...slot('input', 'field'),
        className: styles.input,
        'data-has-label': floating ? '' : undefined,
        'data-has-toggle': hasToggle ? '' : undefined
      },
      props
    )

    const labelElement = hasLabel && (
      <label htmlFor={inputId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('input', 'label')}>
        {label}
      </label>
    )

    return (
      <div {...wrapper}>
        {stacked && labelElement}

        <div className={styles.field} {...slot('input', 'control')}>
          <input {...field} ref={ref} id={inputId} type={inputType} placeholder={floating ? (placeholder ?? ' ') : placeholder} aria-invalid={hasError || undefined} aria-describedby={describedBy} />

          {!stacked && labelElement}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={floating ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('input', 'outline')}>
            <legend>
              <span>{(floating ? label : undefined) ?? '​'}</span>
            </legend>
          </fieldset>

          {hasToggle && (
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setPasswordVisible((visible) => !visible)}
              disabled={props.disabled}
              aria-label={passwordVisible ? labels.hidePassword : labels.showPassword}
              {...slot('input', 'toggle')}
            >
              {passwordVisible ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          )}
        </div>

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('input', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('input', 'helper')}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
