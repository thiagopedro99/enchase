import 'styled-components'

import type { Theme } from './themes/index.ts'

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}