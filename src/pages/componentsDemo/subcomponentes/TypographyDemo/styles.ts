import styled from 'styled-components'

export const ScaleList = styled.div`
  display: flex;
  flex-direction: column;
`

export const ScaleRow = styled.div`
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} 0`};
  border-top: 1px solid ${({ theme }) => theme.colors.border};

  &:first-child {
    border-top: 0;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: minmax(0, 1fr);
    gap: ${({ theme }) => theme.spacing.xs};
  }
`

export const ScaleMeta = styled.div`
  display: flex;
  flex-direction: column;
`

export const ScaleRole = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const ScaleToken = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`

export const Sample = styled.span<{ $size: string; $weight?: number }>`
  font-size: ${({ $size }) => $size};
  font-weight: ${({ $weight, theme }) => $weight ?? theme.fonts.weights.medium};
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-wrap: anywhere;
`

export const WeightRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.xl}`};
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`
