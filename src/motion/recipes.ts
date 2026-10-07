import { baseTuning, defaultEase, loopRecipes, presetScale, pulseDuration, shimmerTravel } from './defaultData.ts'

import type { BaseTuning, RecipeName, RecipeProps, ResolveRecipeInput, SlideFrom } from './types.ts'

const offsets: Record<SlideFrom, (distance: number) => { x?: number; y?: number }> = {
  top: (distance) => ({ y: -distance }),
  bottom: (distance) => ({ y: distance }),
  left: (distance) => ({ x: -distance }),
  right: (distance) => ({ x: distance })
}

const reducedRecipe: Record<RecipeName, 'fade' | 'pulse' | 'none'> = {
  fade: 'fade',
  pop: 'fade',
  slide: 'fade',
  press: 'none',
  lift: 'none',
  resize: 'none',
  spin: 'pulse',
  shimmer: 'pulse'
}

const resolveTuning = ({ name, settings, tuning }: Pick<ResolveRecipeInput, 'name' | 'settings' | 'tuning'>): BaseTuning => {
  const base = baseTuning[name]
  const scale = presetScale[settings.preset]
  const custom = { ...settings.recipes[name], ...tuning }
  const scalesDuration = !loopRecipes.includes(name)

  return {
    duration: custom.duration ?? (scalesDuration ? base.duration * scale.duration : base.duration),
    distance: custom.distance ?? base.distance * scale.distance,
    scale: custom.scale ?? 1 - (1 - base.scale) * scale.distance
  }
}

const hiddenState = (name: RecipeName, tuning: BaseTuning, from: SlideFrom) => {
  if (name === 'pop') return { opacity: 0, scale: tuning.scale, y: tuning.distance }
  if (name === 'slide') return { opacity: 0, ...offsets[from](tuning.distance) }

  return { opacity: 0 }
}

const shownState = (name: RecipeName) => {
  if (name === 'pop') return { opacity: 1, scale: 1, y: 0 }
  if (name === 'slide') return { opacity: 1, x: 0, y: 0 }

  return { opacity: 1 }
}

const transientProps = (name: RecipeName, tuning: BaseTuning, from: SlideFrom): RecipeProps => ({
  initial: hiddenState(name, tuning, from),
  animate: shownState(name),
  exit: hiddenState(name, tuning, from),
  transition: { duration: tuning.duration, ease: defaultEase }
})

const silentProps = (name: RecipeName): RecipeProps => {
  if (name === 'fade' || name === 'pop' || name === 'slide') {
    return { initial: false, animate: shownState(name), exit: shownState(name), transition: { duration: 0 } }
  }

  return {}
}

const pulseProps = (): RecipeProps => ({
  animate: { opacity: [1, 0.5, 1] },
  transition: { duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }
})

const interactiveProps = (name: RecipeName, tuning: BaseTuning): RecipeProps => {
  const transition = { duration: tuning.duration, ease: defaultEase }
  if (name === 'press') return { whileTap: { scale: tuning.scale }, transition }

  return { whileHover: { y: -tuning.distance }, transition }
}

const loopProps = (name: RecipeName, tuning: BaseTuning): RecipeProps => {
  if (name === 'spin') {
    return { animate: { rotate: 360 }, transition: { duration: tuning.duration, repeat: Infinity, ease: 'linear' } }
  }

  return {
    animate: { backgroundPosition: [`-${shimmerTravel}px 0px`, `${shimmerTravel}px 0px`] },
    transition: { duration: tuning.duration, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const resolveRecipe = ({ name, settings, prefersReduced, from = 'bottom', tuning, disabled }: ResolveRecipeInput): RecipeProps => {
  const silent = disabled || settings.mode === 'never' || settings.preset === 'off'
  if (name === 'resize') {
    const instant = silent || prefersReduced

    return { transition: { duration: instant ? 0 : resolveTuning({ name, settings, tuning }).duration, ease: defaultEase } }
  }

  if (silent) return silentProps(name)

  if (prefersReduced) {
    const fallback = reducedRecipe[name]
    if (fallback === 'none') return {}
    if (fallback === 'pulse') return pulseProps()

    return transientProps('fade', resolveTuning({ name: 'fade', settings, tuning }), from)
  }

  const resolved = resolveTuning({ name, settings, tuning })
  if (name === 'press' || name === 'lift') return interactiveProps(name, resolved)
  if (name === 'spin' || name === 'shimmer') return loopProps(name, resolved)

  return transientProps(name, resolved, from)
}
