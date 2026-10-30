import { enchase } from '@styles/presets/enchase.ts'
import { defineStyle } from '@styles/theme/style.ts'
import { shadcn } from '@styles/presets/shadcn.ts'

import type { ThemeStyle } from '@styles/theme/style.ts'

export const builtInStyles: Record<string, ThemeStyle> = { enchase, shadcn }

export const builtInStyleEntries = Object.entries(builtInStyles)

export const denseStyle = defineStyle({
  base: {
    control: { height: { sm: '1.875rem', md: '2.25rem', lg: '2.75rem' } },
    hit: { size: '28px' }
  },
  hooks: {
    '--enchase-input-height': '2.25rem',
    '--enchase-input-padding-inline': '0.75rem',
    '--enchase-navbar-bar-height': '3rem'
  },
  density: {
    compact: {
      tokens: {
        '--enchase-hit-size': '24px',
        '--enchase-control-height-md': '1.75rem',
        '--enchase-space-sm': '0.25rem',
        '--enchase-space-md': '0.5rem',
        '--enchase-font-size-base': '0.9375rem',
        '--enchase-font-size-xl': '1.25rem',
        '--enchase-line-height-normal': 1.6
      },
      hooks: { '--enchase-input-height': '2rem' }
    }
  }
})
