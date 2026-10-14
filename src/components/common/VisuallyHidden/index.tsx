import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { VisuallyHiddenProps } from './types.ts'

export const VisuallyHidden = ({ children, ...props }: VisuallyHiddenProps) => {
  const own = { ...slot('visually-hidden'), className: styles.hidden }

  return <span {...mergeProps(own, props)}>{children}</span>
}

export default VisuallyHidden
