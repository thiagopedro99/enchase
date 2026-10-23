import { defaultTag, roleOf } from '@utils/structureTag.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { defaultVariant } from './defaultData.ts'
import { useCardSurface } from './surface.ts'
import styles from './styles.module.css'

import type { CardProps } from './types.ts'

export const Card = ({ as: Tag = defaultTag, children, animation, variant = defaultVariant, padding, ...props }: CardProps) => {
  const surface = useCardSurface({ variant, padding, animation })
  const own = { ...slot('card'), ...surface, className: styles.card, role: roleOf(Tag) }

  return <Tag {...mergeProps(own, props)}>{children}</Tag>
}

export default Card
