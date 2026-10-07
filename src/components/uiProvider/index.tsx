import { MotionConfig } from 'motion/react'
import { useMemo } from 'react'

import { defaultMotionSettings } from '../../motion/defaultData.ts'
import { defaultLabels } from './defaultData.ts'
import { UIContext } from './context.ts'

import type { UIProviderProps } from './types.ts'

export const UIProvider = ({ children, motion, labels }: UIProviderProps) => {
  const value = useMemo(
    () => ({
      motion: { ...defaultMotionSettings, ...motion, recipes: { ...defaultMotionSettings.recipes, ...motion?.recipes } },
      labels: { ...defaultLabels, ...labels }
    }),
    [motion, labels]
  )

  return (
    <UIContext.Provider value={value}>
      <MotionConfig reducedMotion={value.motion.mode === 'never' ? 'always' : 'user'}>{children}</MotionConfig>
    </UIContext.Provider>
  )
}

export default UIProvider
