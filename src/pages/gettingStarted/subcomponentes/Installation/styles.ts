import styled from 'styled-components'

export const StepContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  align-items: flex-start;

  h3 {
    font-size: ${({ theme }) => theme.fonts.sizes['2xl']};
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  p code {
    background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.875rem;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

export const StepNumber = styled.div`
  min-width: 40px;
  min-height: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fonts.weights.bold};
  font-size: ${({ theme }) => theme.fonts.sizes.lg};
  flex-shrink: 0;
`

export const StepNote = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
`

export const Highlight = styled.span`
  color: ${({ theme }) => theme.colors.primaryHover};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
`
