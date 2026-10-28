import type { CSSProperties, ReactNode, RefObject } from 'react'
import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'

export interface ListboxPopupProps {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  id: string
  labelledBy?: string | undefined
  label?: string | undefined
  multiple: boolean
  busy: boolean
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
  onClose: () => void
  children: ReactNode
}
