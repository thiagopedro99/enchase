import { useMotionRecipe } from '@hooks/useMotionRecipe.ts'
import { StyledSkeleton } from './styles.ts'

import type { SkeletonProps } from './types.ts'

export const Skeleton = ({ variant = 'text', width, height, className, animation }: SkeletonProps) => {
  const shimmerMotion = useMotionRecipe('shimmer', animation)

  return <StyledSkeleton {...shimmerMotion} $variant={variant} $width={width} $height={height} className={className} aria-hidden="true" />
}

export default Skeleton
