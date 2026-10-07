import { styled } from 'styled-components'

import type { ContainerProps } from './types.ts'

const maxWidthMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const

export const StyledContainer = styled.div<ContainerProps>`
  width: 100%;
  margin-left: ${({ $center = true }) => $center ? 'auto' : '0'};
  margin-right: ${({ $center = true }) => $center ? 'auto' : '0'};
  
  padding-left: ${({ $padding = true, theme }) => {
    if (typeof $padding === 'string') return $padding
    return $padding ? theme.spacing.md : '0'
  }};
  
  padding-right: ${({ $padding = true, theme }) => {
    if (typeof $padding === 'string') return $padding
    return $padding ? theme.spacing.md : '0'
  }};
  
  max-width: ${({ $maxWidth = 'lg' }) => maxWidthMap[$maxWidth]};
`