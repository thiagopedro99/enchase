import { baseTuning, presetScale } from './defaultData.ts'

import type { CSSProperties } from 'react'
import type { MotionOverride, MotionSettings, RecipeName, SlideFrom } from './types.ts'

export type CssMotionInput = {
  name: RecipeName
  settings: MotionSettings
  override?: MotionOverride
  from?: SlideFrom
  rtl?: boolean
}

export const exitRatio = 0.7

const offsets: Record<SlideFrom, (distance: number, rtl: boolean) => { x: number; y: number }> = {
  top: (distance) => ({ x: 0, y: -distance }),
  bottom: (distance) => ({ x: 0, y: distance }),
  left: (distance, rtl) => ({ x: rtl ? distance : -distance, y: 0 }),
  right: (distance, rtl) => ({ x: rtl ? -distance : distance, y: 0 })
}

const px = (value: number) => `${Math.round(value * 100) / 100}px`

const ms = (value: number) => `${Math.round(value * 1000)}ms`

export const resolveCssMotion = ({ name, settings, override, from = 'bottom', rtl = false }: CssMotionInput): CSSProperties => {
  const silent = override === false || settings.mode === 'never' || settings.preset === 'off'
  const recipe = override ? (override.recipe ?? name) : name
  const base = baseTuning[recipe]
  const scale = presetScale[settings.preset]
  const custom = { ...settings.recipes[recipe], ...(override ? override.tuning : undefined) }
  const duration = silent ? 0 : (custom.duration ?? base.duration * scale.duration)
  const distance = custom.distance ?? base.distance * scale.distance
  const factor = custom.scale ?? 1 - (1 - base.scale) * scale.distance
  const origin = override && override.from ? override.from : from
  const offset = recipe === 'slide' ? offsets[origin](distance, rtl) : { x: 0, y: recipe === 'pop' ? distance : 0 }

  return {
    '--enchase-presence-duration': ms(duration),
    '--enchase-presence-exit-duration': ms(duration * exitRatio),
    '--enchase-presence-x': px(silent ? 0 : offset.x),
    '--enchase-presence-y': px(silent ? 0 : offset.y),
    '--enchase-presence-scale': String(silent || recipe !== 'pop' ? 1 : factor)
  } as CSSProperties
}

export const exitMilliseconds = (style: CSSProperties) => {
  const value = Number.parseFloat(String((style as Record<string, string>)['--enchase-presence-exit-duration']))

  return Number.isFinite(value) ? value : 0
}
