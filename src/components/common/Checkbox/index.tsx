import { forwardRef } from 'react'

import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import styles from './styles.module.css'

import type { CheckboxProps } from './types.ts'

const markBase = { duration: 0.15, scale: 0.6, distance: 0 }

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, wrapperClassName, wrapperStyle, animation, ...props }, ref) => {
  const motionStyle = useMotionStyle('pop', 'checkbox', animation, undefined, markBase)
  const wrapper = mergeProps({ ...slot('checkbox'), className: styles.wrapper, style: motionStyle, 'data-disabled': props.disabled ? '' : undefined }, { className: wrapperClassName, style: wrapperStyle })
  const field = mergeProps({ ...slot('checkbox', 'input'), className: styles.hidden }, props)

  return (
    <label {...wrapper}>
      <input ref={ref} type="checkbox" {...field} />
      <span className={styles.box} aria-hidden="true" {...slot('checkbox', 'box')}>
        <span className={styles.icon} />
      </span>
      {label && (
        <span className={styles.label} {...slot('checkbox', 'label')}>
          {label}
        </span>
      )}
    </label>
  )
})

Checkbox.displayName = 'Checkbox'

export default Checkbox
