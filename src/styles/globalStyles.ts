import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scroll-behavior: smooth;
    scrollbar-gutter: stable;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    font-size: ${({ theme }) => theme.fonts.sizes.base};
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;

    transition: color ${({ theme }) => theme.transitions.normal},
                background-color ${({ theme }) => theme.transitions.normal};
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.fonts.weights.medium};
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h1 { font-size: ${({ theme }) => theme.fonts.sizes['4xl']}; }
  h2 { font-size: ${({ theme }) => theme.fonts.sizes['3xl']}; }
  h3 { font-size: ${({ theme }) => theme.fonts.sizes['2xl']}; }
  h4 { font-size: ${({ theme }) => theme.fonts.sizes.xl}; }
  h5 { font-size: ${({ theme }) => theme.fonts.sizes.lg}; }
  h6 { font-size: ${({ theme }) => theme.fonts.sizes.base}; }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: underline;
    text-underline-offset: 0.2em;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;

    &:disabled {
      cursor: not-allowed;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.borderRadius.full};

    &:hover {
      background-color: ${({ theme }) => theme.colors.text.secondary};
    }
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.borderStrong} transparent;
  }

  *:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }

    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.primaryContainer};
    color: ${({ theme }) => theme.colors.onPrimaryContainer};
  }
`

export default GlobalStyles
