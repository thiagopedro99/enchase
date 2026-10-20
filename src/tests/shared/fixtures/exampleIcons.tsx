import { Icon } from '@components/common/Icon/index.tsx'

import type { IconProps } from '@components/common/Icon/types.ts'

export const HomeIcon = (props: IconProps) => (
  <Icon name="home" {...props}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-6h4v6" />
  </Icon>
)

export const BookOpenIcon = (props: IconProps) => (
  <Icon name="book-open" {...props}>
    <path d="M12 6v14" />
    <path d="M12 6c-1.5-1.5-4-2-8-2v14c4 0 6.5.5 8 2" />
    <path d="M12 6c1.5-1.5 4-2 8-2v14c-4 0-6.5.5-8 2" />
  </Icon>
)

export const LayoutGridIcon = (props: IconProps) => (
  <Icon name="layout-grid" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
)

export const RocketIcon = (props: IconProps) => (
  <Icon name="rocket" {...props}>
    <path d="M12 2c3 2 5 6 5 10l-2 5H9l-2-5c0-4 2-8 5-10z" />
    <circle cx="12" cy="10" r="1.5" />
    <path d="M7 14l-3 3 3 1" />
    <path d="M17 14l3 3-3 1" />
    <path d="M10 20l2 2 2-2" />
  </Icon>
)
