import { StyledContainer } from './styles.ts'

import type { ContainerProps } from './types.ts'



export const Container = ({ children, ...props }: ContainerProps) => {
  return <StyledContainer {...props}>{children}</StyledContainer>
}

export default Container