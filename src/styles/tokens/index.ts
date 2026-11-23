import { baseTokens } from './base.ts'
import { lightTheme } from './light.ts'
import { darkTheme } from './dark.ts'
import { defaultColorHooks, defaultHooks } from './defaultHooks.ts'

import type { ThemeSet } from './types.ts'

export const defaultTheme: ThemeSet = {
  base: baseTokens,
  light: { ...lightTheme, hooks: defaultColorHooks },
  dark: { ...darkTheme, hooks: defaultColorHooks },
  hooks: defaultHooks,
  defaults: { labelPlacement: 'stacked' }
}

export const breakpoints = baseTokens.breakpoints

export { baseTokens, lightTheme, darkTheme }

export { densities } from './density.ts'

export { colorRoles, themeModes } from './types.ts'

export { spring, springPosition, springSettleTime, timedSpring } from './spring.ts'

export type { SpringInput, SpringPerceptual, SpringPhysics, SpringResult, SpringTiming } from './spring.ts'

export type { BaseTokens, ColorRole, ColorTokens, HookValues, LabelPlacement, ModeTokens, ShadowTokens, ThemeDefaults, ThemeMode, ThemeSet } from './types.ts'
