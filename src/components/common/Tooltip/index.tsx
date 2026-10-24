import { cloneElement, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { bubbleOffset, closeDelay as defaultCloseDelay, defaultPosition, joinsGroup, openDelay as defaultOpenDelay, resolveAnimation, tooltipGroup, viewportPadding } from './defaultData.ts'
import { autoUpdate, computePosition, resolvePlacement } from '../../../positioning/index.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { classNames } from '@utils/classNames.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { useIsClient } from '@hooks/useIsClient.ts'
import { usePresence } from '@hooks/usePresence.ts'
import styles from './styles.module.css'

import type { CSSProperties, ReactElement } from 'react'
import type { TooltipProps } from './types.ts'

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
  const [instant, setInstant] = useState(false)
  const id = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const presence = usePresence<HTMLSpanElement>(open)

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const reveal = () => {
    setInstant(joinsGroup(Date.now()))
    setOpen(true)
  }

  const show = () => {
    clearTimers()
    if (openDelay > 0 && !joinsGroup(Date.now())) openTimer.current = setTimeout(reveal, openDelay)
    else reveal()
  }

  const hide = () => {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay)
  }

  useEffect(() => clearTimers, [])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      clearTimers()
      setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return

    tooltipGroup.open += 1

    return () => {
      tooltipGroup.open -= 1
      tooltipGroup.closedAt = Date.now()
    }
  }, [open])

  useLayoutEffect(() => {
    const bubble = presence.ref.current
    const reference = wrapperRef.current
    if (!presence.mounted || !bubble || !reference) return undefined

    let first = true
    const update = () => {
      const result = computePosition(reference, bubble, { placement: resolvePlacement(position, dir === 'rtl'), offset: bubbleOffset, padding: viewportPadding })

      bubble.style.left = `${result.x}px`
      bubble.style.top = `${result.y}px`
      bubble.dataset.position = result.placement.split('-')[0]
      if (result.referenceHidden && !first) setOpen(false)
      first = false
    }

    return autoUpdate(reference, bubble, update)
  }, [presence.mounted, presence.ref, position, dir])

  const trigger = describe && isValidElement(children) ? cloneElement(children as ReactElement<{ 'aria-describedby'?: string | undefined }>, { 'aria-describedby': id }) : children

  const wrapperProps = mergeProps(
    { ref: wrapperRef, className: styles.wrapper, onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, ...slot('tooltip', 'trigger') },
    { className, style }
  )

  const bubbleVariables = {
    '--enchase-tooltip-duration': `${motionSettings.duration}s`,
    '--enchase-tooltip-scale': motionSettings.scale
  } as CSSProperties

  const bubbleProps = mergeProps(
    {
      ref: presence.ref,
      className: styles.bubble,
      style: bubbleVariables,
      'data-state': presence.state,
      'data-animation': motionSettings.off || instant ? 'off' : motionSettings.pop ? 'pop' : undefined,
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
