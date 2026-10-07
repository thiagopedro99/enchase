import styled from 'styled-components'

import type { GridProps } from './types.ts'

export const StyledGrid = styled.div<GridProps>`
  display: grid;
  gap: ${({ $gap, theme }) => $gap || theme.spacing.md};
  
  ${({ $minColumnWidth, $columns }) => 
    $minColumnWidth 
      ? `grid-template-columns: repeat(auto-fit, minmax(${$minColumnWidth}, 1fr));`
      : `grid-template-columns: repeat(${$columns || 1}, 1fr);`
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`