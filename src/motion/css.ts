import { baseTuning, presetScale } from './defaultData.ts'

import type { CSSProperties } from 'react'
import type { MotionOverride, MotionSettings, RecipeName, SlideFrom } from './types.ts'

export type CssMotionInput = {
  name: RecipeName
  settings: MotionSettings
  component: string
  override?: MotionOverride
  from?: SlideFrom
  rtl?: boolean
}

export const exitRatio = 0.7

const directions: Record<SlideFrom, (rtl: boolean) => { dx: number; dy: number }> = {
  top: () => ({ dx: 0, dy: -1 }),
  bottom: () => ({ dx: 0, dy: 1 }),
  left: (rtl) => ({ dx: rtl ? 1 : -1, dy: 0 }),
  right: (rtl) => ({ dx: rtl ? -1 : 1, dy: 0 })
}

const px = (value: number) => `${Math.round(value * 100) / 100}px`

const ms = (value: number) => `${Math.round(value * 1000)}ms`

export const resolveCssMotion = ({ name, settings, component, override, from = 'bottom', rtl = false }: CssMotionInput): CSSProperties => {
  const silent = override === false || settings.mode === 'never' || settings.preset === 'off'
  const recipe = override ? (override.recipe ?? name) : name
  const base = baseTuning[recipe]
  const scale = presetScale[settings.preset]
  const custom = { ...settings.recipes[recipe], ...(override ? override.tuning : undefined) }
  const duration = silent ? 0 : (custom.duration ?? base.duration * scale.duration)
  const distance = custom.distance ?? base.distance * scale.distance
  const factor = custom.scale ?? 1 - (1 - base.scale) * scale.distance
  const origin = override && override.from ? override.from : from
  const direction = recipe === 'slide' ? directions[origin](rtl) : { dx: 0, dy: recipe === 'pop' ? 1 : 0 }
  const prefix = `--enchase-${component}`

  return {
    [`${prefix}-duration`]: ms(duration),
    [`${prefix}-exit-duration`]: ms(duration * exitRatio),
    [`${prefix}-distance`]: px(silent ? 0 : distance),
    [`${prefix}-dx`]: String(direction.dx),
    [`${prefix}-dy`]: String(direction.dy),
    [`${prefix}-scale`]: String(silent || recipe !== 'pop' ? 1 : factor)
  } as CSSProperties
}
