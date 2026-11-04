import { forwardRef } from 'react'

import { useSegmentedControl } from './useSegmentedControl.ts'
import { defaultFullWidth, defaultSize } from './defaultData.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SegmentedControlProps, UseSegmentedControlOptions } from './types.ts'

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(({ items, ariaLabel, multiple, value, defaultValue, onValueChange, size = defaultSize, fullWidth = defaultFullWidth, disabled, animation, ...props }, ref) => {
  const segmented = useSegmentedControl({ items, multiple, value, defaultValue, onValueChange, disabled } as UseSegmentedControlOptions)
  const motionStyle = useMotionStyle('fade', 'segmented-control', animation)

  const root = mergeProps(
    {
      ...slot('segmented-control'),
      className: styles.group,
      style: motionStyle,
      ...segmented.getGroupProps(),
      'aria-label': ariaLabel,
      'data-size': size,
      'data-full-width': fullWidth ? '' : undefined,
      'data-disabled': disabled ? '' : undefined
    },
    props
  )

  return (
    <div {...root} ref={ref}>
      {items.map((item) => (
        <button key={item.value} {...segmented.getItemProps(item.value, { 'aria-label': item.ariaLabel, className: styles.item, 'data-state': segmented.selected.includes(item.value) ? 'on' : 'off', ...slot('segmented-control', 'item') })}>
          {item.label}
        </button>
      ))}
    </div>
  )
})

SegmentedControl.displayName = 'SegmentedControl'

export default SegmentedControl
