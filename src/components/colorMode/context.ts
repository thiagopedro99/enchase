import { createContext } from 'react'

import type { ColorModeContextValue } from './types.ts'

export const ColorModeContext = createContext<ColorModeContextValue | null>(null)
