import { AnimatePresence, motion } from 'motion/react'
import { createPortal } from 'react-dom'
import { useId, useRef } from 'react'
import { X } from 'lucide-react'

import { useModalBehavior } from '@hooks/useModalBehavior.stack.ts'
import { wasTopAtPointerDown } from '@hooks/overlayStack.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { Button } from '../Button/index.tsx'
import { Flex } from '../Flex/index.tsx'
import styles from './styles.module.css'

import type { ModalDialogProps, ModalProps, ConfirmModalProps } from './types.ts'

const ModalDialog = ({
  onClose,
  title,
  ariaLabel,
  role,
  children,
  footer,
  showCloseButton,
  closeOnOverlayClick,
  closeOnEsc,
  size,
  animation
}: ModalDialogProps) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const bodyId = useId()
  const { labels } = useUIConfig()
  const backdropMotion = useMotionRecipe('fade', animation === false ? false : undefined)
  const dialogMotion = useMotionRecipe('pop', animation)

  const layer = useModalBehavior({ rootRef, dialogRef, onEscape: closeOnEsc ? onClose : undefined })

  return (
    <div ref={rootRef}>
      <motion.div {...backdropMotion} className={styles.backdrop} onClick={closeOnOverlayClick ? () => wasTopAtPointerDown(layer) && onClose() : undefined} />

      <motion.div
        {...dialogMotion}
        ref={dialogRef}
        className={styles.container}
        data-size={size}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        aria-describedby={role === 'alertdialog' ? bodyId : undefined}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className={styles.header}>
            {title && (
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button type="button" className={styles.close} onClick={onClose} aria-label={labels.closeModal}>
                <X size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div id={bodyId} className={styles.body}>
          {children}
        </div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </motion.div>
    </div>
  )
}

export const Modal = ({
  isOpen,
  role = 'dialog',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  size = 'md',
  ...props
}: ModalProps) => {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalDialog
          key="modal-dialog"
          role={role}
          showCloseButton={showCloseButton}
          closeOnOverlayClick={closeOnOverlayClick}
          closeOnEsc={closeOnEsc}
          size={size}
          {...props}
        />
      )}
    </AnimatePresence>,
    document.body
  )
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmVariant = 'primary',
  animation
}: ConfirmModalProps) => {
  const { labels } = useUIConfig()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? labels.confirmAction}
      role="alertdialog"
      animation={animation}
      footer={
        <Flex justify="end" gap="0.5rem">
          <Button variant="outline" onClick={onClose} data-autofocus>
            {cancelText ?? labels.cancel}
          </Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>
            {confirmText ?? labels.confirm}
          </Button>
        </Flex>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}

export default Modal
