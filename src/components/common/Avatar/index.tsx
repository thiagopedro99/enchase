import { useEffect, useRef, useState } from 'react'

import { defaultSize } from './defaultData.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { initialsOf } from '@utils/initial.ts'
import styles from './styles.module.css'

import type { AvatarProps } from './types.ts'

export const Avatar = ({ name, src, size = defaultSize, children, ...props }: AvatarProps) => {
  const [settled, setSettled] = useState<{ src: string; loaded: boolean }>()
  const imageRef = useRef<HTMLImageElement>(null)
  const status = !src ? 'fallback' : settled?.src !== src ? 'loading' : settled.loaded ? 'loaded' : 'fallback'
  const own = {
    ...slot('avatar'),
    className: styles.avatar,
    role: name ? 'img' : undefined,
    'aria-label': name || undefined,
    'data-size': size,
    'data-state': status
  }

  useEffect(() => {
    const element = imageRef.current

    if (src && element?.complete) setSettled({ src, loaded: element.naturalWidth > 0 })
  }, [src])

  return (
    <span {...mergeProps(own, props)}>
      {status !== 'loaded' && (
        <span className={styles.fallback} {...slot('avatar', 'fallback')} aria-hidden={!name && children === undefined ? 'true' : undefined}>
          {children ?? initialsOf(name ?? '')}
        </span>
      )}
      {src && status !== 'fallback' && <img ref={imageRef} className={styles.image} {...slot('avatar', 'image')} src={src} alt="" onLoad={() => setSettled({ src, loaded: true })} onError={() => setSettled({ src, loaded: false })} />}
    </span>
  )
}

export default Avatar
