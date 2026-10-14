import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const MenuOpenIcon = (props: IconProps) => (
  <Icon name="menu-open" directional {...props}>
    <path d="M3 6h13" />
    <path d="M3 12h9" />
    <path d="M3 18h13" />
    <path d="M21 8l-4 4 4 4" />
  </Icon>
)
