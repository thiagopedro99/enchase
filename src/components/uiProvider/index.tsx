import { useEffect, useMemo, useRef } from 'react'
import { MotionConfig } from 'motion/react'

import { CurrentHrefContext, NavigateContext } from './navigationContext.ts'
import { defaultMotionSettings } from '../../motion/defaultData.ts'
import { defaultLabels } from './defaultData.ts'
import { UIContext } from './context.ts'

import type { UIProviderProps } from './types.ts'

export const UIProvider = ({ children, motion, labels, navigate, currentHref }: UIProviderProps) => {
  const navigateRef = useRef(navigate)
  const hasNavigate = navigate !== undefined

  const value = useMemo(
    () => ({
      motion: { ...defaultMotionSettings, ...motion, recipes: { ...defaultMotionSettings.recipes, ...motion?.recipes } },
      labels: { ...defaultLabels, ...labels }
    }),
    [motion, labels]
  )

  const stableNavigate = useMemo(() => (hasNavigate ? (href: string) => navigateRef.current?.(href) : undefined), [hasNavigate])

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  return (
    <UIContext.Provider value={value}>
      <NavigateContext.Provider value={stableNavigate}>
        <CurrentHrefContext.Provider value={currentHref}>
          <MotionConfig reducedMotion={value.motion.mode === 'never' ? 'always' : 'user'}>{children}</MotionConfig>
        </CurrentHrefContext.Provider>
      </NavigateContext.Provider>
    </UIContext.Provider>
  )
}

export default UIProvider
