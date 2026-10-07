import type { MotionOverride } from '@motion/types.ts'
import type { ReactNode } from 'react'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export type ModalRole = 'dialog' | 'alertdialog'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  ariaLabel?: string
  role?: ModalRole
  children: ReactNode
  footer?: ReactNode
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  size?: ModalSize
  animation?: MotionOverride
}

export type ModalDialogProps = Required<Pick<ModalProps, 'role' | 'showCloseButton' | 'closeOnOverlayClick' | 'closeOnEsc' | 'size'>> &
  Omit<ModalProps, 'isOpen' | 'role' | 'showCloseButton' | 'closeOnOverlayClick' | 'closeOnEsc' | 'size'>

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  animation?: MotionOverride
}
