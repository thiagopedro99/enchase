import styled from 'styled-components'

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.sizes['4xl']};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`

export const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`
