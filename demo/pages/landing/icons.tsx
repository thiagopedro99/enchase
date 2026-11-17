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

export const PauseIcon = (props: LandingIconProps) => (
  <Icon name="pause" {...props}>
    <path d="M9 5v14" />
    <path d="M15 5v14" />
  </Icon>
)

export const PlayIcon = (props: LandingIconProps) => (
  <Icon name="play" {...props}>
    <path d="M8 5l11 7-11 7V5z" />
  </Icon>
)

export const GripIcon = (props: LandingIconProps) => (
  <Icon name="grip" {...props}>
    <path d="M9 7l-5 5 5 5" />
    <path d="M15 7l5 5-5 5" />
  </Icon>
)

export const HomeIcon = (props: LandingIconProps) => (
  <Icon name="home" {...props}>
    <path d="M4 11l8-7 8 7" />
    <path d="M6 10v9h12v-9" />
  </Icon>
)

export const FolderIcon = (props: LandingIconProps) => (
  <Icon name="folder" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  </Icon>
)

export const UsersIcon = (props: LandingIconProps) => (
  <Icon name="users" {...props}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M16 5.5a3 3 0 0 1 0 5" />
    <path d="M18 14.5c1.8.8 3 2.7 3 5.5" />
  </Icon>
)

export const ChartIcon = (props: LandingIconProps) => (
  <Icon name="chart" {...props}>
    <path d="M4 20V10" />
    <path d="M10 20V4" />
    <path d="M16 20v-7" />
    <path d="M22 20H2" />
  </Icon>
)

export const SettingsIcon = (props: LandingIconProps) => (
  <Icon name="settings" {...props}>
    <path d="M4 7h10" />
    <path d="M18 7h2" />
    <circle cx="16" cy="7" r="2" />
    <path d="M4 17h2" />
    <path d="M10 17h10" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
)

export const GemIcon = (props: LandingIconProps) => (
  <Icon name="gem" {...props}>
    <path d="M6 4h12l4 6-10 11L2 10l4-6z" />
    <path d="M2 10h20" />
    <path d="M9 4l-2 6 5 11 5-11-2-6" />
  </Icon>
)
