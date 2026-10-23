import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import tileStyles from '../CardButton/styles.module.css'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { defaultVariant } from '../Card/defaultData.ts'
import { useLinkClick } from '@hooks/useLinkClick.ts'
import { useCardSurface } from '../Card/surface.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import cardStyles from '../Card/styles.module.css'
import { classNames } from '@utils/classNames.ts'
import styles from './styles.module.css'

import type { CardLinkProps } from './types.ts'

export const CardLink = ({ children, animation, variant = defaultVariant, padding, href, onClick, target, download, native, rel, ...props }: CardLinkProps) => {
  const { labels } = useUIConfig()
  const surface = useCardSurface({ variant, padding, animation })
  const handleClick = useLinkClick({ href, onClick, target, download, native })
  const opensNewTab = target === '_blank'
  const own = {
    ...slot('card-link'),
    ...surface,
    className: classNames(cardStyles.card, tileStyles.tile, styles.link),
    href,
    download,
    onClick: handleClick
  }

  return (
    <a {...mergeProps(own, props)} target={target} rel={rel ?? (opensNewTab ? 'noopener noreferrer' : undefined)}>
      {children}
      {opensNewTab && (
        <>
          {' '}
          <VisuallyHidden>{labels.opensInNewTab}</VisuallyHidden>
        </>
      )}
    </a>
  )
}

export default CardLink
