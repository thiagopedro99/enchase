import { assertValidColor } from './color.ts'
import { contrastRatio } from './contrast.ts'
import { oklchToHex, rgbToHex, rgbToOklch } from './oklch.ts'
import { parseColor } from './rgb.ts'

import type { ColorTokens } from '../tokens/types.ts'
import type { BrandColorRole } from './brandRoles.ts'
import type { Oklch } from './oklch.ts'

type Seed = Oklch & { hex: string }

type NeutralTones = typeof lightNeutralTones

export type BrandColors = Pick<ColorTokens, BrandColorRole> & { text: Pick<ColorTokens['text'], 'primary' | 'secondary' | 'placeholder' | 'inverse'> }

const textTarget = 4.6

const chromaOf = {
  neutral: (seed: Oklch) => Math.min(seed.chroma, 0.014),
  tint: (seed: Oklch) => Math.min(seed.chroma * 0.2, 0.05),
  muted: (seed: Oklch) => Math.min(seed.chroma * 0.15, 0.035),
  deep: (seed: Oklch) => Math.min(seed.chroma * 0.5, 0.11),
  strong: (seed: Oklch) => Math.min(seed.chroma * 0.65, 0.15),
  pastel: (seed: Oklch) => Math.min(seed.chroma, 0.1)
}

const lightNeutralTones = {
  background: 0.983,
  surfaceContainerLow: 0.961,
  surfaceContainer: 0.944,
  surfaceContainerHigh: 0.925,
  textPrimary: 0.225,
  textSecondary: 0.398,
  textPlaceholder: 0.489,
  border: 0.828,
  borderStrong: 0.569,
  borderLight: 0.95,
  inverseSurface: 0.312,
  inverseOnSurface: 0.957,
  codeBackground: 0.239
}

const darkNeutralTones: NeutralTones = {
  background: 0.19,
  surfaceContainerLow: 0.225,
  surfaceContainer: 0.243,
  surfaceContainerHigh: 0.289,
  textPrimary: 0.916,
  textSecondary: 0.829,
  textPlaceholder: 0.732,
  border: 0.398,
  borderStrong: 0.656,
  borderLight: 0.272,
  inverseSurface: 0.916,
  inverseOnSurface: 0.312,
  codeBackground: 0.162
}

const tone = (seed: Oklch, tint: keyof typeof chromaOf, lightness: number) => oklchToHex({ lightness, chroma: chromaOf[tint](seed), hue: seed.hue })

const parseSeed = (brand: unknown): Seed => {
  const color = parseColor(assertValidColor('brand', brand))

  if (color === null) throw new Error(`The brand color must be a hex or rgb() color: ${JSON.stringify(brand)}`)
  if (color.a !== 1) throw new Error(`The brand color must be opaque: ${JSON.stringify(brand)}`)

  return { ...rgbToOklch(color), hex: rgbToHex(color) }
}

const neutralColors = (seed: Oklch, tones: NeutralTones) => {
  const at = (lightness: number) => tone(seed, 'neutral', lightness)

  return {
    background: at(tones.background),
    surface: at(tones.background),
    surfaceContainerLow: at(tones.surfaceContainerLow),
    surfaceContainer: at(tones.surfaceContainer),
    surfaceContainerHigh: at(tones.surfaceContainerHigh),
    text: { primary: at(tones.textPrimary), secondary: at(tones.textSecondary), placeholder: at(tones.textPlaceholder) },
    border: at(tones.border),
    borderStrong: at(tones.borderStrong),
    borderLight: at(tones.borderLight),
    inverseSurface: at(tones.inverseSurface),
    inverseOnSurface: at(tones.inverseOnSurface),
    codeBackground: at(tones.codeBackground)
  }
}

const accessiblePrimary = (seed: Seed, backgrounds: string[]) => {
  const passes = (hex: string) => backgrounds.every((background) => contrastRatio(hex, background) >= textTarget)
  const at = (lightness: number) => oklchToHex({ lightness, chroma: seed.chroma, hue: seed.hue })

  if (passes(seed.hex)) return { hex: seed.hex, lightness: seed.lightness }

  const [lightness] = Array.from({ length: 16 }).reduce<[number, number]>(
    ([low, high]) => {
      const middle = (low + high) / 2

      return passes(at(middle)) ? [middle, high] : [low, middle]
    },
    [0, seed.lightness]
  )

  return { hex: at(lightness), lightness }
}

const hoverOf = (seed: Seed, lightness: number) => oklchToHex({ lightness: lightness > 0.35 ? lightness - 0.055 : Math.max(lightness + 0.12, 0.3), chroma: seed.chroma, hue: seed.hue })

export const brandPalette = (brand: string): { light: BrandColors; dark: BrandColors } => {
  const seed = parseSeed(brand)
  const light = neutralColors(seed, lightNeutralTones)
  const dark = neutralColors(seed, darkNeutralTones)
  const lightContainer = tone(seed, 'tint', 0.917)
  const primary = accessiblePrimary(seed, [light.background, light.surfaceContainerLow, light.surfaceContainer, light.surfaceContainerHigh, lightContainer, dark.inverseSurface])
  const darkPrimary = tone(seed, 'pastel', 0.832)
  const darkOnPrimary = tone(seed, 'strong', 0.27)

  return {
    light: {
      ...light,
      primary: primary.hex,
      onPrimary: '#FFFFFF',
      primaryHover: hoverOf(seed, primary.lightness),
      primaryContainer: lightContainer,
      onPrimaryContainer: tone(seed, 'strong', 0.27),
      secondary: tone(seed, 'muted', 0.485),
      onSecondary: '#FFFFFF',
      secondaryContainer: tone(seed, 'muted', 0.915),
      onSecondaryContainer: tone(seed, 'muted', 0.226),
      inversePrimary: darkPrimary,
      text: { ...light.text, inverse: '#FFFFFF' }
    },
    dark: {
      ...dark,
      primary: darkPrimary,
      onPrimary: darkOnPrimary,
      primaryHover: tone(seed, 'tint', 0.914),
      primaryContainer: tone(seed, 'deep', 0.351),
      onPrimaryContainer: tone(seed, 'tint', 0.917),
      secondary: tone(seed, 'muted', 0.83),
      onSecondary: tone(seed, 'muted', 0.312),
      secondaryContainer: tone(seed, 'muted', 0.398),
      onSecondaryContainer: tone(seed, 'muted', 0.915),
      inversePrimary: primary.hex,
      text: { ...dark.text, inverse: darkOnPrimary }
    }
  }
}
