import styled from 'styled-components'

export const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.surfaceContainer};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: ${({ theme }) => `${theme.spacing.xl} 0`};
  margin-top: auto;
`

export const Link = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    text-decoration: underline;
  }
`

export const Copyright = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    text-align: center;
    width: 100%;
  }
`
