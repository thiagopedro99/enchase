import { Icon } from '../Icon/index.tsx'

import type { IconProps } from '../Icon/types.ts'

export const BoardHandleIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="6" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="18" r="1" />
  </Icon>
)

export const BoardMenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </Icon>
)
