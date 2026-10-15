import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Button } from '../../dist-lib/index.js'
import layeredCss from '../../dist-lib/styles.layer.css?inline'
import plainCss from '../../dist-lib/styles.css?inline'

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  added.push(style)
}

const userCss = '.mine { background-color: rgb(1, 2, 3); color: rgb(4, 5, 6); padding-inline: 7px; } .mine:hover { background-color: rgb(9, 9, 9); }'

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

const renderButton = () => {
  render(
    <Button className="mine" size="lg">
      Salvar
    </Button>
  )

  return page.getByRole('button', { name: 'Salvar' }).element() as HTMLElement
}

describe('the layered stylesheet in a real browser', () => {
  it('declares the layer order and wraps the components in the enchase layer', () => {
    expect(layeredCss.startsWith('@layer enchase-theme, enchase-base, enchase;')).toBe(true)

    addStyle(layeredCss)
    const rules = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])

    expect(rules.some((rule) => rule instanceof CSSLayerBlockRule && rule.name === 'enchase')).toBe(true)
  })

  it.each([
    ['before', true],
    ['after', false]
  ])('lets the caller css win on colors, padding and hover when it loads %s the library', async (_, userFirst) => {
    if (userFirst) addStyle(userCss)
    addStyle(layeredCss)
    if (!userFirst) addStyle(userCss)
    const button = renderButton()
    const resting = getComputedStyle(button)

    expect(resting.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(resting.color).toBe('rgb(4, 5, 6)')
    expect(resting.paddingInlineStart).toBe('7px')

    await userEvent.hover(page.getByRole('button', { name: 'Salvar' }))

    await expect.poll(() => getComputedStyle(button).backgroundColor).toBe('rgb(9, 9, 9)')
  })
})

describe('the plain stylesheet in a real browser', () => {
  it('keeps layout winning through :where() whatever the load order', () => {
    addStyle(userCss)
    addStyle(plainCss)
    const button = renderButton()

    expect(getComputedStyle(button).paddingInlineStart).toBe('7px')
  })

  it('lets the caller colors win only when its css loads after the library', () => {
    addStyle(plainCss)
    addStyle(userCss)
    const button = renderButton()

    expect(getComputedStyle(button).backgroundColor).toBe('rgb(1, 2, 3)')
  })
})
