import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRef } from 'react'

import { useFlip } from '@components/toast/useFlip.ts'

const tops = new Map<string, number>()
const offsets = new Map<string, number>()
const running = new WeakMap<Element, { id: string; cancel: () => void }[]>()

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

const idOf = (element: Element) => (element as HTMLElement).dataset.flipId ?? ''

const animate = vi.fn(function (this: Element, _keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  const animation = { id: options.id ?? '', cancel: vi.fn() }

  running.set(this, [...(running.get(this) ?? []), animation])

  return animation as unknown as Animation
})
const originalAnimate = Element.prototype.animate
const originalAnimations = Element.prototype.getAnimations
const originalRect = Element.prototype.getBoundingClientRect
const originalStyle = window.getComputedStyle

const runningOn = (id: string) => running.get(document.querySelector(`[data-flip-id="${id}"]`) as Element) ?? []

beforeEach(() => {
  Element.prototype.animate = animate as unknown as typeof Element.prototype.animate
  Element.prototype.getAnimations = function (this: Element) {
    return (running.get(this) ?? []) as unknown as Animation[]
  }
  Element.prototype.getBoundingClientRect = function (this: Element) {
    const top = (tops.get(idOf(this)) ?? 0) + (offsets.get(idOf(this)) ?? 0)

    return { top, bottom: top, left: 0, right: 0, width: 0, height: 0, x: 0, y: top, toJSON: () => ({}) }
  }
  window.getComputedStyle = ((element: Element) => ({
    transitionDuration: (element as HTMLElement).style.transitionDuration,
    translate: `0px ${offsets.get(idOf(element)) ?? 0}px`,
    getPropertyValue: () => ''
  })) as unknown as typeof window.getComputedStyle
})

afterEach(() => {
  tops.clear()
  offsets.clear()
  animate.mockClear()
  Element.prototype.animate = originalAnimate
  Element.prototype.getAnimations = originalAnimations
  Element.prototype.getBoundingClientRect = originalRect
  window.getComputedStyle = originalStyle
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

  it('keeps a slide that is still running when the stack renders again without moving', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    const { rerender } = render(<Stack ids={['a', 'b']} />)

    tops.set('b', 0)
    rerender(<Stack ids={['b']} />)
    offsets.set('b', 25)
    rerender(<Stack ids={['b']} />)

    expect(animate).toHaveBeenCalledTimes(1)
    expect(runningOn('b')[0]?.cancel).not.toHaveBeenCalled()
  })

  it('does not read the progress of a slide as a new movement', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    const { rerender } = render(<Stack ids={['a', 'b']} />)

    tops.set('b', 0)
    rerender(<Stack ids={['b']} />)
    offsets.set('b', 40)
    rerender(<Stack ids={['b']} />)
    offsets.set('b', 10)
    rerender(<Stack ids={['b']} />)

    expect(animate).toHaveBeenCalledTimes(1)
  })

  it('replaces the running slide when the item moves again and starts from where it is on screen', () => {
    tops.set('a', 0)
    tops.set('b', 60)
    tops.set('c', 120)
    const { rerender } = render(<Stack ids={['a', 'b', 'c']} />)

    tops.set('b', 0)
    tops.set('c', 60)
    rerender(<Stack ids={['b', 'c']} />)
    offsets.set('b', 30)
    offsets.set('c', 30)
    animate.mockClear()
    const previous = runningOn('c')[0]

    tops.set('c', 0)
    rerender(<Stack ids={['c']} />)

    expect(previous?.cancel).toHaveBeenCalledTimes(1)
    expect(animate).toHaveBeenCalledTimes(1)
    expect(animate).toHaveBeenCalledWith([{ translate: '0 90px' }, { translate: '0 0' }], expect.anything())
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
