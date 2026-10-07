import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Check, Info, X } from 'lucide-react'
import { animate, useMotionValue } from 'motion/react'

import { ToastItem as StyledToastItem, ToastBody, ToastIcon, ToastContent, ToastMessage, CloseButton, ProgressBar } from './styles.ts'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { defaultToastDuration } from './defaultData.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { ToastItemProps } from './types.ts'
import type { KeyboardEvent } from 'react'

const Icons = {
  success: <Check size={20} />,
  error: <X size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />
}

const ToastItemComponent = ({ toast, onRemove, animation }: ToastItemProps) => {
  const { labels } = useUIConfig()
  const slideMotion = useMotionRecipe('slide', animation, 'right')
  const duration = toast.duration ?? defaultToastDuration
  const sticky = duration === 0
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const progress = useMotionValue(1)
  const remaining = useRef(duration)
  const paused = hovered || focused

  const handleClose = useCallback(() => onRemove(toast.id), [onRemove, toast.id])

  useEffect(() => {
    if (sticky || paused) return

    const controls = animate(progress, 0, { duration: remaining.current / 1000, ease: 'linear' })
    const timer = setTimeout(handleClose, remaining.current)

    return () => {
      controls.stop()
      clearTimeout(timer)
      remaining.current = progress.get() * duration
    }
  }, [paused, sticky, duration, progress, handleClose])

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') handleClose()
  }

  return (
    <StyledToastItem
      {...slideMotion}
      layout
      $type={toast.type}
      role={toast.type === 'error' ? 'alert' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onKeyDown={handleKeyDown}
      onClick={handleClose}
    >
      <ToastBody>
        <ToastIcon aria-hidden="true">{Icons[toast.type]}</ToastIcon>
        <ToastContent>
          <ToastMessage>{toast.message}</ToastMessage>
        </ToastContent>
      </ToastBody>

      <CloseButton
        type="button"
        aria-label={labels.closeToast}
        onClick={(event) => {
          event.stopPropagation()
          handleClose()
        }}
      >
        <svg height="14" viewBox="0 0 14 14" width="14" aria-hidden="true" focusable="false">
          <path
            d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z"
            fill="currentColor"
          />
        </svg>
      </CloseButton>

      {!sticky && <ProgressBar style={{ scaleX: progress }} aria-hidden="true" />}
    </StyledToastItem>
  )
}

export default ToastItemComponent
