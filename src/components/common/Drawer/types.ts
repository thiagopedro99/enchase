import type { PortalContainer } from '@utils/portalContainer.ts'
import type { PresenceState } from '@hooks/usePresence.ts'
import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode, RefObject } from 'react'

export type DrawerSide = 'start' | 'end'

export type DrawerSize = 'sm' | 'md' | 'lg'

export interface DrawerProps {
  open: boolean
  onClose: () => void
  title?: string | undefined
  ariaLabel?: string | undefined
  children: ReactNode
  footer?: ReactNode | undefined
  side?: DrawerSide | undefined
  size?: DrawerSize | undefined
  showCloseButton?: boolean | undefined
  closeOnOverlayClick?: boolean | undefined
  closeOnEsc?: boolean | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}

export type DrawerDialogProps = Required<Pick<DrawerProps, 'side' | 'size' | 'showCloseButton' | 'closeOnOverlayClick' | 'closeOnEsc'>> &
  Omit<DrawerProps, 'side' | 'size' | 'showCloseButton' | 'closeOnOverlayClick' | 'closeOnEsc' | 'container' | 'animation'> & {
    state: PresenceState
    panelRef: RefObject<HTMLDivElement | null>
    motionStyle: CSSProperties
  }

export type DrawerPart = Record<string, unknown>

export interface DrawerLayerProps {
  open: boolean
  state: PresenceState
  panelRef: RefObject<HTMLDivElement | null>
  label?: string | undefined
  labelledBy?: string | undefined
  onClose?: (() => void) | undefined
  closeOnOverlayClick?: boolean | undefined
  closeOnEsc?: boolean | undefined
  root: DrawerPart
  overlay: DrawerPart
  panel: DrawerPart
  children: ReactNode
}
