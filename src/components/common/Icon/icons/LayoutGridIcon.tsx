import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const LayoutGridIcon = (props: IconProps) => (
  <Icon name="layout-grid" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
)
