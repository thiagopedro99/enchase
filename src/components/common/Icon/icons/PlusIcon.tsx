import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const PlusIcon = (props: IconProps) => (
  <Icon name="plus" {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </Icon>
)
