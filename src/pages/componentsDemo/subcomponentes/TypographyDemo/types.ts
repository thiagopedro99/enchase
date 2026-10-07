import type { Theme } from '@styles/themes/index.ts'

export type SizeToken = keyof Theme['fonts']['sizes']

export type WeightToken = keyof Theme['fonts']['weights']

export type TypeScaleEntry = {
  token: SizeToken
  role: string
  sample: string
}
