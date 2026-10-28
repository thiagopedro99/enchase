import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const CalendarIcon = (props: IconProps) => (
  <Icon name="calendar" {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </Icon>
)
