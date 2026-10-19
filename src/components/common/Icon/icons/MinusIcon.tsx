import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const MinusIcon = (props: IconProps) => (
  <Icon name="minus" {...props}>
    <path d="M5 12h14" />
  </Icon>
)
