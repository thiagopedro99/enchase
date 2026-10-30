import { createContext, useContext } from 'react'

import type { FieldVariant, LabelPlacement, ThemeDefaults } from '@styles/tokens/types.ts'

export const defaultThemeDefaults: ThemeDefaults = { labelPlacement: 'floating' }

export const ThemeDefaultsContext = createContext<ThemeDefaults>(defaultThemeDefaults)

export const useThemeDefaults = () => useContext(ThemeDefaultsContext)

export const useLabelPlacement = (labelPlacement: LabelPlacement | undefined, variant: FieldVariant): LabelPlacement => {
  const themeDefaults = useThemeDefaults()
  const requested = labelPlacement ?? themeDefaults.labelPlacement

  return requested === 'floating' && variant !== 'outlined' ? 'stacked' : requested
}
