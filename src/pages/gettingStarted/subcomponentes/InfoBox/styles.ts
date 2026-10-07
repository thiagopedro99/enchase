import styled from 'styled-components'

export const StyledInfoBox = styled.div<{ $spaced?: boolean }>`
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.onPrimaryContainer};
  font-size: 0.875rem;
  line-height: 1.6;
  margin-top: ${({ $spaced, theme }) => ($spaced ? '1rem' : theme.spacing.sm)};
`
