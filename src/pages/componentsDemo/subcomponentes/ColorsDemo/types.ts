import type { Theme } from '@styles/themes/index.ts'

export type ColorToken = Exclude<keyof Theme['colors'], 'text'>

export type SwatchEntry = {
  token: ColorToken
  on?: ColorToken
  outline?: boolean
}

export type ColorGroup = {
  id: string
  title: string
  entries: SwatchEntry[]
}
