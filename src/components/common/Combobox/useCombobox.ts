import { useEffect, useMemo, useState } from 'react'

import { visibleOptions } from './filterOptions.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { useListNavigation } from '@hooks/useListNavigation.ts'

import type { ChangeEvent, KeyboardEvent } from 'react'
import type { ComboboxFilter, ComboboxOption, ComboboxProps } from './types.ts'

type UseComboboxOptions = {
  options: ComboboxOption[]
  multiple: boolean
  value: ComboboxProps['value']
  defaultValue: ComboboxProps['defaultValue']
  onValueChange: ComboboxProps['onValueChange']
  filter: ComboboxFilter | false | undefined
  onInputChange: ((text: string) => void) | undefined
  loading: boolean
  open: boolean | undefined
  defaultOpen: boolean
  onOpenChange: ((open: boolean) => void) | undefined
  disabled: boolean
}

const asList = (input: string | string[] | null | undefined) => {
  if (input === undefined) return undefined
  if (Array.isArray(input)) return input

  return input === null ? [] : [input]
}

export const useCombobox = ({ options, multiple, value, defaultValue, onValueChange, filter, onInputChange, loading, open, defaultOpen, onOpenChange, disabled }: UseComboboxOptions) => {
  const notify = onValueChange as ((value: string | string[] | null) => void) | undefined
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const [selected, setSelected] = useControllableState<string[]>(asList(value), asList(defaultValue) ?? [], (next) => notify?.(multiple ? next : (next[0] ?? null)))
  const [typed, setTyped] = useState<string | null>(null)
  const [active, setActive] = useState(-1)
  const [remembered] = useState(() => new Map<string, string>())
  const labelOf = (optionValue: string) => options.find((option) => option.value === optionValue)?.label ?? remembered.get(optionValue)
  const selectedLabel = !multiple && selected[0] !== undefined ? (labelOf(selected[0]) ?? '') : ''
  const text = typed ?? selectedLabel
  const visible = useMemo(() => visibleOptions(options, typed ?? '', filter), [options, typed, filter])
  const navigate = useListNavigation({ items: visible.map((option) => ({ disabled: option.disabled })) })
  const shown = isOpen && !disabled

  useEffect(() => {
    selected.forEach((selectedValue) => {
      const label = options.find((option) => option.value === selectedValue)?.label

      if (label !== undefined) remembered.set(selectedValue, label)
    })
  }, [options, selected, remembered])

  const close = () => {
    setOpen(false)
    setActive(-1)
  }

  const settle = () => {
    if (!multiple && typed !== null && typed.trim() === '' && selected.length > 0) setSelected([])

    setTyped(null)
    close()
  }

  const choose = (option: ComboboxOption) => {
    if (option.disabled) return

    remembered.set(option.value, option.label)

    if (!multiple) {
      if (selected[0] !== option.value) setSelected([option.value])

      setTyped(null)
      close()

      return
    }

    setSelected(selected.includes(option.value) ? selected.filter((current) => current !== option.value) : [...selected, option.value])

    if (text !== '') onInputChange?.('')

    setTyped(null)
  }

  const remove = (optionValue: string) => setSelected(selected.filter((current) => current !== optionValue))

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTyped(event.target.value)
    setActive(-1)
    setOpen(true)
    onInputChange?.(event.target.value)
  }

  const entry = (event: KeyboardEvent<HTMLInputElement>) => {
    const chosen = multiple ? -1 : visible.findIndex((option) => !option.disabled && selected.includes(option.value))

    if (event.key === 'ArrowDown' && chosen >= 0) return chosen

    return navigate(event, -1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (event.ctrlKey || event.metaKey || event.shiftKey) return

      event.preventDefault()

      if (event.altKey) {
        if (event.key === 'ArrowDown') setOpen(true)
        else close()

        return
      }

      if (!shown) {
        setOpen(true)
        setActive(entry(event) ?? -1)

        return
      }

      const target = navigate(event, active)

      if (target !== undefined) setActive(target)

      return
    }

    if (event.key === 'Enter' && shown && active >= 0 && visible[active]) {
      event.preventDefault()
      choose(visible[active])

      return
    }

    if (event.key === 'Backspace' && multiple && text === '' && selected.length > 0) remove(selected[selected.length - 1])
  }

  return { shown, selected, labelOf, text, visible, empty: visible.length === 0 && !loading, active, setActive, setOpen, close, settle, choose, remove, handleChange, handleKeyDown, floated: text !== '' || (multiple && selected.length > 0) }
}
