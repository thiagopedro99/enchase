import { useEffect, useRef, useState } from 'react'

import { usePopoverControl } from '../Popover/popoverControl.ts'
import { useListNavigation } from '@hooks/useListNavigation.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { MenuEntry, MenuItem, MenuListProps } from './types.ts'

const isItem = (entry: MenuEntry): entry is MenuItem => !('separator' in entry)

const textOf = (item: MenuItem) => item.textValue ?? (typeof item.label === 'string' ? item.label : '')

export const MenuList = ({ items, entry, animation }: MenuListProps) => {
  const control = usePopoverControl()
  const motionStyle = useMotionStyle('fade', 'menu', animation)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const options = items.filter(isItem)
  const positions = new Map(options.map((item, index) => [item.id, index]))
  const firstEnabled = options.findIndex((item) => !item.disabled)
  const [current, setCurrent] = useState(firstEnabled)
  const navigate = useListNavigation({ items: options.map((item) => ({ disabled: item.disabled, text: textOf(item) })), typeahead: true })
  const latest = useRef({ navigate, options })

  latest.current = { navigate, options }

  useEffect(() => {
    const menu = control?.contentRef.current

    if (!menu) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = latest.current.navigate(
        event,
        itemRefs.current.findIndex((node) => node === document.activeElement)
      )

      if (target === undefined) return

      event.preventDefault()
      itemRefs.current[target]?.focus()
    }

    menu.addEventListener('keydown', handleKeyDown)

    return () => menu.removeEventListener('keydown', handleKeyDown)
  }, [control])

  useEffect(() => {
    const point = entry.current
    const enabled = latest.current.options.flatMap((item, index) => (item.disabled ? [] : [index]))

    entry.current = undefined

    if (point === 'first') itemRefs.current[enabled[0]]?.focus()
    if (point === 'last') itemRefs.current[enabled[enabled.length - 1]]?.focus()
  }, [entry])

  const select = (item: MenuItem) => {
    if (item.disabled) return

    item.onSelect?.()
    control?.close()
  }

  return (
    <div role="none" {...slot('menu')} className={styles.list} style={motionStyle}>
      {items.map((entryItem) => {
        if (!isItem(entryItem)) return <div key={entryItem.id} role="separator" className={styles.separator} {...slot('menu', 'separator')} />

        const index = positions.get(entryItem.id) as number

        return (
          <button
            key={entryItem.id}
            ref={(node) => {
              itemRefs.current[index] = node
            }}
            type="button"
            role="menuitem"
            tabIndex={index === current ? 0 : -1}
            aria-disabled={entryItem.disabled || undefined}
            className={styles.item}
            data-disabled={entryItem.disabled ? '' : undefined}
            onClick={() => select(entryItem)}
            onFocus={() => {
              if (!entryItem.disabled) setCurrent(index)
            }}
            {...slot('menu', 'item')}
          >
            {entryItem.icon !== undefined && (
              <span aria-hidden="true" className={styles.icon} {...slot('menu', 'item-icon')}>
                {entryItem.icon}
              </span>
            )}

            <span className={styles.label} {...slot('menu', 'item-label')}>
              {entryItem.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
