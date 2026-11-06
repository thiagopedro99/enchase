import { forwardRef, useId } from 'react'

import { useSegmentedControl } from './useSegmentedControl.ts'
import { defaultFullWidth, defaultSize } from './defaultData.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SegmentedControlProps, UseSegmentedControlOptions } from './types.ts'

export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(({ items, label, ariaLabel, multiple, value, defaultValue, onValueChange, size = defaultSize, fullWidth = defaultFullWidth, disabled, animation, ...props }, ref) => {
  const segmented = useSegmentedControl({ items, multiple, value, defaultValue, onValueChange, disabled } as UseSegmentedControlOptions)
  const motionStyle = useMotionStyle('fade', 'segmented-control', animation)
  const labelId = useId()

  const root = mergeProps(
    {
      ...slot('segmented-control'),
      className: styles.group,
      style: motionStyle,
      ...segmented.getGroupProps(),
      'aria-label': label ? undefined : ariaLabel,
      'aria-labelledby': label ? labelId : undefined,
      'data-size': size,
      'data-full-width': fullWidth ? '' : undefined,
      'data-disabled': disabled ? '' : undefined
    },
    props
  )

  const group = (
    <div {...root} ref={ref}>
      {items.map((item) => (
        <button key={item.value} {...segmented.getItemProps(item.value, { 'aria-label': item.ariaLabel, className: styles.item, 'data-state': segmented.selected.includes(item.value) ? 'on' : 'off', ...slot('segmented-control', 'item') })}>
          {item.label}
        </button>
      ))}
    </div>
  )

  if (!label) return group

  return (
    <div className={styles.field} data-full-width={fullWidth ? '' : undefined} {...slot('segmented-control', 'field')}>
      <span id={labelId} className={styles.label} {...slot('segmented-control', 'label')}>
        {label}
      </span>
      {group}
    </div>
  )
})

SegmentedControl.displayName = 'SegmentedControl'

export default SegmentedControl
