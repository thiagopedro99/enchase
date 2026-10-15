import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

import { defaultArrow, defaultCloseOnEsc, defaultCloseOnOutsideClick, defaultOffset, defaultOpen, defaultPadding, defaultPlacement, defaultRole } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { PopoverTreeContext, usePopoverTree } from './popoverTree.ts'
import { usePopoverDismiss } from './usePopoverDismiss.ts'
import { usePopoverPosition } from './usePopoverPosition.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { focusFirst, tabbablesIn } from './focus.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useIsClient } from '@hooks/useIsClient.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { KeyboardEvent, MouseEvent, ReactElement } from 'react'
import type { PopoverProps } from './types.ts'

export const Popover = ({
  children,
  content,
  open,
  defaultOpen: initiallyOpen = defaultOpen,
  onOpenChange,
  placement = defaultPlacement,
  offset = defaultOffset,
  padding = defaultPadding,
  role = defaultRole,
  label,
  arrow = defaultArrow,
  closeOnEsc = defaultCloseOnEsc,
  closeOnOutsideClick = defaultCloseOnOutsideClick,
  animation,
  className,
  style,
  contentClassName,
  contentStyle
}: PopoverProps) => {
  const { dir } = useUIConfig()
  const isClient = useIsClient()
  const [isOpen, setOpen] = useControllableState(open, initiallyOpen, onOpenChange)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(isOpen)
  const id = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const byKeyboard = useRef(false)
  const motionStyle = useMotionStyle('pop', 'popover', animation)
  const isTop = useOverlayStack(isOpen)
  const { contains, tree } = usePopoverTree(ref, mounted)

  usePopoverPosition({ triggerRef, contentRef: ref, arrowRef, mounted, placement, offset, padding, rtl: dir === 'rtl' })
  usePopoverDismiss({ open: isOpen, triggerRef, contentRef: ref, isTop, wasTopAtPointerDown: isTop.wasTopAtPointerDown, contains, closeOnEsc, closeOnOutsideClick, onClose: () => setOpen(false) })

  useEffect(() => {
    if (state !== 'entering' || !byKeyboard.current || !ref.current) return

    byKeyboard.current = false
    focusFirst(ref.current)
  }, [state, ref])

  const handleClick = (event: MouseEvent) => {
    byKeyboard.current = event.detail === 0
    setOpen(!isOpen)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const items = triggerRef.current ? tabbablesIn(triggerRef.current) : []
    if (event.key !== 'Tab' || event.shiftKey || !isOpen || !ref.current || event.target !== items[items.length - 1]) return

    event.preventDefault()
    focusFirst(ref.current)
  }

  const trigger = isValidElement(children) ? cloneElement(children as ReactElement<Record<string, unknown>>, { 'aria-expanded': isOpen, 'aria-controls': isOpen ? id : undefined, 'aria-haspopup': role }) : children

  const triggerProps = mergeProps({ ref: triggerRef, ...slot('popover', 'trigger'), className: styles.trigger, onClick: handleClick, onKeyDown: handleKeyDown }, { className, style })

  const contentProps = mergeProps(
    {
      ref,
      id,
      role,
      dir,
      tabIndex: -1,
      'aria-label': label,
      'data-state': state,
      ...slot('popover', 'content'),
      className: styles.content,
      style: motionStyle
    },
    { className: contentClassName, style: contentStyle }
  )

  return (
    <>
      <span {...triggerProps}>{trigger}</span>
      {isClient &&
        createPortal(
          mounted ? (
            <PopoverTreeContext.Provider value={tree}>
              <div {...contentProps}>
                {content}
                {arrow && <span ref={arrowRef} aria-hidden="true" {...slot('popover', 'arrow')} className={styles.arrow} />}
              </div>
            </PopoverTreeContext.Provider>
          ) : null,
          document.body
        )}
    </>
  )
}

export default Popover
