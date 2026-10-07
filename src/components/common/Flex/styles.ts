import styled from 'styled-components'

import type { FlexProps } from './types.ts'

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const

export const StyledFlex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ $direction = 'row' }) => $direction};
  align-items: ${({ $align = 'stretch' }) => alignMap[$align]};
  justify-content: ${({ $justify = 'start' }) => justifyMap[$justify]};
  gap: ${({ $gap, theme }) => $gap || theme.spacing.md};
  flex-wrap: ${({ $wrap = false }) => $wrap ? 'wrap' : 'nowrap'};
`