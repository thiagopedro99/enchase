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

const ToastItemComponent = ({ toast, open, onRemove, onDispose, onAnnounce, paused, from, animation }: ToastItemProps) => {
  const { labels } = useUIConfig()
  const motionStyle = useMotionStyle('slide', 'toast', animation, from, toastBase)
  const duration = toast.duration ?? defaultToastDuration
  const sticky = duration === 0
  const dismissible = toast.dismissible !== false
  const [shown, setShown] = useState(false)
  const remaining = useRef(duration)
  const announced = useRef('')
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
    remaining.current = duration
  }, [duration])

  useEffect(() => {
    if (sticky || paused || !open) return

    const startedAt = Date.now()
    const timer = setTimeout(handleClose, remaining.current)

    return () => {
      clearTimeout(timer)
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt))
    }
  }, [paused, sticky, open, duration, handleClose])

  if (!mounted) return null

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && dismissible) handleClose()
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
      'data-dismissible': dismissible ? undefined : 'false',
      inert: state === 'exiting' ? true : undefined,
      onKeyDown: handleKeyDown,
      onClick: dismissible ? handleClose : undefined
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

      {toast.action && (
        <button
          {...slot('toast', 'action')}
          type="button"
          className={styles.action}
          onClick={(event) => {
            event.stopPropagation()
            toast.action?.onClick()
            handleClose()
          }}
        >
          {toast.action.label}
        </button>
      )}

      {dismissible && (
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
      )}

      {!sticky && <div key={duration} {...slot('toast', 'progress')} className={styles.progress} aria-hidden="true" />}
    </div>
  )
}

export default ToastItemComponent
