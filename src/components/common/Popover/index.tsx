import { cloneElement, isValidElement, useEffect, useId, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

import { defaultArrow, defaultCloseOnEsc, defaultCloseOnOutsideClick, defaultOffset, defaultOpen, defaultPadding, defaultPlacement, defaultRole, popoverBase } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { PopoverTreeContext, usePopoverTree } from './popoverTree.ts'
import { PopoverControlContext } from './popoverControl.ts'
import { usePopoverDismiss } from './usePopoverDismiss.ts'
import { usePopoverPosition } from './usePopoverPosition.ts'
import { useOverlayStack } from '@hooks/useOverlayStack.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { focusFirst, focusTrigger } from './focus.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { tabbablesIn } from '@utils/tabbable.ts'
import { usePortalContainer } from '@hooks/usePortalContainer.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { KeyboardEvent, MouseEvent, ReactElement } from 'react'
import type { PopoverControl, PopoverProps } from './types.ts'

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
  container,
  animation,
  className,
  style,
  contentClassName,
  contentStyle
}: PopoverProps) => {
  const { dir } = useUIConfig()
  const target = usePortalContainer(container)
  const [isOpen, setOpen] = useControllableState(open, initiallyOpen, onOpenChange)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(isOpen)
  const id = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const byKeyboard = useRef(false)
  const motionStyle = useMotionStyle('pop', 'popover', animation, undefined, popoverBase)
  const isTop = useOverlayStack(isOpen)
  const { contains, tree } = usePopoverTree(ref, mounted)

  usePopoverPosition({ triggerRef, contentRef: ref, arrowRef, mounted: mounted && target !== null, placement, offset, padding, rtl: dir === 'rtl' })
  usePopoverDismiss({ open: isOpen, triggerRef, contentRef: ref, bodyRef, isTop, wasTopAtPointerDown: isTop.wasTopAtPointerDown, contains, closeOnEsc, closeOnOutsideClick, menu: role === 'menu', onClose: () => setOpen(false) })

  const closeRef = useRef<() => void>(() => undefined)
  closeRef.current = () => {
    setOpen(false)
    if (triggerRef.current) focusTrigger(triggerRef.current)
  }
  const control = useMemo<PopoverControl>(() => ({ close: () => closeRef.current(), contentRef: ref }), [ref])

  useEffect(() => {
    if (state !== 'entering' || !byKeyboard.current || !ref.current) return

    byKeyboard.current = false
    focusFirst(ref.current, bodyRef.current)
  }, [state, ref])

  const handleClick = (event: MouseEvent) => {
    byKeyboard.current = event.detail === 0
    setOpen(!isOpen)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const items = triggerRef.current ? tabbablesIn(triggerRef.current) : []
    if (event.key !== 'Tab' || event.shiftKey || !isOpen || !ref.current || event.target !== items[items.length - 1]) return

    event.preventDefault()
    focusFirst(ref.current, bodyRef.current)
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
      {target &&
        createPortal(
          mounted ? (
            <PopoverTreeContext.Provider value={tree}>
              <PopoverControlContext.Provider value={control}>
                <div {...contentProps}>
                  <div ref={bodyRef} tabIndex={role === 'menu' ? undefined : -1} {...slot('popover', 'body')} className={styles.body}>
                    {content}
                  </div>
                  {arrow && <span ref={arrowRef} aria-hidden="true" {...slot('popover', 'arrow')} className={styles.arrow} />}
                </div>
              </PopoverControlContext.Provider>
            </PopoverTreeContext.Provider>
          ) : null,
          target
        )}
    </>
  )
}

export default Popover
