import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useLinkClick } from '@hooks/useLinkClick.ts'
import styles from './styles.module.css'

import type { LinkProps } from './types.ts'

export const Link = ({ href, onClick, target, download, native, rel, ...props }: LinkProps) => {
  const handleClick = useLinkClick({ href, onClick, target, download, native })

  const own = {
    ...slot('link'),
    className: styles.link,
    href,
    target,
    download,
    rel: rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined),
    onClick: handleClick
  }

  const slotOverride = props['data-slot' as keyof typeof props]

  return <a {...mergeProps(own, props)} {...(slotOverride ? { 'data-slot': slotOverride } : {})} />
}

export default Link
