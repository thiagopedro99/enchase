import { forwardRef, useId } from 'react'

import { SelectWrapper, Field, StyledSelect, Label, NotchedOutline, SelectIcon, ErrorMessage, HelperText } from './styles.ts'
import { defaultFullWidth } from './defaultData.ts'

import type { SelectProps } from './types.ts'

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, helperText, options, placeholder, $fullWidth = defaultFullWidth, id, ...props }, ref) => {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`
  const helperId = `${selectId}-helper`
  const hasLabel = !!label
  const hasError = !!error
  const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <SelectWrapper $fullWidth={$fullWidth}>
      <Field>
        <StyledSelect {...props} ref={ref} id={selectId} $hasLabel={hasLabel} aria-invalid={hasError || undefined} aria-describedby={describedBy}>
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
        </StyledSelect>

        {hasLabel && (
          <Label htmlFor={selectId} $hasError={hasError}>
            {label}
          </Label>
        )}

        <NotchedOutline aria-hidden="true" $hasLabel={hasLabel} $hasError={hasError}>
          <legend>
            <span>{label ?? '​'}</span>
          </legend>
        </NotchedOutline>

        <SelectIcon aria-hidden="true" />
      </Field>

      {error && (
        <ErrorMessage id={errorId} role="alert">
          {error}
        </ErrorMessage>
      )}

      {helperText && !error && <HelperText id={helperId}>{helperText}</HelperText>}
    </SelectWrapper>
  )
})

Select.displayName = 'Select'

export default Select
