import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { VisuallyHiddenProps } from './types.ts'

export const VisuallyHidden = ({ children, className, ...props }: VisuallyHiddenProps) => (
  <span className={classNames(styles.hidden, className)} {...props}>
    {children}
  </span>
)

export default VisuallyHidden
