import { motion } from 'motion/react'

import { defaultDisabled, defaultFullWidth, defaultRecipe, defaultSize, defaultVariant } from './defaultData.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { ButtonProps } from './types.ts'

export const Button = ({ children, animation, variant = defaultVariant, size = defaultSize, fullWidth = defaultFullWidth, disabled = defaultDisabled, className, ...props }: ButtonProps) => {
  const pressMotion = useMotionRecipe(defaultRecipe, animation)
  const motionProps = disabled ? {} : pressMotion

  return (
    <motion.button {...motionProps} {...props} className={classNames(styles.button, className)} data-variant={variant} data-size={size} data-full-width={fullWidth ? '' : undefined} disabled={disabled}>
      {children}
    </motion.button>
  )
}

export default Button
