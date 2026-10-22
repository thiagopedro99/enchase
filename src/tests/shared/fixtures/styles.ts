import { enchase } from '@styles/presets/enchase.ts'
import { shadcn } from '@styles/presets/shadcn.ts'

import type { ThemeStyle } from '@styles/theme/style.ts'

export const builtInStyles: Record<string, ThemeStyle> = { enchase, shadcn }

export const builtInStyleEntries = Object.entries(builtInStyles)
