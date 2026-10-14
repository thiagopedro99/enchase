import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const LogOutIcon = (props: IconProps) => (
  <Icon name="log-out" directional {...props}>
    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
    <path d="M10 12h10" />
    <path d="M16 8l4 4-4 4" />
  </Icon>
)
