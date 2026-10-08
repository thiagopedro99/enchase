import { afterEach, describe, expect, inject, it } from 'vitest'

import { applyClientVariant, clientVariants } from './environment.ts'
import { hydrationCases, withProviders } from './cases.tsx'
import { knownFailures } from './knownFailures.ts'
import { hydrateAndCollect } from './hydrate.ts'

import './provided.ts'

let restore: (() => void) | undefined

afterEach(() => {
  restore?.()
  restore = undefined
})

describe('server render', () => {
  it('renders every case on the server', () => {
    const serverHtml = inject('serverHtml')

    expect(Object.keys(serverHtml)).toEqual(hydrationCases.map((hydrationCase) => hydrationCase.name))

    for (const html of Object.values(serverHtml)) expect(html.length).toBeGreaterThan(0)
  })
})

describe('hydration of the server rendered html', () => {
  const serverHtml = inject('serverHtml')

  for (const variant of clientVariants) {
    describe(variant.name, () => {
      for (const hydrationCase of hydrationCases) {
        const cause = knownFailures[variant.name]?.[hydrationCase.name]
        const run = cause ? it.fails : it

        run(cause ? `${hydrationCase.name} (known: ${cause})` : hydrationCase.name, async () => {
          restore = applyClientVariant(variant)

          const problems = await hydrateAndCollect(serverHtml[hydrationCase.name], withProviders(hydrationCase))

          expect(problems.join(' | ')).toBe('')
        })
      }
    })
  }
})
