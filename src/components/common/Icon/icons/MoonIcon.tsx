import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const MoonIcon = (props: IconProps) => (
  <Icon name="moon" {...props}>
    <path d="M20 14.2A8 8 0 0 1 9.8 4 8 8 0 1 0 20 14.2z" />
  </Icon>
)
