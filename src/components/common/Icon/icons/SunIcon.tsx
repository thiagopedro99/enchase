import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const SunIcon = (props: IconProps) => (
  <Icon name="sun" {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="M3 12h2" />
    <path d="M19 12h2" />
    <path d="M5.6 5.6L7 7" />
    <path d="M17 17l1.4 1.4" />
    <path d="M5.6 18.4L7 17" />
    <path d="M17 7l1.4-1.4" />
  </Icon>
)
