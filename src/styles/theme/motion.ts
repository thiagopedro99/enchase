import { baseTokens } from '../tokens/index.ts'

import type { BaseTokens } from '../tokens/types.ts'

export type MotionOverrides = {
  duration?: Partial<BaseTokens['motion']['duration']>
  easing?: Partial<BaseTokens['motion']['ease']>
  distance?: Partial<BaseTokens['motion']['distance']>
  spring?: Partial<BaseTokens['motion']['spring']>
}

export type MotionIssue = { label: string; value: string; milliseconds: number; maximum: number }

export const maxUiDuration = 300

const maxDurationMilliseconds = 10000

const duration = /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/

const keywords = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']

const bezier = /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/

const linearFunction = /^linear\(\s*-?[\d.]+(?:\s+[\d.]+%?)?(?:\s*,\s*-?[\d.]+(?:\s+[\d.]+%?)?)+\s*\)$/

const distance = /^(\d+(?:\.\d+)?|\.\d+)(px|rem|em)$/

const maxDistance = { px: 600, rem: 40, em: 40 }

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

export const toMilliseconds = (value: string): number | null => {
  const match = duration.exec(value)

  if (!match) return null

  return match[2] === 's' ? Number(match[1]) * 1000 : Number(match[1])
}

export const isValidDuration = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const milliseconds = toMilliseconds(value)

  return milliseconds !== null && milliseconds <= maxDurationMilliseconds
}

export const isValidEasing = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  if (keywords.includes(value) || linearFunction.test(value)) return true

  const match = bezier.exec(value)

  if (!match) return false

  const [x1, y1, x2, y2] = match.slice(1).map(Number)

  return [x1, y1, x2, y2].every(Number.isFinite) && x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1
}

export const isValidDistance = (value: unknown): value is string => {
  if (typeof value !== 'string') return false

  const match = distance.exec(value)

  return match !== null && Number(match[1]) <= maxDistance[match[2] as keyof typeof maxDistance]
}

const mergeGroup = <Group extends Record<string, string>>(base: Group, overrides: unknown, path: string, valid: (value: unknown) => boolean, what: string): Group => {
  if (!isRecord(overrides)) throw new Error(`Expected an object for "${path}"`)

  const result: Record<string, string> = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    if (!Object.prototype.hasOwnProperty.call(base, key)) throw new Error(`Unknown motion token "${path}.${key}"`)
    if (value === undefined) continue
    if (!valid(value)) throw new Error(`Invalid ${what} for "${path}.${key}": ${JSON.stringify(value)}`)

    result[key] = value as string
  }

  return result as Group
}

const groups = {
  duration: { valid: isValidDuration, what: 'duration', key: 'duration' },
  easing: { valid: isValidEasing, what: 'easing', key: 'ease' },
  distance: { valid: isValidDistance, what: 'distance', key: 'distance' },
  spring: { valid: isValidEasing, what: 'easing', key: 'spring' }
} as const

export const mergeMotion = (overrides: unknown): BaseTokens['motion'] => {
  if (!isRecord(overrides)) throw new Error('Expected an object for "motion"')

  const result = { ...baseTokens.motion } as Record<string, unknown>

  for (const [name, group] of Object.entries(overrides)) {
    if (!Object.prototype.hasOwnProperty.call(groups, name)) throw new Error(`Unknown motion section "motion.${name}"`)
    if (group === undefined) continue

    const { valid, what, key } = groups[name as keyof typeof groups]

    result[key] = mergeGroup(baseTokens.motion[key as keyof BaseTokens['motion']] as Record<string, string>, group, `motion.${name}`, valid, what)
  }

  return result as BaseTokens['motion']
}

export const motionTransitions = (motion: BaseTokens['motion']): BaseTokens['transitions'] => ({
  fast: `${motion.duration.fast} ${motion.ease.out}`,
  normal: `${motion.duration.base} ${motion.ease.out}`,
  slow: `${motion.duration.slow} ${motion.ease.out}`
})

export const validateMotion = (base: BaseTokens): MotionIssue[] =>
  Object.entries(base.motion.duration).flatMap(([name, value]): MotionIssue[] => {
    const milliseconds = toMilliseconds(value)

    return milliseconds !== null && milliseconds > maxUiDuration ? [{ label: `motion.duration.${name}`, value, milliseconds, maximum: maxUiDuration }] : []
  })

export const formatMotionIssues = (issues: MotionIssue[]): string | null => {
  if (issues.length === 0) return null

  const lines = issues.map((issue) => `  ${issue.label}: ${issue.value} (UI motion should stay at ${issue.maximum}ms or less)`)

  return [`[enchase] ${issues.length} motion duration(s) of the theme are longer than ${maxUiDuration}ms`, ...lines].join('\n')
}
