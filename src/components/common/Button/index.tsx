import { defaultDisabled, defaultFullWidth, defaultIconOnly, defaultSize, defaultVariant } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveButtonMotion } from './motion.ts'
import styles from './styles.module.css'

import type { ButtonProps } from './types.ts'

export const Button = ({ children, animation, variant = defaultVariant, size = defaultSize, fullWidth = defaultFullWidth, iconOnly = defaultIconOnly, disabled = defaultDisabled, ...props }: ButtonProps) => {
  const { motion: settings } = useUIConfig()
  const { motion, style } = resolveButtonMotion(settings, animation)
  const own = {
    ...slot('button'),
    className: styles.button,
    style,
    'data-variant': variant,
    'data-size': size,
    'data-motion': motion,
    'data-full-width': fullWidth ? '' : undefined,
    'data-icon-only': iconOnly ? '' : undefined
  }

  return (
    <button {...mergeProps(own, props)} disabled={disabled}>
      {children}
    </button>
  )
}

export default Button
