import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import styled from 'styled-components'

import { Button, ColorModeProvider } from '../../../dist-lib/index.js'
import plainCss from '../../../dist-lib/styles.css?inline'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dashed' | 'link'
type Order = 'before' | 'after'
type Kind = 'alone' | 'class' | 'restStyled' | 'statesStyled'
type Values = Record<string, string>
type Snapshot = { rest: Values; hover: Values; focus: Values; disabled: Values }

const PROPS = ['background-color', 'color', 'outline-color', 'border-top-color', 'box-shadow']
const orders = ['before', 'after'] as const

const USER_REST = '.mine { background-color: rgb(1, 2, 3); color: rgb(3, 2, 1); outline-color: rgb(5, 5, 5); border-top-color: rgb(7, 7, 7); box-shadow: 0 0 0 1px rgb(6, 6, 6); }'
const USER_STATES = '.mine:hover { background-color: rgb(9, 9, 9); } .mine:focus-visible { outline-color: rgb(8, 8, 8); } .mine:disabled { background-color: rgb(4, 5, 6); }'

const RestStyled = styled(Button)`
  background-color: rgb(1, 2, 3);
  color: rgb(3, 2, 1);
  outline-color: rgb(5, 5, 5);
  border-top-color: rgb(7, 7, 7);
  box-shadow: 0 0 0 1px rgb(6, 6, 6);
`

const StatesStyled = styled(Button)`
  &:hover {
    background-color: rgb(9, 9, 9);
  }

  &:focus-visible {
    outline-color: rgb(8, 8, 8);
  }

  &:disabled {
    background-color: rgb(4, 5, 6);
  }
`

const added: HTMLStyleElement[] = []

const reset = () => {
  cleanup()
  added.splice(0).forEach((style) => style.remove())
}

afterEach(reset)

const addStyle = (css: string) => {
  const style = document.createElement('style')

  style.textContent = css
  document.head.append(style)
  added.push(style)

  return style
}

const frames = (count = 2) =>
  new Promise<void>((resolve) => {
    const step = (left: number) => (left === 0 ? resolve() : requestAnimationFrame(() => step(left - 1)))

    step(count)
  })

const read = (element: Element) => {
  const style = getComputedStyle(element)

  return Object.fromEntries(PROPS.map((name) => [name, style.getPropertyValue(name)]))
}

const settle = async (element: Element) => {
  let previous = JSON.stringify(read(element))
  let stable = 0

  for (let index = 0; index < 90 && stable < 3; index += 1) {
    await frames(1)

    const next = JSON.stringify(read(element))

    stable = next === previous ? stable + 1 : 0
    previous = next
  }

  return read(element)
}

const subject = (kind: Kind, variant: Variant, disabled: boolean) => {
  if (kind === 'class') return <Button className="mine" variant={variant} disabled={disabled}>Salvar</Button>
  if (kind === 'restStyled') return <RestStyled variant={variant} disabled={disabled}>Salvar</RestStyled>
  if (kind === 'statesStyled') return <StatesStyled variant={variant} disabled={disabled}>Salvar</StatesStyled>

  return <Button variant={variant} disabled={disabled}>Salvar</Button>
}

const measure = async (kind: Kind, order: Order | 'alone', userCss?: string, variant: Variant = 'primary'): Promise<Snapshot> => {
  reset()
  await userEvent.hover(document.body)

  render(
    <ColorModeProvider defaultMode="light" storage={null}>
      {subject(kind, variant, false)}
      {subject(kind, variant, true)}
    </ColorModeProvider>
  )

  if (kind === 'class') {
    const sheets = userCss === undefined ? [plainCss] : order === 'before' ? [userCss, plainCss] : [plainCss, userCss]

    sheets.forEach((text) => addStyle(text))
  } else {
    const library = addStyle(plainCss)

    if (order === 'after') document.head.insertBefore(library, document.querySelector('style[data-styled]'))
  }

  await frames()

  const [enabled, disabled] = Array.from(document.querySelectorAll<HTMLElement>('button'))
  const rest = await settle(enabled)
  const disabledRest = await settle(disabled)

  await userEvent.hover(enabled)
  const hover = await settle(enabled)

  await userEvent.hover(document.body)
  ;(document.activeElement as HTMLElement | null)?.blur()
  await userEvent.tab()

  if (!enabled.matches(':focus-visible')) throw new Error('the keyboard did not give the button focus-visible')

  const focus = await settle(enabled)

  enabled.blur()

  return { rest, hover, focus, disabled: disabledRest }
}

