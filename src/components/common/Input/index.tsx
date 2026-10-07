import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { InputWrapper, Field, StyledInput, Label, NotchedOutline, PasswordToggleButton, ErrorMessage, HelperText } from './styles.ts'
import { defaultFullWidth, defaultPasswordToggle } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { InputProps } from './types.ts'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, placeholder, type, passwordToggle = defaultPasswordToggle, $fullWidth = defaultFullWidth, id, ...props }, ref) => {
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
      <InputWrapper $fullWidth={$fullWidth}>
        <Field>
          <StyledInput
            {...props}
            ref={ref}
            id={inputId}
            type={inputType}
            placeholder={hasLabel ? (placeholder ?? ' ') : placeholder}
            $hasLabel={hasLabel}
            $hasToggle={hasToggle}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
          />

          {hasLabel && (
            <Label htmlFor={inputId} $hasError={hasError}>
              {label}
            </Label>
          )}

          <NotchedOutline aria-hidden="true" $hasLabel={hasLabel} $hasError={hasError}>
            <legend>
              <span>{label ?? '​'}</span>
            </legend>
          </NotchedOutline>

          {hasToggle && (
            <PasswordToggleButton type="button" onClick={() => setPasswordVisible((visible) => !visible)} disabled={props.disabled} aria-label={passwordVisible ? labels.hidePassword : labels.showPassword}>
              {passwordVisible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
            </PasswordToggleButton>
          )}
        </Field>

        {error && (
          <ErrorMessage id={errorId} role="alert">
            {error}
          </ErrorMessage>
        )}

        {helperText && !error && <HelperText id={helperId}>{helperText}</HelperText>}
      </InputWrapper>
    )
  }
)

Input.displayName = 'Input'

export default Input
