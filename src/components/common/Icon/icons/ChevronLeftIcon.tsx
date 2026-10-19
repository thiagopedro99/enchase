import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon name="chevron-left" directional {...props}>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
)
