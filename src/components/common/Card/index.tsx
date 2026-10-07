import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { StyledCard } from './styles.ts'

import type { CardProps } from './types.ts'

export const Card = ({ children, animation, ...props }: CardProps) => {
  const liftMotion = useMotionRecipe('lift', animation)
  const motionProps = props.$variant === 'elevated' ? liftMotion : {}

  return (
    <StyledCard {...motionProps} {...props}>
      {children}
    </StyledCard>
  )
}

export default Card
