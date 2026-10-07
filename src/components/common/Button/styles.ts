import styled, { css } from 'styled-components'
import { motion } from 'motion/react'

import { stateLayer, stateOpacity } from '../../../styles/stateLayer.ts'
import { defaultFullWidth, defaultSize, defaultVariant } from './defaultData.ts'

import type { ButtonProps, ButtonStyleProps } from './types.ts'

export const buttonStyles = css<ButtonStyleProps>`
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: inherit;
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: box-shadow ${({ theme }) => theme.transitions.fast}, background-color ${({ theme }) => theme.transitions.fast};

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:hover:not(:disabled)::after {
    opacity: ${stateOpacity.hover / 100};
  }

  &:focus-visible::after,
  &:active:not(:disabled)::after {
    opacity: ${stateOpacity.pressed / 100};
  }

  ${({ $size = defaultSize, theme }) => {
    const sizes = {
      sm: css`
        height: 32px;
        padding: 0 ${theme.spacing.md};
        font-size: ${theme.fonts.sizes.sm};
      `,
      md: css`
        height: 40px;
        padding: 0 ${theme.spacing.lg};
        font-size: ${theme.fonts.sizes.sm};
      `,
      lg: css`
        height: 48px;
        padding: 0 ${theme.spacing.xl};
        font-size: ${theme.fonts.sizes.base};
      `
    }

    return sizes[$size]
  }}

  ${({ $variant = defaultVariant, theme }) => {
    const variants = {
      primary: css`
        background-color: ${theme.colors.primary};
        color: ${theme.colors.onPrimary};

        &:hover:not(:disabled) {
          color: ${theme.colors.onPrimary};
          box-shadow: ${theme.shadows.sm};
        }
      `,
      secondary: css`
        background-color: ${theme.colors.primaryContainer};
        color: ${theme.colors.onPrimaryContainer};

        &:hover:not(:disabled) {
          color: ${theme.colors.onPrimaryContainer};
          box-shadow: ${theme.shadows.sm};
        }
      `,
      outline: css`
        background-color: transparent;
        border-color: ${theme.colors.borderStrong};
        color: ${theme.colors.primary};

        &:hover:not(:disabled) {
          color: ${theme.colors.primary};
        }
      `,
      ghost: css`
        background-color: transparent;
        color: ${theme.colors.primary};
        padding-left: ${theme.spacing.md};
        padding-right: ${theme.spacing.md};

        &:hover:not(:disabled) {
          color: ${theme.colors.primary};
        }
      `
    }

    return variants[$variant]
  }}

  ${({ $fullWidth = defaultFullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}

  &:disabled {
    cursor: not-allowed;
    box-shadow: none;
    color: ${({ theme }) => theme.colors.text.disabled};
    background-color: ${({ $variant = defaultVariant, theme }) => ($variant === 'outline' || $variant === 'ghost' ? 'transparent' : stateLayer(theme.colors.text.primary, 12))};
    border-color: ${({ $variant = defaultVariant, theme }) => ($variant === 'outline' ? stateLayer(theme.colors.text.primary, 12) : 'transparent')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const StyledButtonBase = styled.button<ButtonProps>`
  ${buttonStyles}
`

export const StyledButton = motion.create(StyledButtonBase)
