import { timedSpring } from './spring.ts'

const easeOut = 'cubic-bezier(0.2, 0, 0, 1)'

const easeInOut = 'cubic-bezier(0.4, 0, 0.2, 1)'

const duration = { fast: '150ms', base: '250ms', slow: '300ms' }

const gentle = timedSpring({ duration: 0.3 })

const snappy = timedSpring({ duration: 0.3, bounce: 0.15 })

const bouncy = timedSpring({ duration: 0.4, bounce: 0.3 })

export const baseTokens = {
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
    control: '0.5rem',
    full: '9999px'
  },

  control: {
    height: { sm: '2rem', md: '2.5rem', lg: '3rem' }
  },

  motion: {
    duration,
    ease: { out: easeOut, inOut: easeInOut },
    spring: {
      gentle: gentle.easing,
      gentleDuration: `${gentle.duration}ms`,
      snappy: snappy.easing,
      snappyDuration: `${snappy.duration}ms`,
      bouncy: bouncy.easing,
      bouncyDuration: `${bouncy.duration}ms`
    },
    distance: { xs: '2px', sm: '12px', md: '32px' }
  },

  transitions: {
    fast: `${duration.fast} ${easeOut}`,
    normal: `${duration.base} ${easeOut}`,
    slow: `${duration.slow} ${easeOut}`
  },

  state: {
    hover: '0.08',
    focus: '0.1',
    pressed: '0.1'
  },

  breakpoints: {
    xs: '0px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px'
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
