const standardEasing = 'cubic-bezier(0.2, 0, 0, 1)'

export const sharedTokens = {
  fonts: {
    primary: "'Figtree Variable', 'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      '2xl': '1.75rem',
      '3xl': '2rem',
      '4xl': '2.75rem',
      '5xl': '3.5rem'
    },
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  borderRadius: {
    none: '0',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '1.75rem',
    full: '9999px'
  },

  transitions: {
    fast: `150ms ${standardEasing}`,
    normal: `250ms ${standardEasing}`,
    slow: `350ms ${standardEasing}`
  },

  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
}
