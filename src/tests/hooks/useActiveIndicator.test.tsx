import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'

import { useActiveIndicator } from '@hooks/useActiveIndicator.ts'

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

const names = ['a', 'b', 'c']

const defaults = {
  tops: { a: 0, b: 52, c: 104 } as Record<string, number>,
  heights: { a: 52, b: 52, c: 52 } as Record<string, number>
}

const layout = { tops: defaults.tops, heights: defaults.heights }

const nameOf = (element: HTMLElement) => element.dataset.name ?? ''

const Harness = ({ active, compact = false, items = 'abc' }: { active: string | undefined; compact?: boolean; items?: string }) => {
  const containerRef = useRef<HTMLElement>(null)
  const box = useActiveIndicator(containerRef, active, compact, items)

  return (
    <nav ref={containerRef} data-testid="nav">
      {names.map((name) => (
        <a key={name} href={`#${name}`} data-name={name} aria-current={active === name ? 'page' : undefined}>
          {name}
        </a>
      ))}
      <output data-testid="box">{JSON.stringify(box)}</output>
    </nav>
  )
}

const box = () => JSON.parse(screen.getByTestId('box').textContent as string) as { top: number; height: number; visible: boolean; animate: boolean }

describe('useActiveIndicator', () => {
  beforeEach(() => {
    observers.length = 0
    layout.tops = { ...defaults.tops }
    layout.heights = { ...defaults.heights }
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
      return layout.tops[nameOf(this)] ?? 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return layout.heights[nameOf(this)] ?? 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function (this: HTMLElement) {
      return this.closest('nav')
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('places the indicator over the current item at once, without animating', () => {
    render(<Harness active="b" />)

    expect(box()).toEqual({ top: 52, height: 52, visible: true, animate: false })
  })

  it('animates when the current item changes', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active="b" />)

    expect(box()).toEqual({ top: 52, height: 52, visible: true, animate: true })
  })

  it('measures again when the items change without a new current item', () => {
    const { rerender } = render(<Harness active="b" />)

    layout.tops = { ...layout.tops, b: 80 }
    rerender(<Harness active="b" items="abcd" />)

    expect(box()).toEqual({ top: 80, height: 52, visible: true, animate: false })
  })

  it('hides the indicator when nothing is current and shows it again later', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active={undefined} />)
    expect(box().visible).toBe(false)

    rerender(<Harness active="b" />)
    expect(box()).toMatchObject({ visible: true, animate: false })
  })

  it('follows a resize of the current item, such as every item getting shorter, without animating', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active="b" />)
    layout.tops = { a: 0, b: 40, c: 80 }
    layout.heights = { a: 40, b: 40, c: 40 }
    act(() => observers.at(-1)?.callback())

    expect(box()).toEqual({ top: 40, height: 40, visible: true, animate: false })
  })

  it('follows a resize of the container that moves the current item', () => {
    render(<Harness active="b" />)

    layout.tops = { ...layout.tops, b: 64 }
    act(() => observers.at(-1)?.callback())

    expect(box()).toEqual({ top: 64, height: 52, visible: true, animate: false })
  })

  it('keeps animating when the observer reports a size that did not move the indicator', () => {
    const { rerender } = render(<Harness active="a" />)

    rerender(<Harness active="b" />)
    act(() => observers.at(-1)?.callback())

    expect(box()).toEqual({ top: 52, height: 52, visible: true, animate: true })
  })

  it('observes the container and the current item and stops when it unmounts', () => {
    const { unmount } = render(<Harness active="b" />)
    const record = observers.at(-1) as ObserverRecord

    expect(record.observed).toEqual([screen.getByTestId('nav'), screen.getByRole('link', { name: 'b' })])

    unmount()

    expect(record.disconnected).toBe(true)
  })

  it('lets go of the old item and watches the new one when the current item changes', () => {
    const { rerender } = render(<Harness active="a" />)
    const first = observers.at(-1) as ObserverRecord

    rerender(<Harness active="c" />)
    const second = observers.at(-1) as ObserverRecord

    expect(first.disconnected).toBe(true)
    expect(second.disconnected).toBe(false)
    expect(second.observed).toEqual([screen.getByTestId('nav'), screen.getByRole('link', { name: 'c' })])
  })

  it('watches nothing while no item is current', () => {
    const { rerender } = render(<Harness active="a" />)
    const record = observers.at(-1) as ObserverRecord

    rerender(<Harness active={undefined} />)

    expect(record.disconnected).toBe(true)
    expect(observers.at(-1)).toBe(record)
  })

  it('works where ResizeObserver does not exist', () => {
    vi.stubGlobal('ResizeObserver', undefined)

    render(<Harness active="b" />)

    expect(box()).toMatchObject({ top: 52, visible: true })
  })
})
