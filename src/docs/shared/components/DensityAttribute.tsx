import { useLayoutEffect } from 'react'

import type { StoryDensityName } from '../densities.ts'

export const DensityAttribute = ({ density }: { density: StoryDensityName }) => {
  useLayoutEffect(() => {
    if (density !== 'compact') return undefined

    document.documentElement.setAttribute('data-density', density)

    return () => document.documentElement.removeAttribute('data-density')
  }, [density])

  return null
}
