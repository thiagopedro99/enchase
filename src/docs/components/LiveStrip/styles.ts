import styled from 'styled-components'

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`

export const Row = styled.div<{ align?: 'center' | 'flex-start' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: ${({ align = 'center' }) => align};
  gap: ${({ theme }) => theme.spacing.md};
`
