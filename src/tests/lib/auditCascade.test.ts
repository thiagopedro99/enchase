import { describe, expect, it } from 'vitest'

import { compareFlips, gateFailures, verdict } from '../../../scripts/auditCascade.mjs'

const shot = (...hashes: string[]) => ({ count: hashes.length, hashes, labels: hashes.map((_, index) => `element ${index}`) })

describe('the verdict of the cascade audit for one story', () => {
  it('is ok when the treatment matches the control', async () => {
    const result = await verdict({ control: shot('a', 'b'), controlAgain: shot('a', 'b'), loadTreatment: async () => shot('a', 'b') })

    expect(result).toEqual({ status: 'ok', noisy: false })
  })

  it('is flicker when the treatment differs once and a retry matches the control', async () => {
    let loads = 0
    const result = await verdict({
      control: shot('a', 'b'),
      controlAgain: shot('a', 'b'),
      loadTreatment: async () => {
        loads += 1

        return loads === 1 ? shot('a', 'x') : shot('a', 'b')
      }
    })

    expect(result).toEqual({ status: 'flicker', noisy: false })
    expect(loads).toBe(2)
  })

  it('fails when every load of the treatment differs and the control is stable', async () => {
    const result = await verdict({ control: shot('a', 'b'), controlAgain: shot('a', 'b'), loadTreatment: async () => shot('a', 'x') })

    expect(result).toEqual({ status: 'fail', noisy: false, labels: ['element 1'] })
  })

  it('fails as noisy-fail when the difference repeats but the control itself is unstable', async () => {
    const result = await verdict({ control: shot('a', 'b'), controlAgain: shot('a', 'x'), loadTreatment: async () => shot('a', 'y') })

    expect(result).toEqual({ status: 'noisy-fail', noisy: true, labels: ['element 1'] })
  })

  it('is an error when the story does not render', async () => {
    const result = await verdict({ control: null, controlAgain: shot('a'), loadTreatment: async () => shot('a') })

    expect(result.status).toBe('error')
  })

  it('is an error when the treatment does not render on any load', async () => {
    const result = await verdict({ control: shot('a'), controlAgain: shot('a'), loadTreatment: async () => null })

    expect(result.status).toBe('error')
  })
})

describe('the gate of the cascade audit', () => {
  it('fails on differences outside the noise, on unstable differences and on errors, and on nothing else', () => {
    const results = [
      { id: 'ok', status: 'ok' },
      { id: 'flicker', status: 'flicker' },
      { id: 'fail', status: 'fail' },
      { id: 'noisy', status: 'noisy-fail' },
      { id: 'error', status: 'error' }
    ]

    expect(gateFailures(results).map((result) => result.id)).toEqual(['fail', 'noisy', 'error'])
  })
})

describe('the expected flips of the page rules', () => {
  it('is empty when the stories that differ are the expected ones', () => {
    expect(compareFlips(['b', 'a'], ['a', 'b'])).toEqual({ missing: [], unexpected: [] })
  })

  it('reports the expected stories that stopped differing and the new stories that started to differ', () => {
    expect(compareFlips(['a', 'c'], ['a', 'b'])).toEqual({ missing: ['b'], unexpected: ['c'] })
  })
})
