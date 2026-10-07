import styled, { css } from 'styled-components'
import { motion } from 'motion/react'

import type { CardProps } from './types.ts'

const StyledCardBase = styled.div<CardProps>`
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ $padding, theme }) => $padding || theme.spacing.lg};
  transition: box-shadow ${({ theme }) => theme.transitions.fast}, background-color ${({ theme }) => theme.transitions.fast}, border-color ${({ theme }) => theme.transitions.fast};

  ${({ $variant = 'default', theme }) => {
    const variants = {
      default: css`
        background-color: ${theme.colors.surfaceContainer};
      `,
      elevated: css`
        background-color: ${theme.colors.surfaceContainerLow};
        box-shadow: ${theme.shadows.sm};

        &:hover {
          box-shadow: ${theme.shadows.md};
        }
      `,
      outlined: css`
        background-color: ${theme.colors.surface};
        border: 1px solid ${theme.colors.border};
      `
    }

    return variants[$variant]
  }}
`

export const StyledCard = motion.create(StyledCardBase)
