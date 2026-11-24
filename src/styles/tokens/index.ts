import { baseTokens } from './base.ts'
import { lightTheme } from './light.ts'
import { darkTheme } from './dark.ts'
import { enchaseStyle } from './enchase.ts'

import type { ThemeSet } from './types.ts'

const base = {
  ...baseTokens,
  control: { ...baseTokens.control, ...enchaseStyle.base?.control },
  focus: { ...baseTokens.focus, ...enchaseStyle.base?.focus },
  border: { ...baseTokens.border, ...enchaseStyle.base?.border },
  halo: { ...baseTokens.halo, ...enchaseStyle.base?.halo },
  hit: { ...baseTokens.hit, ...enchaseStyle.base?.hit },
  borderRadius: { ...baseTokens.borderRadius, ...enchaseStyle.radius }
}

const light = {
  colors: { ...lightTheme.colors, ...enchaseStyle.light?.colors, text: { ...lightTheme.colors.text, ...enchaseStyle.light?.colors?.text } },
  shadows: { ...lightTheme.shadows, ...enchaseStyle.light?.shadows },
  hooks: enchaseStyle.colorHooks
}

const dark = {
  colors: { ...darkTheme.colors, ...enchaseStyle.dark?.colors, text: { ...darkTheme.colors.text, ...enchaseStyle.dark?.colors?.text } },
  shadows: { ...darkTheme.shadows, ...enchaseStyle.dark?.shadows },
  hooks: enchaseStyle.colorHooks
}

export const defaultTheme: ThemeSet = {
  base,
  light,
  dark,
  hooks: enchaseStyle.hooks,
  density: enchaseStyle.density,
  defaults: enchaseStyle.defaults,
  hooksSpecificity: enchaseStyle.hooksSpecificity
}

export const breakpoints = baseTokens.breakpoints

export { baseTokens, lightTheme, darkTheme }

export { densities } from './density.ts'

export { colorRoles, themeModes } from './types.ts'

export { spring, springPosition, springSettleTime, timedSpring } from './spring.ts'

export type { SpringInput, SpringPerceptual, SpringPhysics, SpringResult, SpringTiming } from './spring.ts'

export type { BaseTokens, ColorRole, ColorTokens, HookValues, LabelPlacement, ModeTokens, ShadowTokens, ThemeDefaults, ThemeMode, ThemeSet } from './types.ts'
