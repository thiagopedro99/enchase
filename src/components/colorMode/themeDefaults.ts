import { createContext, useContext } from 'react'

import type { ThemeDefaults } from '@styles/tokens/types.ts'

export const defaultThemeDefaults: ThemeDefaults = { labelPlacement: 'floating' }

export const ThemeDefaultsContext = createContext<ThemeDefaults>(defaultThemeDefaults)

export const useThemeDefaults = () => useContext(ThemeDefaultsContext)
