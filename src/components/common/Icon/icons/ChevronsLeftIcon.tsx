import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const ChevronsLeftIcon = (props: IconProps) => (
  <Icon name="chevrons-left" directional {...props}>
    <path d="M18 17l-5-5 5-5" />
    <path d="M11 17l-5-5 5-5" />
  </Icon>
)
