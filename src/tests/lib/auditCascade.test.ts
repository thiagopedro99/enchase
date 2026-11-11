import { describe, expect, it } from 'vitest'

import { acceptedFlip, compareFlips, directionOf, directionsOf, gateFailures, pageGateFailures, verdict } from '../../../scripts/auditCascade.mjs'

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

    expect(result).toEqual({ status: 'fail', noisy: false, labels: ['element 1'], differing: [1], treatment: shot('a', 'x') })
  })

  it('fails as noisy-fail when the difference repeats but the control itself is unstable', async () => {
    const result = await verdict({ control: shot('a', 'b'), controlAgain: shot('a', 'x'), loadTreatment: async () => shot('a', 'y') })

    expect(result).toEqual({ status: 'noisy-fail', noisy: true, labels: ['element 1'], differing: [1], treatment: shot('a', 'y') })
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

describe('the direction of each difference of the page rules', () => {
  it('says that the library wins when the page changed the control and the treatment keeps the library', () => {
    expect(directionOf('page', 'library', 'library')).toBe('lib-wins')
  })

  it('says that the page wins when the page changes the treatment and the control keeps the library', () => {
    expect(directionOf('library', 'page', 'library')).toBe('page-wins')
  })

  it('says other when neither side keeps the library', () => {
    expect(directionOf('x', 'y', 'library')).toBe('other')
  })

  it('says other when there is no library to compare with', () => {
    expect(directionOf('page', 'library', undefined)).toBe('other')
  })

  it('counts the direction of each differing element, against the library without the page', () => {
    const directions = directionsOf({ control: shot('page', 'a', 'x'), treatment: shot('library', 'a', 'z'), reference: shot('library', 'a', 'library'), differing: [0, 2] })

    expect(directions.counts).toEqual({ 'lib-wins': 1, 'page-wins': 0, other: 1 })
    expect(directions.directions).toEqual([
      { label: 'element 0', direction: 'lib-wins' },
      { label: 'element 2', direction: 'other' }
    ])
  })

  it('accepts a story whose differences the library explains, and fails the stories the page explains', () => {
    const explained = { id: 'explained', status: 'fail', directions: { counts: { 'lib-wins': 2, 'page-wins': 0, other: 0 }, directions: [] } }
    const pageWins = { id: 'pagewins', status: 'fail', directions: { counts: { 'lib-wins': 1, 'page-wins': 1, other: 0 }, directions: [] } }
    const results = [explained, pageWins, { id: 'noisy', status: 'noisy-fail' }, { id: 'ok', status: 'ok' }]

    expect(acceptedFlip(explained)).toBe(true)
    expect(acceptedFlip(pageWins)).toBe(false)
    expect(pageGateFailures(results).map((result) => result.id)).toEqual(['pagewins', 'noisy'])
  })
})
