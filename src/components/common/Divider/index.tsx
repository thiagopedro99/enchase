import { defaultDecorative, defaultOrientation } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import styles from './styles.module.css'

import type { DividerProps } from './types.ts'

export const Divider = ({ orientation = defaultOrientation, decorative = defaultDecorative, ...props }: DividerProps) => {
  const own = {
    ...slot('divider'),
    className: styles.divider,
    role: decorative ? 'none' : undefined,
    'aria-orientation': !decorative && orientation === 'vertical' ? 'vertical' : undefined,
    'data-orientation': orientation
  }

  return <hr {...mergeProps(own, props)} />
}

export default Divider
