import styled from 'styled-components'

export const InlineLink = styled.button`
  padding: 0;
  font: inherit;
  color: ${({ theme }) => theme.colors.primaryHover};
  text-decoration: underline;
`
