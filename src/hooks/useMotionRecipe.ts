import { useReducedMotion } from 'motion/react'
import { useMemo } from 'react'

import { resolveRecipe } from '../motion/recipes.ts'
import { useUIConfig } from './useUIConfig.ts'

import type { MotionOverride, RecipeName, RecipeProps, SlideFrom } from '../motion/types.ts'

export const useMotionRecipe = (name: RecipeName, override?: MotionOverride, from?: SlideFrom): RecipeProps => {
  const { motion } = useUIConfig()
  const prefersReduced = useReducedMotion() ?? false
  const customRecipe = override ? override.recipe : undefined
  const customFrom = override ? override.from : undefined
  const tuning = override ? override.tuning : undefined
  const disabled = override === false

  return useMemo(
    () =>
      resolveRecipe({
        name: customRecipe ?? name,
        settings: motion,
        prefersReduced,
        from: customFrom ?? from,
        tuning,
        disabled
      }),
    [name, customRecipe, customFrom, from, tuning, disabled, motion, prefersReduced]
  )
}
