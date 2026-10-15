import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'

import { useFlip } from '@components/toast/useFlip.ts'

const tops = new Map<string, number>()

const Stack = ({ ids, duration = 200, enabled = true }: { ids: string[]; duration?: number; enabled?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)

  useFlip(ref, enabled)

  return (
    <div ref={ref}>
      {ids.map((id) => (
        <div key={id} data-flip-id={id} style={{ transitionDuration: `${duration}ms` }} />
      ))}
    </div>
  )
}

const animate = vi.fn(() => ({ id: '' }) as unknown as Animation)
const originalAnimate = Element.prototype.animate
const originalRect = Element.prototype.getBoundingClientRect

beforeEach(() => {
  Element.prototype.animate = animate as unknown as typeof Element.prototype.animate
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const top = tops.get((this as HTMLElement).dataset.flipId ?? '') ?? 0

    return { top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top, toJSON: () => ({}) }
  }
})

afterEach(() => {
  tops.clear()
  animate.mockClear()
  Element.prototype.animate = originalAnimate
  Element.prototype.getBoundingClientRect = originalRect
})

describe('useFlip', () => {
  it('animates an item that moved from where it was before', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    const { rerender } = render(<Stack ids={['a', 'b']} />)

    tops.set('b', 0)
    rerender(<Stack ids={['b']} />)

    expect(animate).toHaveBeenCalledTimes(1)
    expect(animate).toHaveBeenCalledWith([{ translate: '0 60px' }, { translate: '0 0' }], expect.objectContaining({ duration: 200 }))
  })

  it('does not animate items that did not move or are new', () => {
    tops.set('a', 0)
    const { rerender } = render(<Stack ids={['a']} />)

    tops.set('c', 60)
    rerender(<Stack ids={['a', 'c']} />)

    expect(animate).not.toHaveBeenCalled()
  })

  it('takes the duration from the transition of the item itself', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    const { rerender } = render(<Stack ids={['a', 'b']} duration={300} />)

    tops.set('b', 0)
    rerender(<Stack ids={['b']} duration={300} />)

    expect(animate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 300 }))
  })

  it('does nothing when the items do not transition', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    const { rerender } = render(<Stack ids={['a', 'b']} duration={0} />)

    tops.set('b', 0)
    rerender(<Stack ids={['b']} duration={0} />)

    expect(animate).not.toHaveBeenCalled()
  })

  it('does nothing when it is disabled', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    const { rerender } = render(<Stack ids={['a', 'b']} enabled={false} />)

    tops.set('b', 0)
    rerender(<Stack ids={['b']} enabled={false} />)

    expect(animate).not.toHaveBeenCalled()
  })
})
