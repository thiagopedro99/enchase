import { motion } from 'motion/react'

import { defaultVariant } from './defaultData.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CardProps } from './types.ts'

export const Card = ({ children, animation, variant = defaultVariant, padding, className, style, ...props }: CardProps) => {
  const liftMotion = useMotionRecipe('lift', animation)
  const motionProps = variant === 'elevated' ? liftMotion : {}

  return (
    <motion.div {...motionProps} {...props} className={classNames(styles.card, className)} data-variant={variant} style={padding ? { padding, ...style } : style}>
      {children}
    </motion.div>
  )
}

export default Card
