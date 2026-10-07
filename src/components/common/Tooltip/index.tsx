import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'

import { TooltipWrapper, TooltipBubble } from './styles.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { closeDelay, placeBubble } from './defaultData.ts'

import type { KeyboardEvent, ReactElement } from 'react'
import type { TooltipProps } from './types.ts'

export const Tooltip = ({ text, children, position = 'top', describe = true, animation }: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState({ top: 0, left: 0 })
  const id = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleMotion = useMotionRecipe('fade', animation)

  const clearCloseTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const show = () => {
    clearCloseTimer()
    if (wrapperRef.current) setAnchor(placeBubble(wrapperRef.current.getBoundingClientRect(), position))
    setOpen(true)
  }

  const hide = () => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) setOpen(false)
  }

  useEffect(() => clearCloseTimer, [])

  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)

    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const trigger = describe && isValidElement(children) ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': id }) : children

  return (
    <TooltipWrapper ref={wrapperRef} onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={handleKeyDown}>
      {trigger}
      {describe && (
        <span id={id} role="tooltip" hidden>
          {text}
        </span>
      )}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <TooltipBubble key="tooltip-bubble" {...bubbleMotion} style={anchor} $position={position} aria-hidden="true">
                {text}
              </TooltipBubble>
            )}
          </AnimatePresence>,
          document.body
        )}
    </TooltipWrapper>
  )
}

export default Tooltip
