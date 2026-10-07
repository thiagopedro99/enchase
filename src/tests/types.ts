import type { UIProviderProps } from '@components/uiProvider/types.ts'
import type { ColorMode } from '@components/colorMode/types.ts'

export type RenderWithProvidersOptions = {
  theme?: ColorMode
  route?: string
  motion?: UIProviderProps['motion']
  labels?: UIProviderProps['labels']
}
