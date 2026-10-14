import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const CloseIcon = (props: IconProps) => (
  <Icon name="close" {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </Icon>
)
