import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangleIcon } from '@components/common/Icon/icons/AlertTriangleIcon.tsx'
import { CloseIcon } from '@components/common/Icon/icons/CloseIcon.tsx'
import { CheckIcon } from '@components/common/Icon/icons/CheckIcon.tsx'
import { InfoIcon } from '@components/common/Icon/icons/InfoIcon.tsx'

import { defaultToastDuration, toastBase } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useMotionStyle } from '@hooks/useMotionStyle.ts'
import { usePresence } from '@hooks/usePresence.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import styles from './styles.module.css'

import type { ToastItemProps } from './types.ts'
import type { CSSProperties, KeyboardEvent } from 'react'

const Icons = {
  success: <CheckIcon size={20} />,
  error: <CloseIcon size={20} />,
  warning: <AlertTriangleIcon size={20} />,
  info: <InfoIcon size={20} />
}

const ToastItemComponent = ({ toast, open, onRemove, onDispose, onAnnounce, animation }: ToastItemProps) => {
  const { labels } = useUIConfig()
  const motionStyle = useMotionStyle('slide', 'toast', animation, 'right', toastBase)
  const duration = toast.duration ?? defaultToastDuration
  const sticky = duration === 0
  const [shown, setShown] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const remaining = useRef(duration)
  const announced = useRef('')
  const paused = hovered || focused
  const { mounted, state, ref } = usePresence<HTMLDivElement>(shown && open)

  const handleClose = useCallback(() => onRemove(toast.id), [onRemove, toast.id])

  useEffect(() => setShown(true), [])

  useEffect(() => {
    if (!mounted) return

    const text = ref.current?.querySelector('[data-slot="toast-title"]')?.textContent?.trim() ?? ''
    const key = `${toast.type}:${text}`

    if (!text || announced.current === key) return

    announced.current = key
    onAnnounce(toast.type, text)
  }, [mounted, toast.type, toast.message, onAnnounce, ref])

  useEffect(() => {
    if (!open && !mounted) onDispose(toast.id)
  }, [open, mounted, onDispose, toast.id])

  useEffect(() => {
    if (sticky || paused || !open) return

    const startedAt = Date.now()
    const timer = setTimeout(handleClose, remaining.current)

    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt))
    }
  }, [paused, sticky, open, handleClose])

  if (!mounted) return null

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') handleClose()
  }

  const rootProps = mergeProps(
    {
      ...slot('toast'),
      className: styles.item,
      style: { ...motionStyle, '--enchase-toast-lifetime': `${duration}ms` } as CSSProperties,
      'data-type': toast.type,
      'data-state': state,
      'data-paused': paused ? '' : undefined,
      'data-flip-id': toast.id,
      inert: state === 'exiting' ? true : undefined,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      onKeyDown: handleKeyDown,
      onClick: handleClose
    },
    { className: toast.className, style: toast.style }
  )

  return (
    <div ref={ref} {...rootProps}>
      <div className={styles.body}>
        <div className={styles.icon} aria-hidden="true">
          {Icons[toast.type]}
        </div>
        <div className={styles.content}>
          <div {...slot('toast', 'title')} className={styles.message}>
            {toast.message}
          </div>
        </div>
      </div>

      <button
        {...slot('toast', 'close')}
        type="button"
        className={styles.close}
        aria-label={labels.closeToast}
        onClick={(event) => {
          event.stopPropagation()
          handleClose()
        }}
      >
        <CloseIcon size={14} />
      </button>

      {!sticky && <div {...slot('toast', 'progress')} className={styles.progress} aria-hidden="true" />}
    </div>
  )
}

export default ToastItemComponent
