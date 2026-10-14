import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { renderInBrowser } from './harness.tsx'

const items = (container: HTMLElement) => [...container.querySelectorAll<HTMLElement>('[data-slot="icon-swap-item"]')]

const visible = (container: HTMLElement) => items(container).filter((item) => getComputedStyle(item).opacity === '1')

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('icon crossfade in a real browser', () => {
  it('shows exactly one icon at rest and stacks both in the same cell', () => {
    const { container } = renderInBrowser(<ThemeToggle />, 'auto')
    const [first, second] = items(container)

    expect(visible(container)).toHaveLength(1)
    const center = (element: HTMLElement) => {
      const box = element.getBoundingClientRect()

      return [box.left + box.width / 2, box.top + box.height / 2]
    }

    expect(center(first)[0]).toBeCloseTo(center(second)[0], 0)
    expect(center(first)[1]).toBeCloseTo(center(second)[1], 0)
  })

  it('finishes the swap within 200 ms and never shows the old icon at rest afterwards', async () => {
    const { container } = renderInBrowser(<ThemeToggle />, 'auto')
    const before = visible(container)[0].querySelector('[data-icon]')?.getAttribute('data-icon')

    await userEvent.click(page.getByRole('button'))
    await sleep(220)

    expect(visible(container)).toHaveLength(1)
    expect(visible(container)[0].querySelector('[data-icon]')?.getAttribute('data-icon')).not.toBe(before)
  })

  it('uses a transition no longer than 150 ms', () => {
    const { container } = renderInBrowser(<ThemeToggle />, 'auto')
    const durations = getComputedStyle(items(container)[0]).transitionDuration.split(',').map((value) => parseFloat(value) * 1000)

    expect(Math.max(...durations)).toBeLessThanOrEqual(150)
  })
})
