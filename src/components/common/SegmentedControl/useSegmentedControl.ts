import { useRef } from 'react'

import { useControllableState } from '@hooks/useControllableState.ts'
import { useListNavigation } from '@hooks/useListNavigation.ts'
import { composeProps } from '@utils/composeProps.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'

import type { UseSegmentedControlOptions, UseSegmentedControlReturn } from './types.ts'
import type { KeyboardEvent, Ref } from 'react'

type Props = Record<string, unknown>

const asList = (input: string | string[] | undefined) => {
  if (input === undefined) return undefined
  if (Array.isArray(input)) return input

  return input === '' ? [] : [input]
}

export const useSegmentedControl = ({ items, multiple = false, value, defaultValue, onValueChange, disabled }: UseSegmentedControlOptions): UseSegmentedControlReturn => {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [selected, setSelected] = useControllableState<string[]>(asList(value), asList(defaultValue) ?? [], (next) => {
    if (multiple) (onValueChange as ((value: string[]) => void) | undefined)?.(next)
    else (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? '')
  })

  const enabled = items.map((item) => !(disabled || item.disabled))
  const selectedIndex = items.findIndex((item) => selected.includes(item.value))
  const tabbable = selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : enabled.indexOf(true)
  const navigate = useListNavigation({ items: items.map((item) => ({ disabled: !!(disabled || item.disabled) })), orientation: 'both' })
  const indexOf = (itemValue: string) => items.findIndex((item) => item.value === itemValue)

  const choose = (itemValue: string) => {
    if (!multiple) {
      if (!selected.includes(itemValue)) setSelected([itemValue])

      return
    }

    setSelected(items.map((item) => item.value).filter((current) => (current === itemValue ? !selected.includes(current) : selected.includes(current))))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (multiple) return

    const target = navigate(
      event,
      itemRefs.current.findIndex((node) => node === document.activeElement)
    )

    if (target === undefined) return

    event.preventDefault()
    itemRefs.current[target]?.focus({ preventScroll: true })
    itemRefs.current[target]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    choose(items[target].value)
  }

  const getGroupProps: UseSegmentedControlReturn['getGroupProps'] = (props) => {
    const own: ReturnType<UseSegmentedControlReturn['getGroupProps']> = { role: multiple ? 'group' : 'radiogroup', onKeyDown: handleKeyDown }

    return composeProps(own, props)
  }

  const getItemProps = ((itemValue: string, props?: object) => {
    const index = indexOf(itemValue)
    const known = index >= 0
    const { ref, ...rest } = (props ?? {}) as { ref?: Ref<HTMLButtonElement> | undefined } & Props
    const isSelected = selected.includes(itemValue)

    const own: Omit<ReturnType<UseSegmentedControlReturn['getItemProps']>, 'ref'> = {
      type: 'button',
      role: multiple ? undefined : 'radio',
      'aria-checked': multiple ? undefined : isSelected,
      'aria-pressed': multiple ? isSelected : undefined,
      tabIndex: multiple ? undefined : known && index === tabbable ? 0 : -1,
      disabled: !enabled[index],
      onClick: () => choose(itemValue)
    }

    return {
      ref: mergeRefs<HTMLButtonElement>((node) => {
        if (known) itemRefs.current[index] = node
      }, ref),
      ...composeProps(own, rest)
    }
  }) as UseSegmentedControlReturn['getItemProps']

  return { selected, choose, getGroupProps, getItemProps }
}
