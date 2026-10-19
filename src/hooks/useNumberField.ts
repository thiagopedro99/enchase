import { useMemo, useRef, useState } from 'react'

import { clampNumber, decimalPlaces, stepNumber } from '@utils/stepNumber.ts'
import { createNumberFormat } from '@utils/numberFormat.ts'
import { useControllableState } from './useControllableState.ts'
import { useUIConfig } from './useUIConfig.ts'

import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import type { NumberFormatOptions } from '@utils/numberFormat.ts'

export type NumberFieldOptions = {
  value?: number | null
  defaultValue: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step: number
  largeStep?: number
  formatOptions?: NumberFormatOptions
  disabled?: boolean
  readOnly?: boolean
}

const positive = (value: number | undefined, fallback: number) => (value !== undefined && Number.isFinite(value) && value > 0 ? value : fallback)

export const useNumberField = ({ value, defaultValue, onValueChange, min, max, step, largeStep, formatOptions, disabled, readOnly }: NumberFieldOptions) => {
  const { locale } = useUIConfig()
  const [current, setCurrent] = useControllableState<number | null>(value, defaultValue, onValueChange)
  const smallStep = positive(step, 1)
  const bigStep = positive(largeStep, smallStep * 10)
  const optionsKey = JSON.stringify(formatOptions ?? {})
  const precision = Math.max(Math.max(decimalPlaces(smallStep), decimalPlaces(bigStep)) - (formatOptions?.style === 'percent' ? 2 : 0), 0)
  const numbers = useMemo(() => createNumberFormat(locale, JSON.parse(optionsKey) as NumberFormatOptions, precision), [locale, optionsKey, precision])
  const show = (amount: number | null) => (amount === null ? '' : numbers.format(amount))
  const [draft, setDraft] = useState({ value: current, numbers, text: show(current), dirty: false })
  const [announcement, setAnnouncement] = useState('')
  const latest = useRef(current)
  const allowNegative = min === undefined || min < 0

  if (!Object.is(draft.value, current) || draft.numbers !== numbers) setDraft({ value: current, numbers, text: show(current), dirty: false })

  latest.current = current

  const commit = (next: number | null) => {
    latest.current = next
    setCurrent(next)
    setDraft({ value: current, numbers, text: show(current), dirty: false })
  }

  const typed = () => {
    if (!draft.dirty) return latest.current

    const text = draft.text.trim()
    const parsed = text === '' ? null : numbers.parse(text)

    return parsed !== null && Number.isNaN(parsed) ? latest.current : parsed
  }

  const commitText = () => {
    if (!draft.dirty) return

    const text = draft.text.trim()

    if (text === '') return commit(null)

    const parsed = numbers.parse(text)

    commit(Number.isNaN(parsed) ? current : clampNumber(numbers.normalize(parsed), min, max))
  }

  const stepBy = (direction: 1 | -1, amount: number) => {
    if (disabled || readOnly) return null

    const from = typed()
    const next = from === null ? clampNumber(direction > 0 ? (min ?? 0) : (max ?? 0), min, max) : stepNumber(from, direction, amount, min, max)
    const normalized = clampNumber(numbers.normalize(next), min, max)

    commit(normalized)

    return normalized
  }

  const press = (direction: 1 | -1) => {
    const next = stepBy(direction, smallStep)

    if (next !== null) setAnnouncement(numbers.format(next))
  }

  const jumpTo = (limit: number | undefined) => {
    if (limit === undefined || disabled || readOnly) return false

    commit(clampNumber(numbers.normalize(limit), min, max))

    return true
  }

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value

    if (numbers.isPartial(text, allowNegative)) setDraft({ ...draft, text, dirty: true })
  }

  const onBeforeInput = (event: FormEvent<HTMLInputElement>) => {
    const data = (event as FormEvent<HTMLInputElement> & { data?: string | null }).data
    const input = event.currentTarget

    if (!data || !input) return

    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? start

    if (!numbers.isPartial(`${input.value.slice(0, start)}${data}${input.value.slice(end)}`, allowNegative)) event.preventDefault()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.nativeEvent.isComposing || readOnly || disabled) return

    if (event.key === 'Enter') return commitText()

    const amount = event.shiftKey ? bigStep : smallStep
    const keys: Record<string, () => unknown> = {
      ArrowUp: () => stepBy(1, amount),
      ArrowDown: () => stepBy(-1, amount),
      PageUp: () => stepBy(1, bigStep),
      PageDown: () => stepBy(-1, bigStep),
      Home: () => jumpTo(min),
      End: () => jumpTo(max)
    }
    const handled = keys[event.key]?.()

    if (handled !== undefined && handled !== false) event.preventDefault()
  }

  const editable = !disabled && !readOnly
  const basis = typed()

  return {
    text: draft.text,
    current,
    numbers,
    announcement,
    canIncrease: editable && (basis === null || max === undefined || basis < max),
    canDecrease: editable && (basis === null || min === undefined || basis > min),
    increase: () => press(1),
    decrease: () => press(-1),
    onTextChange,
    onBeforeInput,
    onKeyDown,
    onBlur: commitText,
    hiddenValue: current === null ? '' : String(current),
    valueText: current === null ? undefined : numbers.format(current),
    inputMode: numbers.fractionDigits > 0 ? ('decimal' as const) : ('numeric' as const)
  }
}
