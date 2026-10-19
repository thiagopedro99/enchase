import { forwardRef, useId } from 'react'

import { defaultFullWidth, defaultResize, defaultRows } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { TextareaProps } from './types.ts'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, placeholder, fullWidth = defaultFullWidth, resize = defaultResize, rows = defaultRows, id, wrapperClassName, wrapperStyle, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id ?? generatedId
    const errorId = `${textareaId}-error`
    const helperId = `${textareaId}-helper`
    const hasLabel = !!label
    const hasError = !!error
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined
    const wrapper = mergeProps(
      {
        ...slot('textarea'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )
    const field = mergeProps(
      {
        ...slot('textarea', 'field'),
        className: styles.textarea,
        'data-has-label': hasLabel ? '' : undefined,
        'data-resize': resize
      },
      props
    )

    return (
      <div {...wrapper}>
        <div className={styles.field} {...slot('textarea', 'control')}>
          <textarea {...field} ref={ref} id={textareaId} rows={rows} placeholder={hasLabel ? (placeholder ?? ' ') : placeholder} aria-invalid={hasError || undefined} aria-describedby={describedBy} />

          {hasLabel && (
            <label htmlFor={textareaId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('textarea', 'label')}>
              {label}
            </label>
          )}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={hasLabel ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('textarea', 'outline')}>
            <legend>
              <span>{label ?? '​'}</span>
            </legend>
          </fieldset>
        </div>

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('textarea', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('textarea', 'helper')}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
