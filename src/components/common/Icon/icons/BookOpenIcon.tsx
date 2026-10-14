import { Icon } from '../index.tsx'

import type { IconProps } from '../types.ts'

export const BookOpenIcon = (props: IconProps) => (
  <Icon name="book-open" {...props}>
    <path d="M12 6v14" />
    <path d="M12 6c-1.5-1.5-4-2-8-2v14c4 0 6.5.5 8 2" />
    <path d="M12 6c1.5-1.5 4-2 8-2v14c-4 0-6.5.5-8 2" />
  </Icon>
)
