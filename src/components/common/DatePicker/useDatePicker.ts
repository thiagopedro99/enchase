import { useMemo, useRef, useState } from 'react'

import { formatIsoDate, isWithin, parseIsoDate } from '@utils/calendarDate.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { createDateFormat } from '@utils/dateFormat.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { ChangeEvent, KeyboardEvent } from 'react'
import type { CalendarDate } from '@utils/calendarDate.ts'

export type DatePickerOptions = {
  value: string | null | undefined
  defaultValue: string | null
  onValueChange: ((value: string | null) => void) | undefined
  min: string | undefined
  max: string | undefined
  isDateDisabled: ((date: string) => boolean) | undefined
  locale: string | undefined
  disabled: boolean | undefined
  readOnly: boolean | undefined
  open: boolean | undefined
  defaultOpen: boolean
  onOpenChange: ((open: boolean) => void) | undefined
}

const read = (text: string | null | undefined) => (text ? parseIsoDate(text) : null)

export const useDatePicker = ({ value, defaultValue, onValueChange, min, max, isDateDisabled, locale: localeOverride, disabled, readOnly, open, defaultOpen, onOpenChange }: DatePickerOptions) => {
  const { locale } = useUIConfig()
  const tag = localeOverride ?? locale
  const format = useMemo(() => createDateFormat(tag), [tag])
  const [current, setCurrent] = useControllableState<string | null>(value, defaultValue, onValueChange)
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const selected = read(current)
  const earliest = read(min)
  const latest = read(max)
  const inert = !!(disabled || readOnly)
  const shown = isOpen && !inert
  const show = (date: CalendarDate | null) => (date ? format.format(date) : '')
  const [draft, setDraft] = useState({ value: current, format, text: show(selected), dirty: false })
  const session = useRef({ shown, focus: false })

  if (draft.value !== current || draft.format !== format) setDraft({ value: current, format, text: show(selected), dirty: false })

  if (session.current.shown !== shown) session.current = { shown, focus: shown }

  const allowed = (date: CalendarDate) => isWithin(date, earliest, latest) && isDateDisabled?.(formatIsoDate(date)) !== true

  const commit = (next: string | null) => {
    setCurrent(next)
    setDraft({ value: current, format, text: show(selected), dirty: false })
  }

  const commitText = () => {
    if (!draft.dirty) return

    const text = draft.text.trim()

    if (text === '') return commit(null)

    const parsed = format.parse(text)

    commit(parsed !== null && allowed(parsed) ? formatIsoDate(parsed) : current)
  }

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, text: event.target.value, dirty: true })

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || inert) return

    commitText()
    setOpen(false)
  }

  return {
    text: draft.text,
    current,
    hiddenValue: selected ? formatIsoDate(selected) : '',
    inert,
    shown,
    autoFocus: session.current.focus,
    setOpen,
    choose: commit,
    onTextChange,
    onKeyDown,
    onBlur: commitText
  }
}
