import styled, { css } from 'styled-components'
import { motion } from 'motion/react'

import type { StyledSkeletonProps } from './types.ts'

const StyledSkeletonBase = styled.div<StyledSkeletonProps>`
  background: ${({ theme }) => theme.colors.surfaceContainerHigh};
  background-image: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surfaceContainerHigh} 0px,
    ${({ theme }) => theme.colors.surfaceContainerLow} 40px,
    ${({ theme }) => theme.colors.surfaceContainerHigh} 80px
  );
  background-size: 468px 100%;

  ${({ $variant, $width, $height }) => {
    if ($variant === 'circular') {
      const size = $width || $height || '40px'

      return css`
        width: ${size};
        height: ${size};
        border-radius: 50%;
      `
    }

    if ($variant === 'rectangular') {
      return css`
        width: ${$width || '100%'};
        height: ${$height || '200px'};
        border-radius: ${({ theme }) => theme.borderRadius.md};
      `
    }

    return css`
      width: ${$width || '100%'};
      height: ${$height || '1em'};
      border-radius: ${({ theme }) => theme.borderRadius.sm};
    `
  }}
`

export const StyledSkeleton = motion.create(StyledSkeletonBase)
