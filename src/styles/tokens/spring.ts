export type SpringPhysics = {
  stiffness: number
  damping: number
  mass?: number
}

export type SpringPerceptual = {
  duration: number
  bounce?: number
}

export type SpringInput = SpringPhysics | SpringPerceptual

export type SpringResult = {
  easing: string
  duration: number
}

const samples = 48

const criticalTolerance = 1e-9

const settleThreshold = 0.001

const maxSeconds = 20

const isPhysics = (input: SpringInput): input is SpringPhysics => 'stiffness' in input

const toPhysics = (input: SpringInput): Required<SpringPhysics> => {
  if (isPhysics(input)) return { stiffness: input.stiffness, damping: input.damping, mass: input.mass ?? 1 }

  const bounce = Math.min(Math.max(input.bounce ?? 0, 0), 0.95)
  const omega = (2 * Math.PI) / input.duration

  return { stiffness: omega * omega, damping: 4 * Math.PI * (1 - bounce) / input.duration, mass: 1 }
}

const assertValid = (physics: Required<SpringPhysics>) => {
  const values = [physics.stiffness, physics.damping, physics.mass]

  if (!values.every((value) => Number.isFinite(value) && value > 0)) throw new Error('A spring needs a positive stiffness, damping and mass, or a positive duration')
}

export const springPosition = (input: SpringInput, seconds: number): number => {
  const { stiffness, damping, mass } = toPhysics(input)
  const omega = Math.sqrt(stiffness / mass)
  const ratio = damping / (2 * Math.sqrt(stiffness * mass))

  if (ratio < 1 - criticalTolerance) {
    const damped = omega * Math.sqrt(1 - ratio * ratio)

    return 1 - Math.exp(-ratio * omega * seconds) * (Math.cos(damped * seconds) + ((ratio * omega) / damped) * Math.sin(damped * seconds))
  }

  if (Math.abs(ratio - 1) <= criticalTolerance) return 1 - Math.exp(-omega * seconds) * (1 + omega * seconds)

  const root = Math.sqrt(ratio * ratio - 1)
  const slow = -omega * (ratio - root)
  const fast = -omega * (ratio + root)

  return 1 - (fast * Math.exp(slow * seconds) - slow * Math.exp(fast * seconds)) / (fast - slow)
}

export const springSettleTime = (input: SpringInput): number => {
  const step = 1 / 240
  let settled = 0

  for (let seconds = 0; seconds <= maxSeconds; seconds += step) {
    if (Math.abs(springPosition(input, seconds) - 1) > settleThreshold) settled = seconds + step
  }

  return settled
}

const round = (value: number) => Math.round(value * 1000) / 1000

export type SpringTiming = {
  duration: number
  bounce?: number
}

export const timedSpring = ({ duration, bounce = 0 }: SpringTiming): SpringResult => {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('A timed spring needs a positive duration in seconds')

  const reference = springSettleTime({ duration: 1, bounce })
  const perceptual = duration / reference
  const result = spring({ duration: perceptual, bounce })

  return { easing: result.easing, duration: Math.round(duration * 1000) }
}

export const spring = (input: SpringInput): SpringResult => {
  assertValid(toPhysics(input))

  const duration = springSettleTime(input)
  const points = Array.from({ length: samples }, (_, index) => (index === samples - 1 ? 1 : round(springPosition(input, (duration * index) / (samples - 1)))))
  points[0] = 0

  return { easing: `linear(${points.join(', ')})`, duration: Math.round(duration * 1000) }
}
