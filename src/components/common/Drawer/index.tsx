import { createPortal } from 'react-dom'
import { useId } from 'react'

import { defaultCloseOnEsc, defaultCloseOnOverlayClick, defaultShowCloseButton, defaultSide, defaultSize } from './defaultData.ts'
import { usePortalContainer } from '@hooks/usePortalContainer.ts'
import { CloseIcon } from '../Icon/icons/CloseIcon.tsx'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { DrawerLayer } from './DrawerLayer.tsx'
import styles from './styles.module.css'

import type { DrawerDialogProps, DrawerProps } from './types.ts'

const DrawerDialog = ({ open, state, panelRef, motionStyle, side, size, title, ariaLabel, footer, showCloseButton, closeOnOverlayClick, closeOnEsc, onClose, className, style, children }: DrawerDialogProps) => {
  const titleId = useId()
  const { labels } = useUIConfig()

  const panelProps = mergeProps(
    {
      ...slot('drawer', 'panel'),
      className: styles.panel,
      style: motionStyle,
      'data-side': side,
      'data-size': size
    },
    { className, style }
  )

  return (
    <DrawerLayer
      open={open}
      state={state}
      panelRef={panelRef}
      label={title ? undefined : ariaLabel}
      labelledBy={title ? titleId : undefined}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      root={slot('drawer')}
      overlay={{ ...slot('drawer', 'overlay'), className: styles.backdrop, style: motionStyle }}
      panel={panelProps}
    >
      {(title || showCloseButton) && (
        <div {...slot('drawer', 'header')} className={styles.header}>
          {title && (
            <h2 {...slot('drawer', 'title')} id={titleId} className={styles.title}>
              {title}
            </h2>
          )}

          {showCloseButton && (
            <button {...slot('drawer', 'close')} type="button" className={styles.close} onClick={onClose} aria-label={labels.closeModal}>
              <CloseIcon size={20} />
            </button>
          )}
        </div>
      )}

      <div {...slot('drawer', 'body')} className={styles.body}>
        {children}
      </div>

      {footer && (
        <div {...slot('drawer', 'footer')} className={styles.footer}>
          {footer}
        </div>
      )}
    </DrawerLayer>
  )
}

export const Drawer = ({ open, side = defaultSide, size = defaultSize, showCloseButton = defaultShowCloseButton, closeOnOverlayClick = defaultCloseOnOverlayClick, closeOnEsc = defaultCloseOnEsc, container, animation, ...props }: DrawerProps) => {
  const motionStyle = useMotionStyle('slide', 'drawer', animation, side === 'start' ? 'left' : 'right')
  const target = usePortalContainer(container)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(open)

  if (!target) return null

  return createPortal(
    mounted ? (
      <DrawerDialog open={open} state={state} panelRef={ref} motionStyle={motionStyle} side={side} size={size} showCloseButton={showCloseButton} closeOnOverlayClick={closeOnOverlayClick} closeOnEsc={closeOnEsc} {...props} />
    ) : null,
    target
  )
}

export default Drawer
