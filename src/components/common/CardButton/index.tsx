import { mergeProps, slot } from '@utils/mergeProps.ts'
import { defaultVariant } from '../Card/defaultData.ts'
import { useCardSurface } from '../Card/surface.ts'
import cardStyles from '../Card/styles.module.css'
import { classNames } from '@utils/classNames.ts'
import { defaultType } from './defaultData.ts'
import styles from './styles.module.css'

import type { CardButtonProps } from './types.ts'

export const CardButton = ({ children, animation, variant = defaultVariant, padding, type = defaultType, ...props }: CardButtonProps) => {
  const surface = useCardSurface({ variant, padding, animation })
  const own = { ...slot('card-button'), ...surface, className: classNames(cardStyles.card, styles.tile) }

  return (
    <button {...mergeProps(own, props)} type={type}>
      {children}
    </button>
  )
}

export default CardButton
