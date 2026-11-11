import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Button } from '../../../dist-lib/index.js'
import plainCss from '../../../dist-lib/styles.css?inline'
import modernNormalizeCss from '../fixtures/resets/modern-normalize.css?inline'
import tailwindPreflightCss from '../fixtures/resets/tailwind-preflight.css?inline'
import typicalCss from '../fixtures/resets/typical.css?inline'

type Snapshot = Record<string, string>

type Measure = {
  snapshots: Snapshot[]
  declared: Map<string, string>[]
}

const added: HTMLStyleElement[] = []

const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'dashed', 'link'] as const

const reset = () => {
  cleanup()
  added.splice(0).forEach((style) => style.remove())
}

afterEach(reset)

const frames = (count = 2) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1)))

    step(count)
  })

const addStyle = (css: string) => {
  const style = document.createElement('style')

  style.textContent = css
  document.head.append(style)
  added.push(style)

  return style
}

const matches = (element: Element, selector: string) => {
  try {
    return element.matches(selector)
  } catch {
    return false
  }
}

const declaredBy = (style: HTMLStyleElement, element: Element) => {
  const values = new Map<string, string>()
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        if (matches(element, rule.selectorText)) for (const name of Array.from(rule.style)) values.set(name, rule.style.getPropertyValue(name))
      } else if ('cssRules' in rule) walk((rule as CSSGroupingRule).cssRules)
    }
  }

  walk((style.sheet as CSSStyleSheet).cssRules)

  return values
}

const snapshotOf = (element: Element): Snapshot => {
  const style = getComputedStyle(element)

  return Object.fromEntries(Array.from(style).map((name) => [name, style.getPropertyValue(name)]))
}

const sample = (disabled: boolean) => (
  <>
    {variants.map((variant) => (
      <Button key={variant} variant={variant} disabled={disabled}>
        Salvar
      </Button>
    ))}
  </>
)

const measure = async (css: string[], library: string | undefined, disabled: boolean): Promise<Measure> => {
  reset()

  const sheets = css.map((text) => addStyle(text))
  const libraryStyle = library === undefined ? undefined : sheets[css.indexOf(library)]

  render(sample(disabled))
  await frames()

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))

  return {
    snapshots: buttons.map(snapshotOf),
    declared: buttons.map((button) => (libraryStyle ? declaredBy(libraryStyle, button) : new Map<string, string>()))
  }
}

const inherited = ['inherit', 'unset', 'initial']

const fightsOf = (plain: Measure, both: Measure) => {
  const counts: Record<string, number> = {}

  both.snapshots.forEach((snapshot, index) => {
    for (const [name, value] of both.declared[index] ?? []) {
      if (inherited.includes(value)) continue
      if (snapshot[name] !== plain.snapshots[index]?.[name]) counts[name] = (counts[name] ?? 0) + 1
    }
  })

  return counts
}

const focused = [
  'appearance',
  'background-color',
  'background-image',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'box-sizing',
  'color',
  'cursor',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'outline-style',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'text-decoration-line'
]

describe('the typical reset against the library on the ladder', () => {
  it.each(['before', 'after'] as const)('keeps what the library declares on each button and gives the rest the floor of the reset, with the reset %s the library', async (order) => {
    const plain = await measure([plainCss], plainCss, false)
    const floor = await measure([typicalCss], undefined, false)
    const both = await measure(order === 'before' ? [typicalCss, plainCss] : [plainCss, typicalCss], plainCss, false)
    const mismatches: string[] = []

    expect(both.snapshots.length).toBe(variants.length)
    both.snapshots.forEach((snapshot, index) => {
      for (const name of focused) {
        const expected = both.declared[index]?.has(name) ? plain.snapshots[index]?.[name] : floor.snapshots[index]?.[name]

        if (snapshot[name] !== expected) mismatches.push(`${variants[index]} ${name}: ${snapshot[name]} is not ${expected}`)
      }
    })

    expect(mismatches).toEqual([])
  })
})

describe('the known fights of the other resets on the ladder', () => {
  it.each([
    ['modern-normalize', modernNormalizeCss, {}, {}],
    ['tailwind preflight', tailwindPreflightCss, {}, { cursor: 7 }]
  ])('gives the sample of buttons the fights of %s in both orders, and no other', async (_, css, enabledFights, disabledFights) => {
    const found: Record<string, Record<string, Record<string, number>>> = { enabled: {}, disabled: {} }

    for (const disabled of [false, true]) {
      const plain = await measure([plainCss], plainCss, disabled)
      const before = await measure([css, plainCss], plainCss, disabled)
      const after = await measure([plainCss, css], plainCss, disabled)

      found[disabled ? 'disabled' : 'enabled'] = { before: fightsOf(plain, before), after: fightsOf(plain, after) }
    }

    expect(found).toEqual({
      enabled: { before: enabledFights, after: enabledFights },
      disabled: { before: disabledFights, after: disabledFights }
    })
  })
})

describe('a class of the app against the library on the ladder, in both orders', () => {
  const userCss = '.mine { background-color: rgb(1, 2, 3); } .mine:hover { background-color: rgb(9, 9, 9); } .mine:focus { outline-color: rgb(7, 7, 7); } .mine:disabled { background-color: rgb(4, 5, 6); }'

  it.each(['before', 'after'] as const)('wins on rest, hover, focus and disabled with its css %s the library', async (order) => {
    reset()

    for (const text of order === 'before' ? [userCss, plainCss] : [plainCss, userCss]) addStyle(text)

    render(
      <>
        <Button className="mine">Salvar</Button>
        <Button className="mine" disabled>
          Salvar
        </Button>
      </>
    )
    await frames()

    const [enabled, disabled] = Array.from(document.querySelectorAll<HTMLButtonElement>('button')) as HTMLElement[]

    expect(getComputedStyle(enabled as HTMLElement).backgroundColor).toBe('rgb(1, 2, 3)')
    expect(getComputedStyle(disabled as HTMLElement).backgroundColor).toBe('rgb(4, 5, 6)')

    await userEvent.hover(enabled as HTMLElement)
    await expect.poll(() => getComputedStyle(enabled as HTMLElement).backgroundColor).toBe('rgb(9, 9, 9)')

    ;(enabled as HTMLElement).focus()
    await expect.poll(() => getComputedStyle(enabled as HTMLElement).outlineColor).toBe('rgb(7, 7, 7)')
  })
})
