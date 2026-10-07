import { StyledGrid } from './styles.ts'

import type { GridProps } from './types.ts'


export const Grid = ({ children, ...props }: GridProps) => {
  return <StyledGrid {...props}>{children}</StyledGrid>
}

export default Grid