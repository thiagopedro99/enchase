import { useNavigator } from '@hooks/useNavigator.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { shouldNavigate } from '@utils/href.ts'
import styles from './styles.module.css'

import type { LinkProps } from './types.ts'
import type { MouseEvent } from 'react'

export const Link = ({ href, onClick, target, download, native, rel, ...props }: LinkProps) => {
  const navigate = useNavigator()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (!navigate || !shouldNavigate(href, event, { target, download, native })) return

    event.preventDefault()
    navigate(href)
  }

  const own = {
    ...slot('link'),
    className: styles.link,
    href,
    target,
    download,
    rel: rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined),
    onClick: handleClick
  }

  return <a {...mergeProps(own, props)} />
}

export default Link
