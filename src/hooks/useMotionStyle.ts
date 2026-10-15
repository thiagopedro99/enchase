import { useMemo } from 'react'

import { resolveCssMotion } from '../motion/css.ts'
import { useUIConfig } from './useUIConfig.ts'

import type { MotionOverride, RecipeName, SlideFrom } from '../motion/types.ts'

export const useMotionStyle = (name: RecipeName, component: string, override?: MotionOverride, from?: SlideFrom) => {
  const { motion, dir } = useUIConfig()
  const customRecipe = override ? override.recipe : undefined
  const customFrom = override ? override.from : undefined
  const tuning = override ? override.tuning : undefined
  const disabled = override === false
  const rtl = dir === 'rtl'

  return useMemo(
    () => resolveCssMotion({ name, component, settings: motion, override: disabled ? false : { recipe: customRecipe, from: customFrom, tuning }, from, rtl }),
    [name, component, motion, disabled, customRecipe, customFrom, tuning, from, rtl]
  )
}
