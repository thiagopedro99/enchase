import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const ChevronDownIcon = (props: IconProps) => (
  <Icon name="chevron-down" {...props}>
    <path d="M6 9l6 6 6-6" />
  </Icon>
)
