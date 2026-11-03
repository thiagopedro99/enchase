import { defaultDecorative, defaultOrientation, defaultTextAlign } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { HTMLAttributes } from 'react'
import type { DividerProps } from './types.ts'

export const Divider = ({ orientation = defaultOrientation, decorative = defaultDecorative, textAlign = defaultTextAlign, children, ...props }: DividerProps) => {
  const withText = orientation === 'horizontal' && children !== undefined && children !== null && children !== false && children !== ''
  const own = {
    ...slot('divider'),
    className: styles.divider,
    role: decorative ? 'none' : withText ? 'separator' : undefined,
    'aria-orientation': !decorative && orientation === 'vertical' ? 'vertical' : undefined,
    'data-orientation': orientation,
    'data-with-text': withText ? '' : undefined,
    'data-text-align': withText ? textAlign : undefined
  }

  if (!withText) return <hr {...mergeProps(own, props)} />

  return (
    <div {...(mergeProps(own, props) as HTMLAttributes<HTMLDivElement>)}>
      <span className={styles.line} aria-hidden="true" {...slot('divider', 'line')} />

      <span className={styles.text} {...slot('divider', 'text')}>
        {children}
      </span>

      <span className={styles.line} aria-hidden="true" {...slot('divider', 'line')} />
    </div>
  )
}

export default Divider
