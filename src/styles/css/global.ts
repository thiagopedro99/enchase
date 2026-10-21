import { vars } from './vars.ts'

export const globalStylesCss = `
  @layer enchase-base {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    scrollbar-gutter: stable;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    font-family: ${vars.font.primary};
    font-size: ${vars.font.size.base};
    color: ${vars.color.text.primary};
    background-color: ${vars.color.background};
    line-height: var(--enchase-line-height-normal, 1.5);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    min-height: 100dvh;
    transition: color ${vars.transition.normal}, background-color ${vars.transition.normal};
  }

  #root {
    min-height: 100vh;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${vars.font.weight.medium};
    line-height: var(--enchase-line-height-tight, 1.2);
    letter-spacing: var(--enchase-letter-spacing-tight, -0.01em);
    margin-bottom: ${vars.space.md};
    text-wrap: balance;
  }

  p {
    text-wrap: pretty;
  }

  h1 { font-size: ${vars.font.size['4xl']}; }
  h2 { font-size: ${vars.font.size['3xl']}; }
  h3 { font-size: ${vars.font.size['2xl']}; }
  h4 { font-size: ${vars.font.size.xl}; }
  h5 { font-size: ${vars.font.size.lg}; }
  h6 { font-size: ${vars.font.size.base}; }

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
    outline: ${vars.focus.width} solid var(--enchase-focus-color, ${vars.color.primary});
    outline-offset: ${vars.focus.offset};
  }

  @media (prefers-reduced-motion: reduce) {
    *:not([data-motion='on']), *:not([data-motion='on'])::before, *:not([data-motion='on'])::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  ::selection {
    background-color: ${vars.color.primaryContainer};
    color: ${vars.color.onPrimaryContainer};
  }
  }
`