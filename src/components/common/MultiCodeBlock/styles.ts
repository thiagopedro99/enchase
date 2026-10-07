import styled from 'styled-components'

export const MultiCodeBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

export const CodeSection = styled.div`
  background-color: ${({ theme }) => theme.colors.codeBackground};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
`

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

export const SectionTitle = styled.span`
  font-size: ${({ theme }) => theme.fonts.sizes.sm};
  font-weight: ${({ theme }) => theme.fonts.weights.semibold};
  color: rgba(255, 255, 255, 0.9);
  font-family: ${({ theme }) => theme.fonts.primary};
`

export const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: rgba(255, 255, 255, 0.8);
  font-size: ${({ theme }) => theme.fonts.sizes.xs};
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast}, border-color ${({ theme }) => theme.transitions.fast}, color ${({ theme }) => theme.transitions.fast}, box-shadow ${({ theme }) => theme.transitions.fast}, opacity ${({ theme }) => theme.transitions.fast};

  span {
    font-family: ${({ theme }) => theme.fonts.primary};
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`

export const CodeContent = styled.div`
  overflow-x: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  
  pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
    font-size: 14px;
    line-height: 1.6;
    color: #d4d4d4;
    
    code {
      display: block;
      white-space: pre;
      font-family: inherit;
    }
  }
  
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: ${({ theme }) => theme.borderRadius.sm};

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`

export const TokenSpan = styled.span<{ $type: string }>`
  ${({ $type }) => {
    switch ($type) {
      case 'comment':
        return `
          color: #6a9955;
          font-style: italic;
        `
      case 'string':
        return `
          color: #ce9178;
        `
      case 'keyword':
        return `
          color: #c586c0;
          font-weight: 500;
        `
      case 'react':
        return `
          color: #4ec9b0;
          font-weight: 500;
        `
      case 'function':
        return `
          color: #dcdcaa;
        `
      case 'number':
        return `
          color: #b5cea8;
        `
      case 'tag':
        return `
          color: #569cd6;
          font-weight: 500;
        `
      case 'property':
        return `
          color: #9cdcfe;
        `
      default:
        return `
          color: #d4d4d4;
        `
    }
  }}
`