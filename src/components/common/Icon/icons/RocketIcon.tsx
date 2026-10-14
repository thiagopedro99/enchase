import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const RocketIcon = (props: IconProps) => (
  <Icon name="rocket" {...props}>
    <path d="M12 2c3 2 5 6 5 10l-2 5H9l-2-5c0-4 2-8 5-10z" />
    <circle cx="12" cy="10" r="1.5" />
    <path d="M7 14l-3 3 3 1" />
    <path d="M17 14l3 3-3 1" />
    <path d="M10 20l2 2 2-2" />
  </Icon>
)
