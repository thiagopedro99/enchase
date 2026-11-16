import { Icon } from 'enchase'

import type { IconProps } from 'enchase'

type LandingIconProps = Omit<IconProps, 'children' | 'name'>

export const CopyIcon = (props: LandingIconProps) => (
  <Icon name="copy" {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </Icon>
)

export const AccessibilityIcon = (props: LandingIconProps) => (
  <Icon name="accessibility" {...props}>
    <circle cx="12" cy="5" r="1.5" />
    <path d="M5 9h14" />
    <path d="M12 9v5" />
    <path d="M12 14l-3.5 6" />
    <path d="M12 14l3.5 6" />
  </Icon>
)

export const BrushIcon = (props: LandingIconProps) => (
  <Icon name="brush" {...props}>
    <path d="M19 3l2 2-9 9-3 1 1-3 9-9z" />
    <path d="M8 15c-2.5 0-4 1.5-4 4 0 1-1 1.5-1 1.5S5 22 7 22c2.2 0 4-1.8 4-4" />
  </Icon>
)

export const LayersIcon = (props: LandingIconProps) => (
  <Icon name="layers" {...props}>
    <path d="M12 3l9 5-9 5-9-5 9-5z" />
    <path d="M3 12l9 5 9-5" />
    <path d="M3 16l9 5 9-5" />
  </Icon>
)

export const CodeIcon = (props: LandingIconProps) => (
  <Icon name="code" {...props}>
    <path d="M8 7l-5 5 5 5" />
    <path d="M16 7l5 5-5 5" />
    <path d="M14 4l-4 16" />
  </Icon>
)

export const PuzzleIcon = (props: LandingIconProps) => (
  <Icon name="puzzle" {...props}>
    <path d="M9 4h4v2.5a1.5 1.5 0 0 0 3 0V4h4v5h-2.5a1.5 1.5 0 0 0 0 3H20v8h-5v-2.5a1.5 1.5 0 0 0-3 0V20H4v-6h2.5a1.5 1.5 0 0 0 0-3H4V4h5z" />
  </Icon>
)

export const FeatherIcon = (props: LandingIconProps) => (
  <Icon name="feather" {...props}>
    <path d="M20 4c-6-1-12 3-13 10l-3 6" />
    <path d="M20 4c1 6-3 12-10 13H6" />
    <path d="M9 15l6-6" />
  </Icon>
)
