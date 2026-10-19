import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { useRef } from 'react'

import { useOverflow } from '@hooks/useOverflow.ts'

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

const size = { scroll: 100, client: 100 }

const Harness = () => {
  const ref = useRef<HTMLDivElement>(null)
  const overflowing = useOverflow(ref)

  return (
    <div ref={ref} data-testid="box" data-overflowing={overflowing ? '' : undefined}>
      <table />
    </div>
  )
}

describe('useOverflow', () => {
  beforeEach(() => {
    observers.length = 0
    size.scroll = 100
    size.client = 100
    vi.stubGlobal('ResizeObserver', FakeResizeObserver)
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(() => size.scroll)
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => size.client)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reports no overflow when the content fits', () => {
    render(<Harness />)

    expect(screen.getByTestId('box')).not.toHaveAttribute('data-overflowing')
  })

  it('reports an overflow measured on mount', () => {
    size.scroll = 300

    render(<Harness />)

    expect(screen.getByTestId('box')).toHaveAttribute('data-overflowing')
  })

  it('ignores a difference of one pixel from rounding', () => {
    size.scroll = 101

    render(<Harness />)

    expect(screen.getByTestId('box')).not.toHaveAttribute('data-overflowing')
  })

  it('measures again when the box or its content is resized', () => {
    render(<Harness />)

    size.scroll = 400
    act(() => observers.at(-1)?.callback())
    expect(screen.getByTestId('box')).toHaveAttribute('data-overflowing')

    size.client = 400
    act(() => observers.at(-1)?.callback())
    expect(screen.getByTestId('box')).not.toHaveAttribute('data-overflowing')
  })

  it('observes the box and its children and stops when it unmounts', () => {
    const { unmount } = render(<Harness />)
    const record = observers.at(-1) as ObserverRecord

    expect(record.observed).toHaveLength(2)
    expect(record.observed[0]).toBe(screen.getByTestId('box'))

    unmount()

    expect(record.disconnected).toBe(true)
  })

  it('works where ResizeObserver does not exist', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    size.scroll = 300

    render(<Harness />)

    expect(screen.getByTestId('box')).toHaveAttribute('data-overflowing')
  })
})
