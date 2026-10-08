import { afterEach, describe, expect, inject, it } from 'vitest'

import { applyClientVariant, reducedMotionVariant } from './environment.ts'
import { reducedMotionKnownFailures } from './knownFailures.ts'
import { hydrationCases, withProviders } from './cases.tsx'
import { hydrateAndCollect } from './hydrate.ts'

import './provided.ts'

let restore: (() => void) | undefined

afterEach(() => {
  restore?.()
  restore = undefined
})

describe('hydration when the client prefers reduced motion', () => {
  const serverHtml = inject('serverHtml')

  for (const hydrationCase of hydrationCases) {
    const cause = reducedMotionKnownFailures[hydrationCase.name]
    const run = cause ? it.fails : it

    run(cause ? `${hydrationCase.name} (known: ${cause})` : hydrationCase.name, async () => {
      restore = applyClientVariant(reducedMotionVariant)

      const problems = await hydrateAndCollect(serverHtml[hydrationCase.name], withProviders(hydrationCase))

      expect(problems.join(' | ')).toBe('')
    })
  }
})
