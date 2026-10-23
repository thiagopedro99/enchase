import { useUIConfig } from '@hooks/useUIConfig.ts'
import { resolveCardMotion } from './motion.ts'

import type { CardProps, CardVariant } from './types.ts'
import type { CSSProperties } from 'react'

type CardSurface = Pick<CardProps, 'padding' | 'animation'> & { variant: CardVariant }

export const useCardSurface = ({ variant, padding, animation }: CardSurface) => {
  const { motion: settings } = useUIConfig()
  const { motion, style } = variant === 'elevated' ? resolveCardMotion(settings, animation) : { motion: 'off' as const, style: undefined }

  return {
    style: { ...style, ...(padding ? { padding } : undefined) } as CSSProperties,
    'data-variant': variant,
    'data-motion': motion
  }
}
