import { MoonIcon, SunIcon } from 'enchase/icons'

import type { SegmentedControlItem } from 'enchase'

export const modes: SegmentedControlItem[] = [
  {
    value: 'light',
    label: (
      <>
        <SunIcon size={16} />
        Claro
      </>
    )
  },
  {
    value: 'dark',
    label: (
      <>
        <MoonIcon size={16} />
        Escuro
      </>
    )
  },
  { value: 'system', label: 'Sistema' }
]

export const roles = ['primary', 'primary-container', 'secondary-container', 'surface-container-high', 'inverse-surface']
