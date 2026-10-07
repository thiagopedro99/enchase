import styled from 'styled-components'

export const Hero = styled.div`
  text-align: center;
`

export const Logo = styled.img`
  display: block;
  width: 96px;
  height: 96px;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.fonts.sizes['5xl']};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fonts.sizes['3xl']};
  }
`

export const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`

