import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const HomeIcon = (props: IconProps) => (
  <Icon name="home" {...props}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </Icon>
)
