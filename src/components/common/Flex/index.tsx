import { StyledFlex } from './styles.ts'

import type { FlexProps } from './types.ts'


export const Flex = ({ children, ...props }: FlexProps) => {
  return <StyledFlex {...props}>{children}</StyledFlex>
}

export default Flex