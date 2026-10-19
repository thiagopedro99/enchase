import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'

import { placeIndicator, useTabIndicator } from '@hooks/useTabIndicator.ts'

type ObserverRecord = {
  callback: () => void
  observed: Element[]
  disconnected: boolean
}

const observers: ObserverRecord[] = []

class FakeResizeObserver {
  private record: ObserverRecord

  constructor(callback: () => void) {
    this.record = { callback, observed: [], disconnected: false }
    observers.push(this.record)
  }

  observe(element: Element) {
    this.record.observed.push(element)
  }

  disconnect() {
    this.record.disconnected = true
  }
}

const defaults = {
  widths: { a: 80, b: 120, indicator: 1 } as Record<string, number>,
  offsets: { a: 0, b: 80, indicator: 0 } as Record<string, number>
}

const layout = { widths: defaults.widths, offsets: defaults.offsets }

const nameOf = (element: HTMLElement) => element.dataset.name ?? element.textContent ?? ''

const Harness = ({ active, layoutKey = 'a|b' }: { active: string | undefined; layoutKey?: string }) => {
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const box = useTabIndicator(listRef, indicatorRef, active, layoutKey)

  return (
    <div ref={listRef} data-testid="list">
      <button role="tab" aria-selected={active === 'a'}>
        a
      </button>
      <button role="tab" aria-selected={active === 'b'}>
        b
      </button>
      <span ref={indicatorRef} data-name="indicator" />
      <output data-testid="box">{JSON.stringify(box)}</output>
    </div>
  )
}

const box = () => JSON.parse(screen.getByTestId('box').textContent as string) as { x: number; width: number; visible: boolean; animate: boolean }

describe('placeIndicator', () => {
  it('moves from the start of the indicator to the start of the tab and stretches it to the tab width', () => {
    expect(placeIndicator(0, 1, 80, 120)).toEqual({ x: 80, width: 120 })
  })

  it('goes back to the left when the indicator is anchored at the right edge, as in right-to-left text', () => {
    expect(placeIndicator(499, 1, 80, 120)).toEqual({ x: -419, width: 120 })
    expect(placeIndicator(499, 1, 380, 120)).toEqual({ x: -119, width: 120 })
  })

  it('keeps the offset of a tab scrolled past the edge of the list', () => {
    expect(placeIndicator(0, 1, 700, 90)).toEqual({ x: 700, width: 90 })
    expect(placeIndicator(299, 1, -400, 90)).toEqual({ x: -699, width: 90 })
  })

  it('scales by the width of the indicator and survives an indicator without width', () => {
    expect(placeIndicator(0, 2, 80, 120)).toEqual({ x: 80, width: 60 })
    expect(placeIndicator(0, 0, 80, 120)).toEqual({ x: 80, width: 120 })
  })
})

describe('useTabIndicator', () => {
  beforeEach(() => {
    observers.length = 0
    layout.widths = { ...defaults.widths }
    layout.offsets = { ...defaults.offsets }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return layout.widths[nameOf(this)] ?? 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetLeft', 'get').mockImplementation(function (this: HTMLElement) {
      return layout.offsets[nameOf(this)] ?? 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('places the indicator under the selected tab at once, without animating', () => {
    render(<Harness active="b" />)

    expect(box()).toEqual({ x: 80, width: 120, visible: true, animate: false })
  })

  it('animates when the selected tab changes', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active="b" />)

    expect(box()).toEqual({ x: 80, width: 120, visible: true, animate: true })
  })

  it('measures from where the indicator really is, so right-to-left text needs no special case', () => {
    layout.offsets.indicator = 499

    render(<Harness active="b" />)

    expect(box().x).toBe(-419)
  })

  it('measures again when the layout key changes without a new selection', () => {
    const { rerender } = render(<Harness active="b" />)

    layout.offsets.indicator = 499
    rerender(<Harness active="b" layoutKey="rtl|a|b" />)

    expect(box()).toMatchObject({ x: -419, animate: false })
  })

  it('hides the indicator when nothing is selected and shows it again later', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active={undefined} />)
    expect(box().visible).toBe(false)

    rerender(<Harness active="b" />)
    expect(box()).toMatchObject({ visible: true, animate: false })
  })

  it('follows a resize of the list or of a tab without animating', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active="b" />)
    layout.widths = { ...layout.widths, a: 100, b: 140 }
    layout.offsets = { ...layout.offsets, b: 100 }
    act(() => observers.at(-1)?.callback())

    expect(box()).toEqual({ x: 100, width: 140, visible: true, animate: false })
  })

  it('observes the list and every tab and stops when it unmounts', () => {
    const { unmount } = render(<Harness active="a" />)
    const record = observers.at(-1) as ObserverRecord

    expect(record.observed).toHaveLength(3)
    expect(record.observed[0]).toBe(screen.getByTestId('list'))

    unmount()

    expect(record.disconnected).toBe(true)
  })

  it('works where ResizeObserver does not exist', () => {
    vi.stubGlobal('ResizeObserver', undefined)

    render(<Harness active="b" />)

    expect(box()).toMatchObject({ x: 80, visible: true })
  })
})
