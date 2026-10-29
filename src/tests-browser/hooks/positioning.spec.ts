import { afterEach, describe, expect, it } from 'vitest'
import { computePosition as floatingCompute, flip, hide, offset, shift, size } from '@floating-ui/dom'

import { computePosition } from '../../positioning/index.ts'

import type { PlacementInput } from '../../positioning/index.ts'

const tolerance = 0.5

const sides = ['top', 'bottom', 'left', 'right'] as const

const aligns = ['', '-start', '-end'] as const

const random = (seed: number) => {
  const state = { value: seed }

  return () => {
    state.value = (state.value + 0x6d2b79f5) | 0
    const mixed = Math.imul(state.value ^ (state.value >>> 15), 1 | state.value)
    const final = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed

    return ((final ^ (final >>> 14)) >>> 0) / 4294967296
  }
}

type Scenario = {
  placement: PlacementInput
  offset: number
  padding: number
  rtl: boolean
  container: 'none' | 'clip' | 'fixed'
  border: number
  fractional: boolean
}

const pick = <Item>(next: () => number, items: readonly Item[]) => items[Math.floor(next() * items.length)]

const between = (next: () => number, low: number, high: number, fractional: boolean) => {
  const value = low + next() * (high - low)

  return fractional ? Math.round(value * 100) / 100 : Math.round(value)
}

const build = (next: () => number): Scenario => ({
  placement: `${pick(next, sides)}${pick(next, aligns)}` as PlacementInput,
  offset: pick(next, [0, 8, 4.5]),
  padding: pick(next, [0, 8]),
  rtl: next() < 0.4,
  container: pick(next, ['none', 'none', 'clip', 'fixed'] as const),
  border: pick(next, [0, 3]),
  fractional: next() < 0.5
})

const cleanups: HTMLElement[] = []

const make = (parent: HTMLElement, css: string) => {
  const element = document.createElement('div')
  element.style.cssText = css
  parent.append(element)
  cleanups.push(element)

  return element
}

const box = (scenario: Scenario, next: () => number) => {
  const fractional = scenario.fractional
  const width = innerWidth
  const height = innerHeight
  const rtlRoot = make(document.body, `direction: ${scenario.rtl ? 'rtl' : 'ltr'}`)
  const frame =
    scenario.container === 'none'
      ? rtlRoot
      : make(rtlRoot, `position: absolute; left: ${between(next, 0, width / 2, fractional)}px; top: ${between(next, 0, height / 2, fractional)}px; width: ${between(next, 100, width / 2, fractional)}px; height: ${between(next, 100, height / 2, fractional)}px; overflow: hidden; border: ${scenario.border}px solid black; box-sizing: border-box`)
  const reference = make(frame, `position: ${scenario.container === 'fixed' ? 'fixed' : 'absolute'}; left: ${between(next, -40, width, fractional)}px; top: ${between(next, -40, height, fractional)}px; width: ${between(next, 0, 200, fractional)}px; height: ${between(next, 0, 120, fractional)}px`)
  const floating = make(rtlRoot, `position: fixed; left: 0; top: 0; width: ${between(next, 30, 420, fractional)}px; height: ${between(next, 20, 360, fractional)}px; direction: ${scenario.rtl ? 'rtl' : 'ltr'}`)

  return { reference, floating }
}

const oracle = async (reference: HTMLElement, floating: HTMLElement, scenario: Scenario) => {
  const available = { width: 0, height: 0 }
  const result = await floatingCompute(reference, floating, {
    strategy: 'fixed',
    placement: scenario.placement as never,
    middleware: [
      offset(scenario.offset),
      flip({ padding: scenario.padding }),
      shift({ padding: scenario.padding }),
      size({
        padding: scenario.padding,
        apply: ({ availableWidth, availableHeight }) => {
          available.width = availableWidth
          available.height = availableHeight
        }
      }),
      hide()
    ]
  })

  return { x: result.x, y: result.y, placement: result.placement, availableWidth: available.width, availableHeight: available.height, hidden: result.middlewareData.hide?.referenceHidden ?? false }
}

afterEach(() => {
  cleanups.splice(0).forEach((element) => element.remove())
})

const run = async (seed: number, count: number, tweak?: (scenario: Scenario) => Scenario) => {
  const next = random(seed)
  const divergences: string[] = []

  for (let index = 0; index < count; index += 1) {
    const scenario = tweak ? tweak(build(next)) : build(next)
    const { reference, floating } = box(scenario, next)
    const expected = await oracle(reference, floating, scenario)
    const actual = computePosition(reference, floating, { placement: scenario.placement, offset: scenario.offset, padding: scenario.padding })
    const mismatch =
      expected.placement !== actual.placement ||
      Math.abs(expected.x - actual.x) > tolerance ||
      Math.abs(expected.y - actual.y) > tolerance ||
      Math.abs(expected.availableWidth - actual.availableWidth) > tolerance ||
      Math.abs(expected.availableHeight - actual.availableHeight) > tolerance ||
      expected.hidden !== actual.referenceHidden

    if (mismatch) divergences.push(`${index} ${JSON.stringify(scenario)} expected ${JSON.stringify(expected)} actual ${JSON.stringify({ x: actual.x, y: actual.y, placement: actual.placement, w: actual.availableWidth, h: actual.availableHeight, hidden: actual.referenceHidden })}`)
    cleanups.splice(0).forEach((element) => element.remove())
  }

  return divergences
}

