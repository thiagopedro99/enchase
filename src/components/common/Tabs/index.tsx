import { forwardRef, useRef } from 'react'

import { defaultActivation, defaultVariant, tabsBase } from './defaultData.ts'
import { useTabIndicator } from '@hooks/useTabIndicator.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'
import { useTabs } from './useTabs.ts'

import type { TabsProps } from './types.ts'

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(({ items, value, defaultValue, onValueChange, activation = defaultActivation, variant = defaultVariant, ariaLabel, animation, ...props }, ref) => {
  const { dir } = useUIConfig()
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const tabs = useTabs({ items, value, defaultValue, onValueChange, activation })
  const motionStyle = useMotionStyle('fade', 'tabs', animation, undefined, tabsBase)
  const indicator = useTabIndicator(listRef, indicatorRef, tabs.activeIndex >= 0 ? tabs.selected : undefined, [dir, ...items.map((item) => item.value)].join('\u0000'))
  const root = mergeProps({ ...slot('tabs'), className: styles.tabs, style: motionStyle, 'data-variant': variant === defaultVariant ? undefined : variant }, props)

  return (
    <div {...root} ref={ref}>
      <div {...tabs.getListProps({ ref: listRef, 'aria-label': ariaLabel, className: styles.list, 'data-indicator': indicator.visible ? '' : undefined, ...slot('tabs', 'list') })}>
        {items.map((item, index) => (
          <button key={item.value} {...tabs.getTabProps(index, { className: styles.tab, ...slot('tabs', 'tab') })}>
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
        <div key={item.value} {...tabs.getPanelProps(index, { className: styles.panel, ...slot('tabs', 'panel') })}>
          {item.content}
        </div>
      ))}
    </div>
  )
})

Tabs.displayName = 'Tabs'

export default Tabs
