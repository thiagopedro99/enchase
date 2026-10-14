import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './swap.module.css'

import type { IconSwapProps } from './types.ts'

export const IconSwap = ({ first, second, showSecond, ...props }: IconSwapProps) => {
  const own = {
    ...slot('icon-swap'),
    className: styles.swap,
    'data-state': showSecond ? 'second' : 'first',
    'aria-hidden': 'true'
  }

  const slotOverride = props['data-slot' as keyof typeof props]

  return (
    <span {...mergeProps(own, props)} {...(slotOverride ? { 'data-slot': slotOverride } : {})}>
      <span className={styles.item} {...slot('icon-swap', 'item')} data-state={showSecond ? 'inactive' : 'active'}>
        {first}
      </span>
      <span className={styles.item} {...slot('icon-swap', 'item')} data-state={showSecond ? 'active' : 'inactive'}>
        {second}
      </span>
    </span>
  )
}

export default IconSwap
