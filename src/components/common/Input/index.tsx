import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { defaultFullWidth, defaultPasswordToggle } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { InputProps } from './types.ts'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, placeholder, type, passwordToggle = defaultPasswordToggle, fullWidth = defaultFullWidth, id, className, ...props }, ref) => {
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

    return (
      <div className={styles.wrapper} data-full-width={fullWidth ? '' : undefined}>
        <div className={styles.field}>
          <input
            {...props}
            ref={ref}
            id={inputId}
            type={inputType}
            placeholder={hasLabel ? (placeholder ?? ' ') : placeholder}
            className={classNames(styles.input, className)}
            data-has-label={hasLabel ? '' : undefined}
            data-has-toggle={hasToggle ? '' : undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
          />

          {hasLabel && (
            <label htmlFor={inputId} className={styles.label} data-has-error={hasError ? '' : undefined}>
              {label}
            </label>
          )}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={hasLabel ? '' : undefined} data-has-error={hasError ? '' : undefined}>
            <legend>
              <span>{label ?? '​'}</span>
            </legend>
          </fieldset>

          {hasToggle && (
            <button type="button" className={styles.toggle} onClick={() => setPasswordVisible((visible) => !visible)} disabled={props.disabled} aria-label={passwordVisible ? labels.hidePassword : labels.showPassword}>
              {passwordVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </button>
          )}
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
  }
)

Input.displayName = 'Input'

export default Input
