import { defaultFullWidth, defaultSize, defaultVariant } from '../Button/defaultData.ts'
import { ExternalLinkIcon } from '../Icon/icons/ExternalLinkIcon.tsx'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { resolveButtonMotion } from '../Button/motion.ts'
import { mergeProps, slot } from '@utils/mergeProps.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { classNames } from '@utils/classNames.ts'
import buttonStyles from '../Button/styles.module.css'
import styles from './styles.module.css'

import type { ButtonLinkProps } from './types.ts'

export const ButtonLink = ({ children, animation, variant = defaultVariant, size = defaultSize, fullWidth = defaultFullWidth, target, rel, ...props }: ButtonLinkProps) => {
  const { labels, motion: settings } = useUIConfig()
  const { motion, style } = resolveButtonMotion(settings, animation)
  const opensNewTab = target === '_blank'
  const own = {
    ...slot('button-link'),
    className: classNames(buttonStyles.button, styles.link),
    style,
    'data-variant': variant,
    'data-size': size,
    'data-motion': motion,
    'data-full-width': fullWidth ? '' : undefined
  }

  return (
    <a {...mergeProps(own, props)} target={target} rel={rel ?? (opensNewTab ? 'noopener noreferrer' : undefined)}>
      {children}
      {opensNewTab && (
        <>
          {' '}
          <ExternalLinkIcon size={16} {...slot('button-link', 'icon')} />
          <VisuallyHidden>{labels.opensInNewTab}</VisuallyHidden>
        </>
      )}
    </a>
  )
}

export default ButtonLink
