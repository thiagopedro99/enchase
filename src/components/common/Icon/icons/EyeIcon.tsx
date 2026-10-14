import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const EyeIcon = (props: IconProps) => (
  <Icon name="eye" {...props}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
)
