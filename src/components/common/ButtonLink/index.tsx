import { ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'

import { defaultFullWidth, defaultRecipe, defaultSize, defaultVariant } from '../Button/defaultData.ts'
import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { classNames } from '@utils/classNames.ts'
import buttonStyles from '../Button/styles.module.css'
import styles from './styles.module.css'

import type { ButtonLinkProps } from './types.ts'

export const ButtonLink = ({ children, animation, variant = defaultVariant, size = defaultSize, fullWidth = defaultFullWidth, target, rel, className, ...props }: ButtonLinkProps) => {
  const pressMotion = useMotionRecipe(defaultRecipe, animation)
  const { labels } = useUIConfig()
  const opensNewTab = target === '_blank'

  return (
    <motion.a
      {...pressMotion}
      {...props}
      className={classNames(buttonStyles.button, styles.link, className)}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth ? '' : undefined}
      target={target}
      rel={rel ?? (opensNewTab ? 'noopener noreferrer' : undefined)}
    >
      {children}
      {opensNewTab && (
        <>
          {' '}
          <ExternalLink size={16} aria-hidden="true" />
          <VisuallyHidden>{labels.opensInNewTab}</VisuallyHidden>
        </>
      )}
    </motion.a>
  )
}

export default ButtonLink
