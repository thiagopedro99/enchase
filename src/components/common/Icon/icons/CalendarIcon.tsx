import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const CalendarIcon = (props: IconProps) => (
  <Icon name="calendar" {...props}>
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <rect width="18" height="16" x="3" y="5" rx="3" />
    <path d="M3 11h18" />
  </Icon>
)
