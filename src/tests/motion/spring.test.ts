import { describe, expect, it } from 'vitest'

import { spring, springPosition, springSettleTime, timedSpring } from '@motion/spring.ts'
import { baseTokens } from '@styles/tokens/base.ts'

const numeric = (stiffness: number, damping: number, mass: number, seconds: number) => {
  const step = 1e-5
  let position = 0
  let velocity = 0

  for (let time = 0; time < seconds; time += step) {
    const force = -stiffness * (position - 1) - damping * velocity
    velocity += (force / mass) * step
    position += velocity * step
  }

  return position
}

const points = (easing: string) => easing.replace('linear(', '').replace(')', '').split(',').map(Number)

describe('spring position', () => {
  const cases = [
    { name: 'underdamped', stiffness: 170, damping: 12, mass: 1 },
    { name: 'critically damped', stiffness: 100, damping: 20, mass: 1 },
    { name: 'overdamped', stiffness: 100, damping: 40, mass: 1 },
    { name: 'heavy', stiffness: 300, damping: 30, mass: 3 }
  ]

  for (const { name, ...physics } of cases) {
    it(`matches a numerical integration for an ${name} spring`, () => {
      for (const seconds of [0.05, 0.15, 0.3, 0.6, 1]) {
        expect(springPosition(physics, seconds)).toBeCloseTo(numeric(physics.stiffness, physics.damping, physics.mass, seconds), 2)
      }
    })
  }

  it('starts at rest at zero and ends at one', () => {
    expect(springPosition({ stiffness: 170, damping: 12 }, 0)).toBeCloseTo(0, 6)
    expect(springPosition({ stiffness: 170, damping: 12 }, 10)).toBeCloseTo(1, 4)
  })

  it('overshoots when it bounces and never when it is critically damped', () => {
    const bouncy = spring({ duration: 0.5, bounce: 0.4 })
    const flat = spring({ duration: 0.5 })

    expect(Math.max(...points(bouncy.easing))).toBeGreaterThan(1)
    expect(Math.max(...points(flat.easing))).toBeLessThanOrEqual(1.0001)
  })
})

describe('spring', () => {
  it('returns a linear() easing that starts at 0 and ends at exactly 1', () => {
    const { easing } = spring({ stiffness: 170, damping: 15 })
    const values = points(easing)

    expect(easing.startsWith('linear(')).toBe(true)
    expect(values[0]).toBe(0)
    expect(values.at(-1)).toBe(1)
    expect(values.length).toBeGreaterThan(20)
  })

  it('samples the analytic solution over its settle time', () => {
    const input = { stiffness: 170, damping: 15 }
    const { easing, duration } = spring(input)
    const values = points(easing)

    values.forEach((value, index) => {
      if (index === 0 || index === values.length - 1) return

      expect(value).toBeCloseTo(springPosition(input, ((duration / 1000) * index) / (values.length - 1)), 2)
    })
  })

  it('takes physics or a perceptual duration with bounce', () => {
    const perceptual = spring({ duration: 0.4, bounce: 0.2 })

    expect(perceptual.duration).toBeGreaterThan(300)
    expect(spring({ stiffness: 100, damping: 10, mass: 2 }).duration).toBeGreaterThan(0)
  })

  it('settles later for a softer spring', () => {
    expect(springSettleTime({ stiffness: 50, damping: 8 })).toBeGreaterThan(springSettleTime({ stiffness: 400, damping: 30 }))
  })

  it('throws for values that are not positive numbers', () => {
    expect(() => spring({ stiffness: 0, damping: 10 })).toThrow()
    expect(() => spring({ stiffness: 100, damping: -1 })).toThrow()
    expect(() => spring({ duration: 0 })).toThrow()
    expect(() => spring({ duration: Number.NaN })).toThrow()
  })
})

describe('timed spring', () => {
  it('plays the whole curve in exactly the requested duration', () => {
    const { easing, duration } = timedSpring({ duration: 0.3, bounce: 0.15 })
    const values = points(easing)

    expect(duration).toBe(300)
    expect(values[0]).toBe(0)
    expect(values[values.length - 1]).toBe(1)
  })

  it('settles at the requested time whatever the bounce', () => {
    for (const bounce of [0, 0.15, 0.3]) {
      const perceptual = springSettleTime({ duration: 1, bounce })
      const settle = springSettleTime({ duration: 0.3 / perceptual, bounce })

      expect(settle).toBeCloseTo(0.3, 1)
    }
  })

  it('keeps the same overshoot at any duration', () => {
    const fast = Math.max(...points(timedSpring({ duration: 0.2, bounce: 0.3 }).easing))
    const slow = Math.max(...points(timedSpring({ duration: 0.6, bounce: 0.3 }).easing))

    expect(fast).toBeCloseTo(slow, 2)
    expect(fast).toBeGreaterThan(1)
  })

  it('rejects a duration that is not positive', () => {
    expect(() => timedSpring({ duration: 0 })).toThrow()
    expect(() => timedSpring({ duration: Number.NaN })).toThrow()
  })
})

describe('spring tokens', () => {
  it('ships a gentle, a snappy and a bouncy easing as linear() strings', () => {
    for (const name of ['gentle', 'snappy', 'bouncy'] as const) expect(baseTokens.motion.spring[name].startsWith('linear(')).toBe(true)
  })

  it('carries the duration of each spring next to its curve', () => {
    expect(baseTokens.motion.spring.gentleDuration).toBe('300ms')
    expect(baseTokens.motion.spring.snappyDuration).toBe('300ms')
    expect(baseTokens.motion.spring.bouncyDuration).toBe('400ms')
  })

  it('makes the bouncy token overshoot and the gentle one stay below one', () => {
    expect(Math.max(...points(baseTokens.motion.spring.bouncy))).toBeGreaterThan(1)
    expect(Math.max(...points(baseTokens.motion.spring.gentle))).toBeLessThanOrEqual(1.0001)
  })
})
