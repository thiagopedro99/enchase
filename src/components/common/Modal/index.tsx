import { createPortal } from 'react-dom'

import { usePortalContainer } from '@hooks/usePortalContainer.ts'
import { useId, useRef } from 'react'
import { CloseIcon } from '../Icon/icons/CloseIcon.tsx'

import { useModalBehavior } from '@hooks/useModalBehavior.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { useOverflow } from '@hooks/useOverflow.ts'
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
  const bodyRef = useRef<HTMLDivElement>(null)
  const overflowing = useOverflow(bodyRef)
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

        <div
          ref={bodyRef}
          {...slot('modal', 'body')}
          id={bodyId}
          className={styles.body}
          tabIndex={overflowing ? 0 : undefined}
          role={overflowing && (title || ariaLabel) ? 'region' : undefined}
          aria-labelledby={overflowing && title ? titleId : undefined}
          aria-label={overflowing && !title ? ariaLabel : undefined}
        >
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
  container,
  ...props
}: ModalProps) => {
  const motionStyle = useMotionStyle('pop', 'modal', props.animation, undefined, modalBase)
  const target = usePortalContainer(container)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(isOpen)

  if (!target) return null

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
    target
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
  container,
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
      container={container}
      animation={animation}
      className={className}
      style={style}
      footer={
        <Flex justify="end" className={styles.actions}>
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
