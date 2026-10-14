import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const CheckIcon = (props: IconProps) => (
  <Icon name="check" {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)
