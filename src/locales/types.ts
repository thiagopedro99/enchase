import type { UILabels } from '@components/uiProvider/types.ts'

export type Direction = 'ltr' | 'rtl'

export type Locale = {
  locale: string
  dir: Direction
  messages: UILabels
}
