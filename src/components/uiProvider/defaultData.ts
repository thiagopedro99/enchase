import { defaultMotionSettings } from '../../motion/defaultData.ts'
import { baseTokens } from '../../styles/tokens/base.ts'
import { en } from '../../locales/en.ts'

import type { UIConfig } from './types.ts'

export const defaultLabels = en.messages

export const defaultDir = en.dir

export const defaultLocale = en.locale

export const defaultBreakpoints = baseTokens.breakpoints

export const defaultUIConfig: UIConfig = {
  motion: defaultMotionSettings,
  labels: defaultLabels,
  dir: defaultDir,
  locale: defaultLocale,
  breakpoints: defaultBreakpoints
}
