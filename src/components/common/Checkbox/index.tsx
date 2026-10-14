import { forwardRef } from 'react'

import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { CheckboxProps } from './types.ts'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, wrapperClassName, wrapperStyle, ...props }, ref) => {
  const wrapper = mergeProps({ ...slot('checkbox'), className: styles.wrapper, 'data-disabled': props.disabled ? '' : undefined }, { className: wrapperClassName, style: wrapperStyle })
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
