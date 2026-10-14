import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const InfoIcon = (props: IconProps) => (
  <Icon name="info" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5" />
    <path d="M12 8h.01" />
  </Icon>
)
