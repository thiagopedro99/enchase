import type { PortalContainer } from '@utils/portalContainer.ts'
import type { MotionOverride } from '@motion/types.ts'
import type { CSSProperties, ReactNode } from 'react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type ModalRole = 'dialog' | 'alertdialog'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | undefined
  ariaLabel?: string | undefined
  role?: ModalRole | undefined
  children: ReactNode
  footer?: ReactNode | undefined
  showCloseButton?: boolean | undefined
  closeOnOverlayClick?: boolean | undefined
  closeOnEsc?: boolean | undefined
  size?: ModalSize | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}

export type ModalDialogProps = Required<Pick<ModalProps, 'role' | 'showCloseButton' | 'closeOnOverlayClick' | 'closeOnEsc' | 'size'>> &
  Omit<ModalProps, 'isOpen' | 'role' | 'showCloseButton' | 'closeOnOverlayClick' | 'closeOnEsc' | 'size' | 'container'>

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string | undefined
  message: string
  confirmText?: string | undefined
  cancelText?: string | undefined
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | undefined
  container?: PortalContainer | undefined
  animation?: MotionOverride | undefined
  className?: string | undefined
  style?: CSSProperties | undefined
}
