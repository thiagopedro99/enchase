import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { part, parts } from '../../../support/hookProbes.ts'

const options = Array.from({ length: 8 }, (_, index) => ({ value: `option-${index + 1}`, label: `Opção ${index + 1}` }))

const group = () => part('segmented-control')

const option = (position: number) => parts('segmented-control-item')[position - 1]

const focusedOn = (position: number) => expect(document.activeElement).toBe(option(position))

const overflow = (element: Element) => {
  const box = element.getBoundingClientRect()
  const area = group().getBoundingClientRect()
  const left = area.left + group().clientLeft
  const top = area.top + group().clientTop

  return Math.max(left - box.left, box.right - (left + group().clientWidth), top - box.top, box.bottom - (top + group().clientHeight), 0)
}

const openNarrow = async (dir: 'ltr' | 'rtl' = 'ltr') => {
  renderInBrowser(
    <div dir={dir} style={{ inlineSize: 220 }}>
      <SegmentedControl ariaLabel="Visão" items={options} />
    </div>
  )
  await userEvent.tab()
}

describe('the options of the SegmentedControl in a group that is narrower than they are, in a real browser', () => {
  it('has a group that hides part of its options, so the options out of sight need the scroll to be seen', async () => {
    await openNarrow()

    focusedOn(1)
    expect(group().scrollWidth).toBeGreaterThan(group().clientWidth)
    expect(group().scrollLeft).toBe(0)
  })

  it('keeps every option that the right arrow reaches inside the visible part of the group, with the scroll following it', async () => {
    await openNarrow()

    for (let position = 2; position <= 8; position += 1) {
      await userEvent.keyboard('{ArrowRight}')

      focusedOn(position)
      expect(overflow(option(position)), `option ${position}`).toBeLessThanOrEqual(1)
    }

    expect(group().scrollLeft).toBeGreaterThan(0)
    expect(window.scrollX).toBe(0)
  })

  it('keeps every option that the left arrow reaches inside the visible part of the group when it was scrolled to its end', async () => {
    await openNarrow()
    await userEvent.keyboard('{End}')

    focusedOn(8)

    for (let position = 7; position >= 1; position -= 1) {
      await userEvent.keyboard('{ArrowLeft}')

      focusedOn(position)
      expect(overflow(option(position)), `option ${position}`).toBeLessThanOrEqual(1)
    }

    expect(window.scrollX).toBe(0)
  })

  it('keeps every option that the arrow reaches inside the visible part of the group when the text runs from right to left', async () => {
    await openNarrow('rtl')

    for (let position = 2; position <= 8; position += 1) {
      await userEvent.keyboard('{ArrowLeft}')

      focusedOn(position)
      expect(overflow(option(position)), `option ${position}`).toBeLessThanOrEqual(1)
    }
  })
})
