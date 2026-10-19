import { forwardRef } from 'react'

import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { SwitchProps } from './types.ts'

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ label, wrapperClassName, wrapperStyle, animation, ...props }, ref) => {
  const motionStyle = useMotionStyle('fade', 'switch', animation)
  const wrapper = mergeProps({ ...slot('switch'), className: styles.wrapper, style: motionStyle, 'data-disabled': props.disabled ? '' : undefined }, { className: wrapperClassName, style: wrapperStyle })
  const field = mergeProps({ ...slot('switch', 'input'), className: styles.hidden }, props)

  return (
    <label {...wrapper}>
      <input ref={ref} {...field} type="checkbox" role="switch" />
      <span className={styles.track} aria-hidden="true" {...slot('switch', 'track')}>
        <span className={styles.thumb} {...slot('switch', 'thumb')} />
      </span>
      {label && (
        <span className={styles.label} {...slot('switch', 'label')}>
          {label}
        </span>
      )}
    </label>
  )
})

Switch.displayName = 'Switch'

export default Switch
