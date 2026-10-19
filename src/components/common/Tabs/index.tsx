import { forwardRef, useId, useRef } from 'react'

import { useControllableState } from '@hooks/useControllableState.ts'
import { defaultActivation, tabsBase } from './defaultData.ts'
import { useTabIndicator } from '@hooks/useTabIndicator.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { KeyboardEvent } from 'react'
import type { TabsProps } from './types.ts'

const targetPosition = (key: string, position: number, count: number, step: number) => {
  if (key === 'ArrowRight') return position + step
  if (key === 'ArrowLeft') return position - step
  if (key === 'Home') return 0
  if (key === 'End') return count - 1

  return undefined
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({ items, value, defaultValue, onValueChange, activation = defaultActivation, ariaLabel, animation, ...props }, ref) => {
  const baseId = useId()
  const { dir } = useUIConfig()
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const firstEnabled = items.findIndex((item) => !item.disabled)
  const [selected, setSelected] = useControllableState<string>(value, defaultValue ?? items[firstEnabled]?.value ?? '', onValueChange)
  const activeIndex = items.findIndex((item) => item.value === selected)
  const tabbableIndex = activeIndex >= 0 && !items[activeIndex].disabled ? activeIndex : firstEnabled
  const motionStyle = useMotionStyle('fade', 'tabs', animation, undefined, tabsBase)
  const indicator = useTabIndicator(listRef, indicatorRef, activeIndex >= 0 ? selected : undefined, [dir, ...items.map((item) => item.value)].join('\u0000'))
  const root = mergeProps({ ...slot('tabs'), className: styles.tabs, style: motionStyle }, props)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]))
    const position = enabled.indexOf(tabRefs.current.indexOf(event.target as HTMLButtonElement))
    const step = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1
    const target = targetPosition(event.key, position, enabled.length, step)

    if (position < 0 || target === undefined) return

    const index = enabled[(target + enabled.length) % enabled.length]

    event.preventDefault()
    tabRefs.current[index]?.focus()
    if (activation === 'automatic') setSelected(items[index].value)
  }

  return (
    <div {...root} ref={ref}>
      <div ref={listRef} role="tablist" tabIndex={-1} aria-label={ariaLabel} className={styles.list} data-indicator={indicator.visible ? '' : undefined} onKeyDown={handleKeyDown} {...slot('tabs', 'list')}>
        {items.map((item, index) => (
          <button
            key={item.value}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === activeIndex}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === tabbableIndex ? 0 : -1}
            disabled={item.disabled}
            className={styles.tab}
            onClick={() => setSelected(item.value)}
            {...slot('tabs', 'tab')}
          >
            {item.label}
          </button>
        ))}

        <span
          ref={indicatorRef}
          aria-hidden="true"
          className={styles.indicator}
          style={{ translate: `${indicator.x}px 0`, scale: `${indicator.width} 1` }}
          data-visible={indicator.visible ? '' : undefined}
          data-animate={indicator.animate ? '' : undefined}
          {...slot('tabs', 'indicator')}
        />
      </div>

      {items.map((item, index) => (
        <div key={item.value} role="tabpanel" id={`${baseId}-panel-${index}`} aria-labelledby={`${baseId}-tab-${index}`} tabIndex={0} hidden={index !== activeIndex} className={styles.panel} {...slot('tabs', 'panel')}>
          {item.content}
        </div>
      ))}
    </div>
  )
})

Tabs.displayName = 'Tabs'

export default Tabs
