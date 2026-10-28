import type { PresenceState } from '@hooks/usePresence.ts'
import type { ReactNode, RefObject } from 'react'

export type DrawerPart = Record<string, unknown>

export interface DrawerLayerProps {
  open: boolean
  state: PresenceState
  panelRef: RefObject<HTMLDivElement | null>
  label: string
  onClose?: (() => void) | undefined
  root: DrawerPart
  overlay: DrawerPart
  panel: DrawerPart
  children: ReactNode
}
