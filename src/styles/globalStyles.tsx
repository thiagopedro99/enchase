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
    font-family: var(--enchase-font-primary);
    font-size: var(--enchase-font-size-base);
    color: var(--enchase-color-text-primary);
    background-color: var(--enchase-color-background);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
    transition: color var(--enchase-transition-normal), background-color var(--enchase-transition-normal);
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--enchase-font-weight-medium);
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin-bottom: var(--enchase-space-md);
  }

  h1 { font-size: var(--enchase-font-size-4xl); }
  h2 { font-size: var(--enchase-font-size-3xl); }
  h3 { font-size: var(--enchase-font-size-2xl); }
  h4 { font-size: var(--enchase-font-size-xl); }
  h5 { font-size: var(--enchase-font-size-lg); }
  h6 { font-size: var(--enchase-font-size-base); }

  a {
    color: var(--enchase-color-primary);
    text-decoration: underline;
    text-underline-offset: 0.2em;
    transition: color var(--enchase-transition-fast);
  }

  a:hover {
    color: var(--enchase-color-primary-hover);
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
    background-color: var(--enchase-color-border-strong);
    border-radius: var(--enchase-radius-full);
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--enchase-color-text-secondary);
  }

  * {
    scrollbar-width: thin;
    scrollbar-color: var(--enchase-color-border-strong) transparent;
  }

  *:focus-visible {
    outline: 2px solid var(--enchase-color-primary);
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
    background-color: var(--enchase-color-primary-container);
    color: var(--enchase-color-on-primary-container);
  }
`

export const GlobalStyles = () => <style>{globalStylesCss}</style>

export default GlobalStyles
