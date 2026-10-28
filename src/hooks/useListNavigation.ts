import { useEffect, useRef } from 'react'

export type NavigationItem = {
  disabled?: boolean | undefined
  text?: string | undefined
}

export type NavigationEvent = {
  key: string
  altKey: boolean
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  currentTarget: EventTarget | null
}

export type ListNavigationOptions = {
  items: readonly NavigationItem[]
  orientation?: 'vertical' | 'horizontal' | 'both' | undefined
  loop?: boolean | undefined
  typeahead?: boolean | undefined
}

const defaultOrientation = 'vertical'

const defaultLoop = true

const typeaheadDelay = 500

const stepOf = (key: string, orientation: NonNullable<ListNavigationOptions['orientation']>, rtl: boolean) => {
  const vertical = orientation !== 'horizontal'
  const horizontal = orientation !== 'vertical'

  if (vertical && key === 'ArrowDown') return 1
  if (vertical && key === 'ArrowUp') return -1
  if (horizontal && key === 'ArrowRight') return rtl ? -1 : 1
  if (horizontal && key === 'ArrowLeft') return rtl ? 1 : -1

  return 0
}

const move = (enabled: number[], current: number, step: number, loop: boolean) => {
  const first = enabled[0]
  const last = enabled[enabled.length - 1]
  const ahead = step > 0 ? enabled.find((index) => index > current) : enabled.filter((index) => index < current).pop()

  if (current < 0) return step > 0 ? first : last
  if (ahead !== undefined) return ahead
  if (loop) return step > 0 ? first : last

  return current
}

const match = (items: readonly NavigationItem[], current: number, query: string) => {
  const repeated = query.length > 1 && [...query].every((character) => character === query[0])
  const term = repeated ? query[0] : query
  const start = term.length === 1 ? current + 1 : Math.max(current, 0)

  return Array.from({ length: items.length }, (_, offset) => (start + offset) % items.length).find((index) => !items[index].disabled && items[index].text?.toLowerCase().startsWith(term))
}

export const useListNavigation = ({ items, orientation = defaultOrientation, loop = defaultLoop, typeahead = false }: ListNavigationOptions) => {
  const search = useRef<{ query: string; timer?: ReturnType<typeof setTimeout> | undefined }>({ query: '' })

  useEffect(() => () => clearTimeout(search.current.timer), [])

  return (event: NavigationEvent, current: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return undefined

    const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]))

    if (enabled.length === 0) return undefined

    if (typeahead && event.key.length === 1 && (event.key !== ' ' || search.current.query !== '')) {
      clearTimeout(search.current.timer)
      search.current.query += event.key.toLowerCase()
      search.current.timer = setTimeout(() => {
        search.current.query = ''
      }, typeaheadDelay)

      return match(items, current, search.current.query)
    }

    if (event.shiftKey) return undefined
    if (event.key === 'Home') return enabled[0]
    if (event.key === 'End') return enabled[enabled.length - 1]

    const step = stepOf(event.key, orientation, getComputedStyle(event.currentTarget as Element).direction === 'rtl')

    return step === 0 ? undefined : move(enabled, current, step, loop)
  }
}
