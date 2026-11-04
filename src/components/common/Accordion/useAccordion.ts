import { useId, useRef } from 'react'

import { useControllableState } from '@hooks/useControllableState.ts'
import { composeProps } from '@utils/composeProps.ts'
import { defaultMultiple } from './defaultData.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'

import type { UseAccordionOptions, UseAccordionReturn } from './types.ts'
import type { KeyboardEvent, Ref } from 'react'

type Props = Record<string, unknown>

const targetPosition = (key: string, position: number, count: number) => {
  if (key === 'ArrowDown') return position + 1
  if (key === 'ArrowUp') return position - 1
  if (key === 'Home') return 0
  if (key === 'End') return count - 1

  return undefined
}

export const useAccordion = ({ items, multiple = defaultMultiple, value, defaultValue, onValueChange }: UseAccordionOptions): UseAccordionReturn => {
  const baseId = useId()
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [openValues, setOpenValues] = useControllableState<string[]>(value, defaultValue ?? [], onValueChange)
  const expanded = multiple ? openValues : openValues.slice(0, 1)
  const indexOf = (itemValue: string) => items.findIndex((item) => item.value === itemValue)
  const triggerId = (index: number) => `${baseId}-trigger-${index}`
  const panelId = (index: number) => `${baseId}-panel-${index}`

  const toggle = (itemValue: string) => {
    const isOpen = expanded.includes(itemValue)

    if (multiple) setOpenValues(isOpen ? expanded.filter((entry) => entry !== itemValue) : [...expanded, itemValue])
    else setOpenValues(isOpen ? [] : [itemValue])
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    const enabled = items.flatMap((item, position) => (item.disabled ? [] : [position]))
    const target = targetPosition(event.key, enabled.indexOf(index), enabled.length)

    if (target === undefined) return

    const trigger = triggerRefs.current[enabled[(target + enabled.length) % enabled.length]]

    event.preventDefault()
    trigger?.focus({ preventScroll: true })
    trigger?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }

  const getTriggerProps = ((itemValue: string, props?: object) => {
    const index = indexOf(itemValue)
    const known = index >= 0
    const { ref, ...rest } = (props ?? {}) as { ref?: Ref<HTMLButtonElement> | undefined } & Props

    const own: Omit<ReturnType<UseAccordionReturn['getTriggerProps']>, 'ref'> = {
      type: 'button',
      id: triggerId(index),
      'aria-expanded': expanded.includes(itemValue),
      'aria-controls': panelId(index),
      disabled: items[index]?.disabled,
      onClick: () => toggle(itemValue),
      onKeyDown: (event) => handleKeyDown(event, index)
    }

    return {
      ref: mergeRefs<HTMLButtonElement>((node) => {
        if (known) triggerRefs.current[index] = node
      }, ref),
      ...composeProps(own, rest)
    }
  }) as UseAccordionReturn['getTriggerProps']

  const getPanelProps: UseAccordionReturn['getPanelProps'] = (itemValue, props) => {
    const index = indexOf(itemValue)
    const own: ReturnType<UseAccordionReturn['getPanelProps']> = { role: 'region', id: panelId(index), 'aria-labelledby': triggerId(index), hidden: !expanded.includes(itemValue) }

    return composeProps(own, props)
  }

  return { expanded, toggle, getTriggerProps, getPanelProps }
}
