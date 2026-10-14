import { forwardRef, useId, useState } from 'react'

import { EyeOffIcon } from '../Icon/icons/EyeOffIcon.tsx'
import { EyeIcon } from '../Icon/icons/EyeIcon.tsx'
import { defaultFullWidth, defaultPasswordToggle } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { InputProps } from './types.ts'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, placeholder, type, passwordToggle = defaultPasswordToggle, fullWidth = defaultFullWidth, id, wrapperClassName, wrapperStyle, ...props }, ref) => {
    const generatedId = useId()
    const { labels } = useUIConfig()
    const [passwordVisible, setPasswordVisible] = useState(false)
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasLabel = !!label
    const hasError = !!error
    const hasToggle = type === 'password' && passwordToggle
    const inputType = hasToggle && passwordVisible ? 'text' : type
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const wrapper = mergeProps(
      {
        ...slot('input'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )
    const field = mergeProps(
      {
        ...slot('input', 'field'),
        className: styles.input,
        'data-has-label': hasLabel ? '' : undefined,
        'data-has-toggle': hasToggle ? '' : undefined
      },
      props
    )

    return (
      <div {...wrapper}>
        <div className={styles.field} {...slot('input', 'control')}>
          <input {...field} ref={ref} id={inputId} type={inputType} placeholder={hasLabel ? (placeholder ?? ' ') : placeholder} aria-invalid={hasError || undefined} aria-describedby={describedBy} />

          {hasLabel && (
            <label htmlFor={inputId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('input', 'label')}>
              {label}
            </label>
          )}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={hasLabel ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('input', 'outline')}>
            <legend>
              <span>{label ?? '​'}</span>
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
