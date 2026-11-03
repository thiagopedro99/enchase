import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { parts } from '../../../support/hookProbes.ts'

const items = Array.from({ length: 14 }, (_, index) => ({ value: `item-${index + 1}`, title: `Pergunta ${index + 1}`, content: `Resposta ${index + 1}` }))

const trigger = (position: number) => parts('accordion-trigger')[position - 1]

const focusedOn = (position: number) => expect(document.activeElement).toBe(trigger(position))

const outsideViewport = (element: Element) => {
  const box = element.getBoundingClientRect()

  return Math.max(-box.top, box.bottom - window.innerHeight, 0)
}

const openOnShortScreen = async () => {
  await page.viewport(1280, 300)
  renderInBrowser(<Accordion items={items} />)
  await userEvent.tab()
}

afterEach(async () => {
  await page.viewport(1280, 800)
})

describe('the triggers of the Accordion on a short screen in a real browser', () => {
  it('has triggers below the visible part of the page, so they need the scroll to be seen', async () => {
    await openOnShortScreen()

    focusedOn(1)
    expect(document.documentElement.scrollHeight).toBeGreaterThan(window.innerHeight)
    expect(outsideViewport(trigger(14))).toBeGreaterThan(0)
  })

  it('keeps every trigger that the down arrow reaches inside the visible part of the page', async () => {
    await openOnShortScreen()

    for (let position = 2; position <= 14; position += 1) {
      await userEvent.keyboard('{ArrowDown}')

      focusedOn(position)
      expect(outsideViewport(trigger(position)), `trigger ${position}`).toBeLessThanOrEqual(1)
    }

    expect(window.scrollY).toBeGreaterThan(0)
  })

  it('keeps every trigger that the up arrow reaches inside the visible part of the page when it was scrolled to its end', async () => {
    await openOnShortScreen()
    await userEvent.keyboard('{End}')

    focusedOn(14)

    for (let position = 13; position >= 1; position -= 1) {
      await userEvent.keyboard('{ArrowUp}')

      focusedOn(position)
      expect(outsideViewport(trigger(position)), `trigger ${position}`).toBeLessThanOrEqual(1)
    }
  })
})
