import styled from 'styled-components'

export const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const ListItem = styled.li`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;

  strong {
    color: ${({ theme }) => theme.colors.primary};
    margin-right: ${({ theme }) => theme.spacing.sm};
  }

  code {
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    font-size: 0.875rem;
  }
`
