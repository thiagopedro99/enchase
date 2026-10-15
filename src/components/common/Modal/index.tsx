import { createPortal } from 'react-dom'

import { useIsClient } from '@hooks/useIsClient.ts'
import { useId, useRef } from 'react'
import { CloseIcon } from '../Icon/icons/CloseIcon.tsx'

import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { Button } from '../Button/index.tsx'
import { Flex } from '../Flex/index.tsx'
import styles from './styles.module.css'

import type { PresenceState } from '@hooks/usePresence.ts'
import type { CSSProperties, RefObject } from 'react'
import type { ModalDialogProps, ModalProps, ConfirmModalProps } from './types.ts'

const ModalDialog = ({
  onClose,
  open,
  state,
  panelRef,
  title,
  ariaLabel,
  role,
  children,
  footer,
  showCloseButton,
  closeOnOverlayClick,
  closeOnEsc,
  size,
  className,
  style,
  motionStyle
}: ModalDialogProps & { open: boolean; state: PresenceState; panelRef: RefObject<HTMLDivElement | null>; motionStyle: CSSProperties }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const bodyId = useId()
  const { labels } = useUIConfig()
  const isTop = useOverlayStack(open)

  useModalBehavior({ rootRef, dialogRef: panelRef, onEscape: closeOnEsc ? () => isTop() && onClose() : undefined })

  const panelProps = mergeProps(
    {
      ...slot('modal', 'panel'),
      className: styles.container,
      style: motionStyle,
      'data-state': state,
      'data-size': size,
      role,
      'aria-modal': true,
      'aria-labelledby': title ? titleId : undefined,
      'aria-label': title ? undefined : ariaLabel,
      'aria-describedby': role === 'alertdialog' ? bodyId : undefined,
      tabIndex: -1
    },
    { className, style }
  )

  return (
    <div ref={rootRef} {...slot('modal')}>
      <div {...slot('modal', 'overlay')} className={styles.backdrop} style={motionStyle} data-state={state} onClick={closeOnOverlayClick ? () => isTop.wasTopAtPointerDown() && onClose() : undefined} />

      <div ref={panelRef} {...panelProps}>
        {(title || showCloseButton) && (
          <div {...slot('modal', 'header')} className={styles.header}>
            {title && (
              <h2 {...slot('modal', 'title')} id={titleId} className={styles.title}>
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button {...slot('modal', 'close')} type="button" className={styles.close} onClick={onClose} aria-label={labels.closeModal}>
                <CloseIcon size={20} />
              </button>
            )}
          </div>
        )}

        <div {...slot('modal', 'body')} id={bodyId} className={styles.body}>
          {children}
        </div>

        {footer && (
          <div {...slot('modal', 'footer')} className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

const modalBase = { distance: 0, spring: 'gentle' } as const

export const Modal = ({
  isOpen,
  role = 'dialog',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  size = 'md',
  ...props
}: ModalProps) => {
  const motionStyle = useMotionStyle('pop', 'modal', props.animation, undefined, modalBase)
  const isClient = useIsClient()
  const { mounted, state, ref } = usePresence<HTMLDivElement>(isOpen)

  if (!isClient) return null

  return createPortal(
    mounted ? (
      <ModalDialog
        role={role}
        showCloseButton={showCloseButton}
        closeOnOverlayClick={closeOnOverlayClick}
        closeOnEsc={closeOnEsc}
        size={size}
        open={isOpen}
        state={state}
        panelRef={ref}
        motionStyle={motionStyle}
        {...props}
      />
    ) : null,
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
  animation,
  className,
  style
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
      className={className}
      style={style}
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
