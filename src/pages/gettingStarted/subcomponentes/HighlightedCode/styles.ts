import styled from 'styled-components'

export const CodeBlock = styled.pre`
  background-color: ${({ theme }) => theme.colors.codeBackground};
  color: #d4d4d4;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;

  code {
    padding: 0;
    font-family: inherit;
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
