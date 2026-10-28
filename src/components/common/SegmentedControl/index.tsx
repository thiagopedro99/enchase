import { forwardRef, useRef } from 'react'

import { defaultFullWidth, defaultSize } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { useListNavigation } from '@hooks/useListNavigation.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { KeyboardEvent } from 'react'
import type { SegmentedControlProps } from './types.ts'

const asList = (input: string | string[] | undefined) => {
  if (input === undefined) return undefined
  if (Array.isArray(input)) return input

  return input === '' ? [] : [input]
}

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  ({ items, ariaLabel, multiple = false, value, defaultValue, onValueChange, size = defaultSize, fullWidth = defaultFullWidth, disabled, animation, ...props }, ref) => {
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
    const motionStyle = useMotionStyle('fade', 'segmented-control', animation)

    const [selected, setSelected] = useControllableState<string[]>(asList(value), asList(defaultValue) ?? [], (next) => {
      if (multiple) (onValueChange as ((value: string[]) => void) | undefined)?.(next)
      else (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? '')
    })

    const enabled = items.map((item) => !(disabled || item.disabled))
    const selectedIndex = items.findIndex((item) => selected.includes(item.value))
    const tabbable = selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : enabled.indexOf(true)
    const navigate = useListNavigation({ items: items.map((item) => ({ disabled: !!(disabled || item.disabled) })), orientation: 'both' })

    const choose = (itemValue: string) => {
      if (!multiple) {
        if (!selected.includes(itemValue)) setSelected([itemValue])

        return
      }

      setSelected(items.map((item) => item.value).filter((current) => (current === itemValue ? !selected.includes(current) : selected.includes(current))))
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (multiple) return

      const target = navigate(
        event,
        itemRefs.current.findIndex((node) => node === document.activeElement)
      )

      if (target === undefined) return

      event.preventDefault()
      itemRefs.current[target]?.focus()
      choose(items[target].value)
    }

    const root = mergeProps(
      {
        ...slot('segmented-control'),
        className: styles.group,
        style: motionStyle,
        role: multiple ? 'group' : 'radiogroup',
        'aria-label': ariaLabel,
        'data-size': size,
        'data-full-width': fullWidth ? '' : undefined,
        'data-disabled': disabled ? '' : undefined,
        onKeyDown: handleKeyDown
      },
      props
    )

    return (
      <div {...root} ref={ref}>
        {items.map((item, index) => {
          const isSelected = selected.includes(item.value)

          return (
            <button
              key={item.value}
              ref={(node) => {
                itemRefs.current[index] = node
              }}
              type="button"
              role={multiple ? undefined : 'radio'}
              aria-checked={multiple ? undefined : isSelected}
              aria-pressed={multiple ? isSelected : undefined}
              aria-label={item.ariaLabel}
              tabIndex={multiple ? undefined : index === tabbable ? 0 : -1}
              disabled={!enabled[index]}
              className={styles.item}
              data-state={isSelected ? 'on' : 'off'}
              onClick={() => choose(item.value)}
              {...slot('segmented-control', 'item')}
            >
              {item.label}
            </button>
          )
        })}
      </div>
    )
  }
)

SegmentedControl.displayName = 'SegmentedControl'

export default SegmentedControl
