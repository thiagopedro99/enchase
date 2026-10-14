import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const ExternalLinkIcon = (props: IconProps) => (
  <Icon name="external-link" {...props}>
    <path d="M10 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" />
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
  </Icon>
)
