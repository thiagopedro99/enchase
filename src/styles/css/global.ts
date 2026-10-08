import { vars } from './vars.ts'

export const globalStylesCss = `
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
    font-family: ${vars.font.primary};
    font-size: ${vars.font.size.base};
    color: ${vars.color.text.primary};
    background-color: ${vars.color.background};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    transition: color ${vars.transition.normal}, background-color ${vars.transition.normal};
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${vars.font.weight.medium};
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin-bottom: ${vars.space.md};
  }

  h1 { font-size: ${vars.font.size['4xl']}; }
  h2 { font-size: ${vars.font.size['3xl']}; }
  h3 { font-size: ${vars.font.size['2xl']}; }
  h4 { font-size: ${vars.font.size.xl}; }
  h5 { font-size: ${vars.font.size.lg}; }
  h6 { font-size: ${vars.font.size.base}; }

  a {
    color: ${vars.color.primary};
    text-decoration: underline;
    text-underline-offset: 0.2em;
    transition: color ${vars.transition.fast};
  }

  a:hover {
    color: ${vars.color.primaryHover};
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
  }

  button:disabled {
    cursor: not-allowed;
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
    background-color: ${vars.color.borderStrong};
    border-radius: ${vars.radius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: ${vars.color.text.secondary};
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: ${vars.color.borderStrong} transparent;
  }

  *:focus-visible {
    outline: 2px solid ${vars.color.primary};
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
    background-color: ${vars.color.primaryContainer};
    color: ${vars.color.onPrimaryContainer};
  }
`