describe('the rest class of the app against the library on the ladder, in both orders', () => {
  it.each(orders)('wins the rest state with its css %s the library', async (order) => {
    const user = await measure('class', order, USER_REST)

    expect(user.rest).toMatchObject({ 'background-color': 'rgb(1, 2, 3)', color: 'rgb(3, 2, 1)', 'outline-color': 'rgb(5, 5, 5)', 'border-top-color': 'rgb(7, 7, 7)' })
  })
})

describe('the state classes of the app against the library on the ladder, in both orders', () => {
  it.each(orders)('wins hover, focus-visible and disabled with its css %s the library', async (order) => {
    const user = await measure('class', order, USER_STATES)

    expect(user.hover['background-color']).toBe('rgb(9, 9, 9)')
    expect(user.focus['outline-color']).toBe('rgb(8, 8, 8)')
    expect(user.disabled['background-color']).toBe('rgb(4, 5, 6)')
  })
})

describe('the library states against the rest class of the app on the ladder, in both orders', () => {
  it.each(orders)('keeps the library hover and focus-visible over the rest class of the app with its css %s the library', async (order) => {
    const library = await measure('alone', 'alone')
    const user = await measure('class', order, USER_REST)

    expect(library.hover['box-shadow']).not.toBe(library.rest['box-shadow'])
    expect(user.hover['box-shadow']).toBe(library.hover['box-shadow'])
    expect(library.focus['outline-color']).not.toBe(library.rest['outline-color'])
    expect(user.focus['outline-color']).toBe(library.focus['outline-color'])
  })

  it.each(orders)('lets the rest class of the app win the disabled state with its css %s the library', async (order) => {
    const user = await measure('class', order, USER_REST)

    expect(user.disabled['background-color']).toBe('rgb(1, 2, 3)')
  })
})

describe('the rest of a styled(Button) against the library on the ladder, in both orders', () => {
  it.each(orders)('wins the rest state with the styles of styled-components %s the library', async (order) => {
    const user = await measure('restStyled', order)

    expect(user.rest).toMatchObject({ 'background-color': 'rgb(1, 2, 3)', color: 'rgb(3, 2, 1)', 'outline-color': 'rgb(5, 5, 5)', 'border-top-color': 'rgb(7, 7, 7)' })
  })
})

describe('the states of a styled(Button) against the library on the ladder, in both orders', () => {
  it.each(orders)('wins hover, focus-visible and disabled with the styles of styled-components %s the library', async (order) => {
    const user = await measure('statesStyled', order)

    expect(user.hover['background-color']).toBe('rgb(9, 9, 9)')
    expect(user.focus['outline-color']).toBe('rgb(8, 8, 8)')
    expect(user.disabled['background-color']).toBe('rgb(4, 5, 6)')
  })
})

describe('the library states against the rest of a styled(Button) on the ladder, in both orders', () => {
  it.each(orders)('keeps the library hover and focus-visible over the rest styles with the styles of styled-components %s the library', async (order) => {
    const library = await measure('alone', 'alone')
    const user = await measure('restStyled', order)

    expect(library.hover['box-shadow']).not.toBe(library.rest['box-shadow'])
    expect(user.hover['box-shadow']).toBe(library.hover['box-shadow'])
    expect(library.focus['outline-color']).not.toBe(library.rest['outline-color'])
    expect(user.focus['outline-color']).toBe(library.focus['outline-color'])
  })

  it.each(orders)('lets the rest styles win the disabled state with the styles of styled-components %s the library', async (order) => {
    const user = await measure('restStyled', order)

    expect(user.disabled['background-color']).toBe('rgb(1, 2, 3)')
  })
})
