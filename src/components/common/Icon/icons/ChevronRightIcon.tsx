import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const ChevronRightIcon = (props: IconProps) => (
  <Icon name="chevron-right" directional {...props}>
    <path d="M9 6l6 6-6 6" />
  </Icon>
)
