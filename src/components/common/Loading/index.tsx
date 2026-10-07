import { createPortal } from 'react-dom'
import { useRef } from 'react'

import { SpinnerContainer, Spinner, Overlay, LoadingText, InlineSpinner } from './styles.ts'
import { useInertSiblings } from '@hooks/useInertSiblings.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useScrollLock } from '@hooks/useScrollLock.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'

import type { InlineLoadingProps, LoadingProps } from './types.ts'

const OverlayLoading = ({ size, text, color, animation }: Required<Pick<LoadingProps, 'size'>> & Omit<LoadingProps, 'size' | 'overlay'>) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const { labels } = useUIConfig()
  const spinMotion = useMotionRecipe('spin', animation)

  useInertSiblings(rootRef)
  useScrollLock()

  return (
    <div ref={rootRef}>
      <Overlay aria-hidden="true" />
      <SpinnerContainer $overlay role="status" aria-live="polite">
        <Spinner {...spinMotion} $size={size} $color={color} aria-hidden="true" />
        {text ? <LoadingText>{text}</LoadingText> : <VisuallyHidden>{labels.loading}</VisuallyHidden>}
      </SpinnerContainer>
    </div>
  )
}

export const Loading = ({ size = 'md', overlay = false, text, color, animation }: LoadingProps) => {
  const { labels } = useUIConfig()
  const spinMotion = useMotionRecipe('spin', animation)

  if (overlay) {
    if (typeof document === 'undefined') return null

    return createPortal(<OverlayLoading size={size} text={text} color={color} animation={animation} />, document.body)
  }

  return (
    <SpinnerContainer $overlay={false} role="status" aria-live="polite">
      <Spinner {...spinMotion} $size={size} $color={color} aria-hidden="true" />
      {text ? <LoadingText>{text}</LoadingText> : <VisuallyHidden>{labels.loading}</VisuallyHidden>}
    </SpinnerContainer>
  )
}

export const InlineLoading = ({ size = 'sm', color, label, animation }: InlineLoadingProps) => {
  const { labels } = useUIConfig()
  const spinMotion = useMotionRecipe('spin', animation)

  return (
    <span role="status">
      <InlineSpinner {...spinMotion} $size={size} $color={color} aria-hidden="true" />
      <VisuallyHidden>{label ?? labels.loading}</VisuallyHidden>
    </span>
  )
}

export default Loading
