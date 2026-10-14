import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const AlertTriangleIcon = (props: IconProps) => (
  <Icon name="alert-triangle" {...props}>
    <path d="M12 4l9 15.5H3L12 4z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </Icon>
)
