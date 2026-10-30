import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { builtInStyles } from '@tests/shared/fixtures/styles.ts'
import { Input } from '@components/common/Input/index.tsx'
import { setDensity } from '../support/density.tsx'
import { GlobalStyles } from '@styles/react.tsx'

import type { CSSProperties, ReactElement } from 'react'

type Where = 'before' | 'after'

const orders = ['before', 'after'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string, where: Where) => {
  const style = document.createElement('style')

  style.textContent = css
  if (where === 'before') document.head.append(style)
  else document.body.append(style)
  added.push(style)
}

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

const form = (
  <>
    <Checkbox label="Terms" />
    <NumberInput label="Amount" defaultValue={1} />
    <Input label="Name" />
  </>
)

const show = (ui: ReactElement, layer?: string, style = 'enchase') =>
  render(
    <ColorModeProvider defaultMode="light" storage={null} cssLayer={layer} theme={{ style: builtInStyles[style] }}>
      <GlobalStyles />
      {ui}
    </ColorModeProvider>
  )

const readings = () => ({
  token: getComputedStyle(document.documentElement).getPropertyValue('--enchase-hit-size').trim(),
  checkbox: (document.querySelector('[data-slot=checkbox]') as HTMLElement).getBoundingClientRect().height,
  stepper: (document.querySelector('[data-slot=number-input-increase]') as HTMLElement).getBoundingClientRect().width,
  field: (document.querySelector('[data-slot=input-field]') as HTMLElement).getBoundingClientRect().height
})

const appToken = ':root { --enchase-hit-size: 48px; }'

const appHook = ':root { --enchase-input-height: 3rem; }'

describe('a token of the app on :root, against the compact density on the root', () => {
  it.each(orders)('loses to :root[data-density=compact] in a theme without a layer, because 0,2,0 is stronger than 0,1,0, with the css of the app %s the theme', (where) => {
    setDensity('compact')
    show(form)
    addStyle(appToken, where)

    expect(readings()).toEqual({ token: '32px', checkbox: 32, stepper: 32, field: 44 })
  })

  it('wins without the attribute when its css comes after a theme without a layer, which shows that the loss above comes from the density', () => {
    show(form)
    addStyle(appToken, 'after')

    expect(readings()).toEqual({ token: '48px', checkbox: 48, stepper: 48, field: 56 })
  })

  it.each(orders)('wins over :root[data-density=compact] in a theme in a layer, because css without a layer beats every layer whatever the specificity, with the css of the app %s the theme', (where) => {
    setDensity('compact')
    show(form, 'enchase-theme')
    addStyle(appToken, where)

    expect(readings()).toEqual({ token: '48px', checkbox: 48, stepper: 48, field: 44 })
  })

  it('keeps the compact density in a theme in a layer when the app declares nothing, which shows that the win above comes from the layer', () => {
    setDensity('compact')
    show(form, 'enchase-theme')

    expect(readings()).toEqual({ token: '32px', checkbox: 32, stepper: 32, field: 44 })
  })
})

describe('the way out of the compact density in a theme without a layer, for a token of the app', () => {
  const sameStrength = ":root[data-density='compact'] { --enchase-hit-size: 48px; }"
  const stronger = "html:root[data-density='compact'] { --enchase-hit-size: 48px; }"

  it('is a selector of the same strength as :root[data-density=compact], which wins only when the css of the app comes after the theme, because a tie goes to the later rule', () => {
    setDensity('compact')
    show(form)
    addStyle(sameStrength, 'after')

    expect(readings()).toEqual({ token: '48px', checkbox: 48, stepper: 48, field: 44 })
  })

  it('is not a selector of the same strength when the css of the app comes before the theme, because the later rule of the theme wins the tie', () => {
    setDensity('compact')
    show(form)
    addStyle(sameStrength, 'before')

    expect(readings()).toEqual({ token: '32px', checkbox: 32, stepper: 32, field: 44 })
  })

  it.each(orders)('is a selector stronger than :root[data-density=compact], which wins in any order, because 0,2,1 is stronger than 0,2,0, with the css of the app %s the theme', (where) => {
    setDensity('compact')
    show(form)
    addStyle(stronger, where)

    expect(readings()).toEqual({ token: '48px', checkbox: 48, stepper: 48, field: 44 })
  })

  it.each(orders)('is a selector of the same strength or stronger only for the compact density: the same rule does nothing without the attribute, with the css of the app %s the theme', (where) => {
    show(form)
    addStyle(stronger, where)

    expect(readings()).toEqual({ token: '40px', checkbox: 40, stepper: 40, field: 56 })
  })
})

describe('a hook of the app, against the hooks of the compact density', () => {
  it.each(orders)('wins on :root in a theme without a layer, because 0,1,0 is stronger than the 0,0,0 of the compact hooks, with the css of the app %s the theme', (where) => {
    setDensity('compact')
    show(form)
    addStyle(appHook, where)

    expect(readings()).toMatchObject({ token: '32px', checkbox: 32, field: 48 })
  })

  it.each(orders)('wins on :root in a theme in a layer, because css without a layer beats every layer, with the css of the app %s the theme', (where) => {
    setDensity('compact')
    show(form, 'enchase-theme')
    addStyle(appHook, where)

    expect(readings()).toMatchObject({ token: '32px', checkbox: 32, field: 48 })
  })

  it.each(['enchase', 'shadcn'] as const)('wins when it is set on the component, because the nearest declaration wins, in the %s style', (style) => {
    setDensity('compact')
    show(
      <>
        <Input label="Name" wrapperStyle={{ '--enchase-input-height': '3rem' } as CSSProperties} />
        <Input label="Other" />
      </>,
      undefined,
      style
    )

    const [own, other] = [...document.querySelectorAll<HTMLElement>('[data-slot=input-field]')].map((field) => field.getBoundingClientRect().height)

    expect(own).toBe(48)
    expect(other).toBe(style === 'enchase' ? 44 : 32)
  })
})
