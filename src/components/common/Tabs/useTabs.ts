import { useId, useRef } from 'react'

import { useControllableState } from '@hooks/useControllableState.ts'
import { defaultActivation } from './defaultData.ts'
import { composeProps } from '@utils/composeProps.ts'
import { mergeRefs } from '@utils/mergeRefs.ts'

import type { UseTabsOptions, UseTabsReturn } from './types.ts'
import type { KeyboardEvent, Ref } from 'react'

type Props = Record<string, unknown>

const targetPosition = (key: string, position: number, count: number, step: number) => {
  if (key === 'ArrowRight') return position + step
  if (key === 'ArrowLeft') return position - step
  if (key === 'Home') return 0
  if (key === 'End') return count - 1

  return undefined
}

export const useTabs = ({ items, value, defaultValue, onValueChange, activation = defaultActivation }: UseTabsOptions): UseTabsReturn => {
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const firstEnabled = items.findIndex((item) => !item.disabled)
  const [selected, setSelected] = useControllableState<string>(value, defaultValue ?? items[firstEnabled]?.value ?? '', onValueChange)
  const activeIndex = items.findIndex((item) => item.value === selected)
  const tabbableIndex = activeIndex >= 0 && !items[activeIndex].disabled ? activeIndex : firstEnabled
  const indexOf = (itemValue: string) => items.findIndex((item) => item.value === itemValue)
  const tabId = (index: number) => `${baseId}-tab-${index}`
  const panelId = (index: number) => `${baseId}-panel-${index}`

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]))
    const position = enabled.indexOf(tabRefs.current.indexOf(event.target as HTMLButtonElement))
    const step = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1
    const target = targetPosition(event.key, position, enabled.length, step)

    if (position < 0 || target === undefined) return

    const index = enabled[(target + enabled.length) % enabled.length]

    event.preventDefault()
    tabRefs.current[index]?.focus({ preventScroll: true })
    tabRefs.current[index]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    if (activation === 'automatic') setSelected(items[index].value)
  }

  const getListProps: UseTabsReturn['getListProps'] = (props) => {
    const own: ReturnType<UseTabsReturn['getListProps']> = { role: 'tablist', tabIndex: -1, onKeyDown: handleKeyDown }

    return composeProps(own, props)
  }

  const getTabProps = ((tabValue: string, props?: object) => {
    const index = indexOf(tabValue)
    const known = index >= 0
    const { ref, ...rest } = (props ?? {}) as { ref?: Ref<HTMLButtonElement> | undefined } & Props

    const own: Omit<ReturnType<UseTabsReturn['getTabProps']>, 'ref'> = {
      type: 'button',
      role: 'tab',
      id: tabId(index),
      'aria-selected': known && index === activeIndex,
      'aria-controls': panelId(index),
      tabIndex: known && index === tabbableIndex ? 0 : -1,
      disabled: items[index]?.disabled,
      onClick: () => setSelected(tabValue)
    }

    return {
      ref: mergeRefs<HTMLButtonElement>((node) => {
        if (known) tabRefs.current[index] = node
      }, ref),
      ...composeProps(own, rest)
    }
  }) as UseTabsReturn['getTabProps']

  const getPanelProps: UseTabsReturn['getPanelProps'] = (panelValue, props) => {
    const index = indexOf(panelValue)
    const own: ReturnType<UseTabsReturn['getPanelProps']> = { role: 'tabpanel', id: panelId(index), 'aria-labelledby': tabId(index), tabIndex: 0, hidden: index < 0 || index !== activeIndex }

    return composeProps(own, props)
  }

  return { selected, activeIndex, tabbableIndex, select: setSelected, getListProps, getTabProps, getPanelProps }
}
