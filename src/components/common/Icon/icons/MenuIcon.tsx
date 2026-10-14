import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const MenuIcon = (props: IconProps) => (
  <Icon name="menu" {...props}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </Icon>
)
