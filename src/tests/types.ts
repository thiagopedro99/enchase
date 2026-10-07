import type { UIProviderProps } from '@components/uiProvider/types.ts'
import type { ThemeType } from '@styles/themes/index.ts'

export type RenderWithProvidersOptions = {
  theme?: ThemeType
  route?: string
  motion?: UIProviderProps['motion']
  labels?: UIProviderProps['labels']
}
