import { forwardRef } from 'react'

import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CheckboxProps } from './types.ts'

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, className, ...props }, ref) => (
  <label className={styles.wrapper}>
    <input ref={ref} type="checkbox" className={classNames(styles.hidden, className)} {...props} />
    <div className={styles.box} aria-hidden="true">
      <span className={styles.icon} />
    </div>
    {label && <span className={styles.label}>{label}</span>}
  </label>
))

Checkbox.displayName = 'Checkbox'

export default Checkbox
