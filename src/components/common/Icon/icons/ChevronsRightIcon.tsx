import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const ChevronsRightIcon = (props: IconProps) => (
  <Icon name="chevrons-right" {...props}>
    <path d="M6 17l5-5-5-5" />
    <path d="M13 17l5-5-5-5" />
  </Icon>
)
