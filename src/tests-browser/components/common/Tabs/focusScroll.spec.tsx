import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Tabs } from '@components/common/Tabs/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { parts } from '../../../support/hookProbes.ts'

const items = Array.from({ length: 8 }, (_, index) => ({ value: `tab-${index + 1}`, label: `Aba número ${index + 1}`, content: `Conteúdo ${index + 1}` }))

const list = () => document.body.querySelector<HTMLElement>('[role="tablist"]') as HTMLElement

const tab = (position: number) => parts('tabs-tab')[position - 1]

const focusedOn = (position: number) => expect(document.activeElement).toBe(tab(position))

const overflow = (element: Element) => {
  const box = element.getBoundingClientRect()
  const area = list().getBoundingClientRect()
  const left = area.left + list().clientLeft
  const top = area.top + list().clientTop

  return Math.max(left - box.left, box.right - (left + list().clientWidth), top - box.top, box.bottom - (top + list().clientHeight), 0)
}

const openNarrow = async (dir: 'ltr' | 'rtl' = 'ltr') => {
  renderInBrowser(
    <div dir={dir} style={{ inlineSize: 280 }}>
      <Tabs ariaLabel="Seções" items={items} />
    </div>
  )
  await userEvent.tab()
}

describe('the tabs of the Tabs in a list that is narrower than they are, in a real browser', () => {
  it('has a list that hides part of its tabs, so the tabs out of sight need the scroll to be seen', async () => {
    await openNarrow()

    focusedOn(1)
    expect(list().scrollWidth).toBeGreaterThan(list().clientWidth)
  })

  it('keeps every tab that the right arrow reaches inside the visible part of the list, with the scroll following it', async () => {
    await openNarrow()

    for (let position = 2; position <= 8; position += 1) {
      await userEvent.keyboard('{ArrowRight}')

      focusedOn(position)
      expect(overflow(tab(position)), `tab ${position}`).toBeLessThanOrEqual(1)
    }

    expect(list().scrollLeft).toBeGreaterThan(0)
    expect(window.scrollX).toBe(0)
  })

  it('keeps every tab that the left arrow reaches inside the visible part of the list when it was scrolled to its end', async () => {
    await openNarrow()
    await userEvent.keyboard('{End}')

    focusedOn(8)

    for (let position = 7; position >= 1; position -= 1) {
      await userEvent.keyboard('{ArrowLeft}')

      focusedOn(position)
      expect(overflow(tab(position)), `tab ${position}`).toBeLessThanOrEqual(1)
    }

    expect(window.scrollX).toBe(0)
  })

  it('keeps every tab that the arrow reaches inside the visible part of the list when the text runs from right to left', async () => {
    await openNarrow('rtl')

    for (let position = 2; position <= 8; position += 1) {
      await userEvent.keyboard('{ArrowLeft}')

      focusedOn(position)
      expect(overflow(tab(position)), `tab ${position}`).toBeLessThanOrEqual(1)
    }
  })
})