describe('positioner against floating-ui in a real browser', () => {
  it('matches on integer sizes in the window', async () => {
    const divergences = await run(11, 1500, (scenario) => ({ ...scenario, container: 'none', fractional: false, border: 0 }))

    expect(divergences.slice(0, 3)).toEqual([])
  }, 120000)

  it('matches on fractional sizes and offsets', async () => {
    const divergences = await run(23, 1500, (scenario) => ({ ...scenario, container: 'none', fractional: true, border: 0 }))

    expect(divergences.slice(0, 3)).toEqual([])
  }, 120000)

  it('matches with clipping containers that have borders and anchors that escape them', async () => {
    const divergences = await run(37, 1500, (scenario) => ({ ...scenario, container: scenario.container === 'none' ? 'clip' : scenario.container }))

    expect(divergences.slice(0, 3)).toEqual([])
  }, 120000)
})

const withScrollbars = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  const filler = document.createElement('div')
  filler.style.cssText = 'height: 3000px; width: 1px'
  document.body.append(filler)

  return () => {
    style.remove()
    filler.remove()
  }
}

describe('positioner with visible scrollbars and a stable gutter', () => {
  it('matches with a classic scrollbar', async () => {
    const restore = withScrollbars('html { overflow-y: scroll } ::-webkit-scrollbar { width: 15px; height: 15px }')
    const divergences = await run(41, 1000, (scenario) => ({ ...scenario, container: 'none' }))
    restore()

    expect(divergences.slice(0, 3)).toEqual([])
  }, 120000)

  it('keeps the floating element inside the real fixed area with scrollbar-gutter stable, where floating-ui subtracts the gutter twice', async () => {
    const restore = withScrollbars('html { scrollbar-gutter: stable } ::-webkit-scrollbar { width: 15px; height: 15px } body > div:last-child { height: 1px !important }')
    const next = random(53)
    const escapes: string[] = []
    const gap = 0.01

    Array.from({ length: 600 }).forEach((_, index) => {
      const scenario = { ...build(next), container: 'none' as const, padding: 0 }
      const { reference, floating } = box(scenario, next)
      const result = computePosition(reference, floating, { placement: scenario.placement, offset: scenario.offset, padding: 0 })
      floating.style.left = `${result.x}px`
      floating.style.top = `${result.y}px`
      const rect = floating.getBoundingClientRect()
      const area = window.visualViewport?.width ?? innerWidth
      const fits = rect.width <= area && rect.height <= innerHeight && (result.placement.startsWith('top') || result.placement.startsWith('bottom'))
      if (fits && (rect.right > area + gap || rect.left < -gap)) escapes.push(`${index} ${JSON.stringify(scenario)} right ${rect.right} area ${area}`)
      cleanups.splice(0).forEach((element) => element.remove())
    })
    restore()

    expect(escapes.slice(0, 3)).toEqual([])
  }, 120000)
})

describe('positioner size and arrow', () => {
  it('shrinks a tall floating element to the available height and positions it inside the window', () => {
    const reference = make(document.body, 'position: fixed; left: 300px; top: 400px; width: 80px; height: 30px')
    const floating = make(document.body, 'position: fixed; left: 0; top: 0; width: 200px; height: 900px')
    const result = computePosition(reference, floating, {
      placement: 'bottom',
      padding: 8,
      apply: ({ availableHeight }) => {
        floating.style.maxHeight = `${availableHeight}px`
      }
    })

    expect(floating.getBoundingClientRect().height).toBeLessThanOrEqual(innerHeight)
    expect(result.y).toBeGreaterThanOrEqual(8 - tolerance)
  })

  it('centers the arrow on the reference and keeps it inside the floating element', () => {
    const reference = make(document.body, 'position: fixed; left: 20px; top: 200px; width: 40px; height: 30px')
    const floating = make(document.body, 'position: fixed; left: 0; top: 0; width: 160px; height: 60px')
    const arrow = make(floating, 'width: 10px; height: 10px')
    const result = computePosition(reference, floating, { placement: 'bottom', padding: 8, arrow: { element: arrow, padding: 4 } })

    expect(result.arrow?.x).toBeGreaterThanOrEqual(4)
    expect((result.arrow?.x ?? 0) + 10).toBeLessThanOrEqual(160 - 4)
    expect(result.x + (result.arrow?.x ?? 0) + 5).toBeCloseTo(40, 0)
  })

  it.each(['bottom', 'top', 'right', 'left'] as const)('keeps the arrow centered on the reference when the floating element has a border, placed %s', (placement) => {
    const reference = make(document.body, 'position: fixed; left: 300px; top: 300px; width: 40px; height: 30px')
    const floating = make(document.body, 'position: fixed; left: 0; top: 0; box-sizing: border-box; width: 160px; height: 120px; border: 5px solid')
    const arrow = make(floating, 'position: absolute; width: 10px; height: 10px')
    const result = computePosition(reference, floating, { placement, padding: 8, arrow: { element: arrow, padding: 4 } })

    floating.style.left = `${result.x}px`
    floating.style.top = `${result.y}px`
    arrow.style.left = result.arrow?.x === undefined ? '' : `${result.arrow.x}px`
    arrow.style.top = result.arrow?.y === undefined ? '' : `${result.arrow.y}px`

    const box = arrow.getBoundingClientRect()
    const vertical = placement === 'top' || placement === 'bottom'

    expect(vertical ? box.left + box.width / 2 : box.top + box.height / 2).toBeCloseTo(vertical ? 320 : 315, 0)
  })

  it('maps start and end to the physical sides with the direction of the floating element', () => {
    const rtl = make(document.body, 'direction: rtl')
    const reference = make(rtl, 'position: fixed; left: 600px; top: 300px; width: 40px; height: 30px')
    const floating = make(rtl, 'position: fixed; left: 0; top: 0; width: 100px; height: 40px')

    expect(computePosition(reference, floating, { placement: 'start' }).placement).toBe('right')
    expect(computePosition(reference, floating, { placement: 'end' }).placement).toBe('left')
  })
})
