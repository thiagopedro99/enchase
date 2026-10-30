import { forwardRef, useId, useMemo, useRef } from 'react'

import { defaultFullWidth, defaultLoading, defaultMultiple, defaultOpen, defaultVariant } from './defaultData.ts'
import { ComboboxOptions } from './subcomponentes/ComboboxOptions/index.tsx'
import { ComboboxToggle } from './subcomponentes/ComboboxToggle/index.tsx'
import { useLabelPlacement } from '@components/colorMode/themeDefaults.ts'
import { ComboboxTags } from './subcomponentes/ComboboxTags/index.tsx'
import { ListboxPopup } from './subcomponentes/ListboxPopup/index.tsx'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'
import { useCombobox } from './useCombobox.ts'
import { optionIdOf } from './optionId.ts'
import styles from './styles.module.css'

import type { FocusEvent } from 'react'
import type { ComboboxProps } from './types.ts'

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      options,
      multiple = defaultMultiple,
      value,
      defaultValue,
      onValueChange,
      label,
      labelPlacement,
      variant = defaultVariant,
      error,
      helperText,
      placeholder,
      fullWidth = defaultFullWidth,
      filter,
      onInputChange,
      loading = defaultLoading,
      open,
      defaultOpen: initiallyOpen = defaultOpen,
      onOpenChange,
      name,
      form,
      container,
      animation,
      id,
      wrapperClassName,
      wrapperStyle,
      listboxClassName,
      listboxStyle,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const { labels } = useUIConfig()
    const controlRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const mergedRef = useMemo(() => mergeRefs(inputRef, ref), [ref])
    const inputId = id ?? generatedId
    const listboxId = `${inputId}-listbox`
    const labelId = `${inputId}-label`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const inert = !!(props.disabled || props.readOnly)
    const hasLabel = !!label
    const placement = useLabelPlacement(labelPlacement, variant)
    const stacked = placement === 'stacked'
    const floating = hasLabel && !stacked
    const hasError = !!error

    const combobox = useCombobox({ options, multiple, value, defaultValue, onValueChange, filter, onInputChange, loading, open, defaultOpen: initiallyOpen, onOpenChange, disabled: inert })

    const controls = combobox.shown ? listboxId : undefined
    const activeId = combobox.shown && combobox.visible[combobox.active] ? optionIdOf(inputId, combobox.active) : undefined
    const describedBy = [props['aria-describedby'], error ? errorId : helperText ? helperId : undefined].filter(Boolean).join(' ') || undefined

    const wrapper = mergeProps(
      {
        ...slot('combobox'),
        className: styles.wrapper,
        'data-full-width': fullWidth ? '' : undefined,
        'data-label-placement': stacked ? 'stacked' : undefined,
        'data-variant': variant === defaultVariant ? undefined : variant,
        'data-invalid': hasError ? '' : undefined,
        'data-disabled': props.disabled ? '' : undefined
      },
      { className: wrapperClassName, style: wrapperStyle }
    )

    const input = mergeProps(
      {
        ...slot('combobox', 'input'),
        className: styles.input,
        'data-has-label': floating ? '' : undefined,
        value: combobox.text,
        autoComplete: 'off',
        autoCorrect: 'off',
        spellCheck: false,
        onChange: combobox.handleChange,
        onKeyDown: combobox.handleKeyDown,
        onClick: () => !inert && combobox.setOpen(true)
      },
      props
    )

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return

      combobox.settle()
    }

    const removeTag = (tagValue: string) => {
      combobox.remove(tagValue)
      inputRef.current?.focus()
    }

    const toggle = () => {
      if (combobox.shown) combobox.close()
      else combobox.setOpen(true)

      inputRef.current?.focus()
    }

    const labelElement = hasLabel && (
      <label id={labelId} htmlFor={inputId} className={styles.label} data-has-error={hasError ? '' : undefined} {...slot('combobox', 'label')}>
        {label}
      </label>
    )

    return (
      <div {...wrapper}>
        {stacked && labelElement}

        <div
          ref={controlRef}
          className={styles.field}
          data-floated={combobox.floated ? '' : undefined}
          data-multiple={multiple ? '' : undefined}
          onBlur={handleBlur}
          onClick={(event) => {
            if (inert || event.target !== event.currentTarget) return

            inputRef.current?.focus()
            combobox.setOpen(true)
          }}
          {...slot('combobox', 'control')}
        >
          {multiple && <ComboboxTags values={combobox.selected} labelOf={combobox.labelOf} onRemove={inert ? undefined : removeTag} />}

          <input
            {...input}
            ref={mergedRef}
            id={inputId}
            type="text"
            role="combobox"
            placeholder={placeholder}
            aria-expanded={combobox.shown}
            aria-controls={controls}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
          />

          {!stacked && labelElement}

          <fieldset aria-hidden="true" className={styles.outline} data-has-label={floating ? '' : undefined} data-has-error={hasError ? '' : undefined} {...slot('combobox', 'outline')}>
            <legend>
              <span>{(floating ? label : undefined) ?? '​'}</span>
            </legend>
          </fieldset>

          <ComboboxToggle expanded={combobox.shown} controls={controls} disabled={inert} onToggle={toggle} />
        </div>

        <ListboxPopup
          open={combobox.shown}
          anchorRef={controlRef}
          id={listboxId}
          labelledBy={hasLabel ? labelId : undefined}
          label={props['aria-label']}
          multiple={multiple}
          busy={loading}
          container={container}
          animation={animation}
          className={listboxClassName}
          style={listboxStyle}
          onClose={combobox.close}
        >
          <ComboboxOptions
            options={combobox.visible}
            selected={combobox.selected}
            active={combobox.active}
            idPrefix={inputId}
            empty={combobox.empty}
            loading={loading}
            onActivate={combobox.setActive}
            onChoose={combobox.choose}
          />
        </ListboxPopup>

        {name && combobox.selected.map((selectedValue) => <input key={selectedValue} type="hidden" name={name} form={form} value={selectedValue} disabled={props.disabled} />)}

        <VisuallyHidden role="status">{loading ? labels.loading : combobox.shown && combobox.empty ? labels.noResults : null}</VisuallyHidden>

        {error && (
          <span id={errorId} role="alert" className={styles.error} {...slot('combobox', 'error')}>
            {error}
          </span>
        )}

        {helperText && !error && (
          <span id={helperId} className={styles.helper} {...slot('combobox', 'helper')}>
            {helperText}
          </span>
        )}
      </div>
    )
  }
)

Combobox.displayName = 'Combobox'

export default Combobox
