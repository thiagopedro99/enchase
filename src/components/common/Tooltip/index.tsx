import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { bubbleBox, closeDelay as defaultCloseDelay, crossAxisShift, defaultPosition, openDelay as defaultOpenDelay, opposite, overflowsMainAxis, placeBubble, resolveAnimation, resolvePlacement } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { classNames } from '@utils/classNames.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { useIsClient } from '@hooks/useIsClient.ts'
import { usePresence } from '@hooks/usePresence.ts'
import styles from './styles.module.css'

import type { CSSProperties, KeyboardEvent, ReactElement } from 'react'
import type { TooltipAnchor, TooltipProps } from './types.ts'

export const Tooltip = ({
  text,
  children,
  position = defaultPosition,
  describe = true,
  animation,
  openDelay = defaultOpenDelay,
  closeDelay = defaultCloseDelay,
  className,
  style,
  bubbleClassName,
  bubbleStyle
}: TooltipProps) => {
  const { motion, dir } = useUIConfig()
  const isClient = useIsClient()
  const motionSettings = resolveAnimation(animation, motion)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<TooltipAnchor>({ top: 0, left: 0 })
  const [placement, setPlacement] = useState(() => resolvePlacement(position, dir))
  const [shift, setShift] = useState(0)
  const id = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const flipped = useRef(false)
  const presence = usePresence<HTMLSpanElement>(open)

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const reveal = () => {
    const resolved = resolvePlacement(position, dir)

    flipped.current = false
    setShift(0)
    setPlacement(resolved)
    if (wrapperRef.current) setAnchor(placeBubble(wrapperRef.current.getBoundingClientRect(), resolved))
    setOpen(true)
  }

  const show = () => {
    clearTimers()
    if (openDelay > 0) openTimer.current = setTimeout(reveal, openDelay)
    else reveal()
  }

  const hide = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return

    clearTimers()
    if (open) setOpen(false)
  }

  useEffect(() => clearTimers, [])

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

  useLayoutEffect(() => {
    const bubble = presence.ref.current
    const trigger = wrapperRef.current
    if (!bubble || !trigger || (presence.state !== 'entering' && presence.state !== 'open')) return

    const size = { width: bubble.offsetWidth, height: bubble.offsetHeight }
    if (size.width === 0 && size.height === 0) return

    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }
    const box = bubbleBox(anchor, size, placement)

    if (!flipped.current && overflowsMainAxis(box, placement, viewport)) {
      const next = opposite[placement]

      flipped.current = true
      setPlacement(next)
      setAnchor(placeBubble(trigger.getBoundingClientRect(), next))

      return
    }

    setShift(crossAxisShift(box, placement, viewport))
  }, [presence.state, presence.ref, placement, anchor, text])

  const trigger = describe && isValidElement(children) ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string }>, { 'aria-describedby': id }) : children

  const wrapperProps = mergeProps(
    { ref: wrapperRef, className: styles.wrapper, onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, onKeyDown: handleKeyDown, ...slot('tooltip', 'trigger') },
    { className, style }
  )

  const bubbleVariables = {
    '--enchase-tooltip-duration': `${motionSettings.duration}s`,
    '--enchase-tooltip-scale': motionSettings.scale,
    '--enchase-tooltip-shift': `${shift}px`
  } as CSSProperties

  const bubbleProps = mergeProps(
    {
      ref: presence.ref,
      className: styles.bubble,
      style: { ...anchor, ...bubbleVariables },
      'data-position': placement,
      'data-state': presence.state,
      'data-animation': motionSettings.off ? 'off' : motionSettings.pop ? 'pop' : undefined,
      'aria-hidden': true,
      ...slot('tooltip', 'bubble')
    },
    { className: classNames(bubbleClassName), style: bubbleStyle }
  )

  return (
    <div {...wrapperProps}>
      {trigger}
      {describe && (
        <span id={id} role="tooltip" hidden>
          {text}
        </span>
      )}
      {isClient && createPortal(presence.mounted ? <span {...bubbleProps}>{text}</span> : null, document.body)}
    </div>
  )
}

export default Tooltip
