import { ExternalLink } from 'lucide-react'

import { VisuallyHidden } from '../VisuallyHidden/index.tsx'
import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import { defaultRecipe } from '../Button/defaultData.ts'
import { StyledLink } from './styles.ts'

import type { ButtonLinkProps } from './types.ts'

export const ButtonLink = ({ children, animation, target, rel, ...props }: ButtonLinkProps) => {
  const pressMotion = useMotionRecipe(defaultRecipe, animation)
  const { labels } = useUIConfig()
  const opensNewTab = target === '_blank'

  return (
    <StyledLink {...pressMotion} {...props} target={target} rel={rel ?? (opensNewTab ? 'noopener noreferrer' : undefined)}>
      {children}
      {opensNewTab && (
        <>
          {' '}
          <ExternalLink size={16} aria-hidden="true" />
          <VisuallyHidden>{labels.opensInNewTab}</VisuallyHidden>
        </>
      )}
    </StyledLink>
  )
}

export default ButtonLink
