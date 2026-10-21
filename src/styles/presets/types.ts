import type { BrandColors } from '../theme/brand.ts'
import type { RadiusTokens } from '../theme/shape.ts'
import type { BaseTokens, ColorTokens, HookValues, ShadowTokens, ThemeDefaults } from '../tokens/types.ts'

export type StyleName = 'enchase' | 'shadcn'

type Partial2<Tokens> = { [Key in keyof Tokens]?: Tokens[Key] extends string | number ? Tokens[Key] : Partial2<Tokens[Key]> }

export type StyleModeDefinition = {
  colors?: Partial2<ColorTokens>
  shadows?: Partial<ShadowTokens>
  hooks?: HookValues
}

export type StyleDefinition = {
  base?: Partial2<Pick<BaseTokens, 'control' | 'focus' | 'border' | 'halo' | 'hit' | 'state'>>
  fonts?: Partial2<Pick<BaseTokens['fonts'], 'sizes' | 'weights' | 'lineHeights' | 'letterSpacings'>>
  radius?: RadiusTokens
  hooks?: HookValues
  colorHooks?: HookValues
  brand?: ReadonlyArray<keyof BrandColors>
  light?: StyleModeDefinition
  dark?: StyleModeDefinition
  defaults?: Partial<ThemeDefaults>
}
