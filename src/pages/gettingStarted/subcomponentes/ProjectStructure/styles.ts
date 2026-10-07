import styled from 'styled-components'

export const Intro = styled.p`
  margin-bottom: 1.5rem;
`

export const FolderTree = styled.div`
  background-color: ${({ theme }) => theme.colors.surfaceContainerLow};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.8;
`

export const FolderItem = styled.div<{ $level: number }>`
  padding-left: ${({ $level }) => $level * 1.5}rem;
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceContainerHigh};
  }
`
