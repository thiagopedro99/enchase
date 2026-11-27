import { defaultDisabled, defaultFullWidth, defaultIconOnly, defaultLoading, defaultSize, defaultVariant } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveButtonMotion } from './motion.ts'
import styles from './styles.module.css'

import type { MouseEvent } from 'react'
import type { ButtonProps } from './types.ts'

const hold = (event: MouseEvent) => event.preventDefault()

export const Button = ({ children, animation, variant = defaultVariant, size = defaultSize, fullWidth = defaultFullWidth, iconOnly = defaultIconOnly, disabled = defaultDisabled, loading = defaultLoading, loadingText, onClick, ...props }: ButtonProps) => {
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
    'data-icon-only': iconOnly ? '' : undefined,
    'data-loading': loading ? '' : undefined,
    'aria-busy': loading || undefined,
    'aria-disabled': loading || undefined
  }

  return (
    <button {...mergeProps(own, props)} disabled={disabled} onClick={loading ? hold : onClick}>
      {loading ? (
        <>
          <span {...slot('button', 'spinner')} className={styles.spinner} data-overlay={loadingText ? undefined : ''} aria-hidden="true" />
          {loadingText ?? (
            <span {...slot('button', 'content')} className={styles.content}>
              {children}
            </span>
          )}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
