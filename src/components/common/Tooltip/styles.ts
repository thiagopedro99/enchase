import styled, { css } from 'styled-components'
import { motion } from 'motion/react'

import type { TooltipPosition } from './types.ts'

export const TooltipWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const positionStyles: Record<TooltipPosition, ReturnType<typeof css>> = {
  top: css`
    translate: -50% -100%;
  `,
  bottom: css`
    translate: -50% 0;
  `,
  left: css`
    translate: -100% -50%;
  `,
  right: css`
    translate: 0 -50%;
  `
}

const TooltipBubbleBase = styled.span<{ $position: TooltipPosition }>`
  position: fixed;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  background: ${({ theme }) => theme.colors.inverseSurface};
  color: ${({ theme }) => theme.colors.inverseOnSurface};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  white-space: nowrap;

  ${({ $position }) => positionStyles[$position]}

  @media (hover: none) and (pointer: coarse) {
    display: none;
  }
`

export const TooltipBubble = motion.create(TooltipBubbleBase)
