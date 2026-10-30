import { forwardRef, useId } from 'react'

import { defaultFullWidth, defaultOpen, defaultValue, defaultVariant, popupOffset, popupPlacement } from './defaultData.ts'
import { DatePickerCalendar } from './subcomponentes/DatePickerCalendar/index.tsx'
import { DatePickerToggle } from './subcomponentes/DatePickerToggle/index.tsx'
import { useLabelPlacement } from '@components/colorMode/themeDefaults.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useDatePicker } from './useDatePicker.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { Popover } from '../Popover/index.tsx'
import styles from './styles.module.css'

import type { DatePickerProps } from './types.ts'

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      defaultValue: initialValue = defaultValue,
      onValueChange,
      min,
      max,
      isDateDisabled,
      firstDayOfWeek,
      locale,
      label,
      labelPlacement,
      variant = defaultVariant,
      error,
      helperText,
      placeholder,
      fullWidth = defaultFullWidth,
      open,
      defaultOpen: initiallyOpen = defaultOpen,
      onOpenChange,
      container,
      animation,
      id,
      name,
      form,
      wrapperClassName,
      wrapperStyle,
      popupClassName,
      popupStyle,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const { labels } = useUIConfig()
    const field = useDatePicker({ value, defaultValue: initialValue, onValueChange, min, max, isDateDisabled, locale, disabled: props.disabled, readOnly: props.readOnly, open, defaultOpen: initiallyOpen, onOpenChange })
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const hasLabel = !!label
    const placement = useLabelPlacement(labelPlacement, variant)
    const floating = hasLabel && placement === 'floating'
    const hasError = !!error
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined

    const wrapper = mergeProps(
      {
        ...slot('date-picker'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-label-placement': placement === 'floating' ? undefined : placement,
        'data-variant': variant === defaultVariant ? undefined : variant,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )

    const input = mergeProps(
      {
        ...slot('date-picker', 'input'),
        className: styles.input,
        'data-has-label': floating ? '' : undefined,
        value: field.text,
        autoComplete: 'off',
        autoCorrect: 'off',
        spellCheck: false,
        onChange: field.onTextChange,
        onKeyDown: field.onKeyDown,
        onBlur: field.onBlur
      },
      props
    )

    const labelElement = hasLabel && (
      <label htmlFor={inputId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('date-picker', 'label')}>
        {label}
      </label>
    )

    return (
      <div {...wrapper}>
        {placement !== 'floating' && labelElement}

        <div className={styles.field} {...slot('date-picker', 'control')}>
          <input {...input} ref={ref} id={inputId} type="text" placeholder={floating ? (placeholder ?? ' ') : placeholder} aria-invalid={hasError || undefined} aria-describedby={describedBy} />

          {placement === 'floating' && labelElement}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={floating ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('date-picker', 'outline')}>
            <legend>
              <span>{(floating ? label : undefined) ?? '​'}</span>
            </legend>
          </fieldset>

          <Popover
            open={field.shown}
            onOpenChange={field.setOpen}
            role="dialog"
            label={labels.chooseDate}
            placement={popupPlacement}
            offset={popupOffset}
            container={container}
            animation={animation}
            className={styles.anchor}
            contentClassName={popupClassName}
            contentStyle={popupStyle}
            content={<DatePickerCalendar value={field.current} min={min} max={max} isDateDisabled={isDateDisabled} firstDayOfWeek={firstDayOfWeek} locale={locale} autoFocus={field.autoFocus} onSelect={field.choose} />}
          >
            <DatePickerToggle disabled={field.inert} />
          </Popover>
        </div>

        {name && <input type="hidden" name={name} form={form} value={field.hiddenValue} disabled={props.disabled} />}

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('date-picker', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('date-picker', 'helper')}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker
