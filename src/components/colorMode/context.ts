import { createContext } from 'react'

import { shared } from '@utils/shared.ts'

import type { ColorModeContextValue } from './types.ts'

export const ColorModeContext = shared('colorModeContext.v1', () => createContext<ColorModeContextValue | null>(null))
