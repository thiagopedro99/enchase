import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useScrollSpy } from '@hooks/useScrollSpy.ts'

import type { ObserverCallback, ObserverRecord } from './types.ts'

const observers: ObserverRecord[] = []

class FakeIntersectionObserver {
  private record: ObserverRecord

  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, observed: [], unobserved: [], disconnected: false, options }
    observers.push(this.record)
  }

  observe(element: Element) {
    this.record.observed.push(element)
  }

  unobserve(element: Element) {
    this.record.observed = this.record.observed.filter((observed) => observed !== element)
    this.record.unobserved.push(element)
  }

  disconnect() {
    this.record.disconnected = true
  }
}

const addSection = (id: string) => {
  const element = document.createElement('section')
  element.id = id
  document.body.appendChild(element)

  return element
}

const flush = () =>
  act(async () => {
    await Promise.resolve()
  })

const report = (sections: Record<string, boolean>) =>
  act(() => {
    observers[0].callback(Object.entries(sections).map(([id, isIntersecting]) => ({ target: document.getElementById(id) as Element, isIntersecting })))
  })

describe('useScrollSpy', () => {
  beforeEach(() => {
    observers.length = 0
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    ;['one', 'two', 'three'].forEach(addSection)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('starts without an active section and observes every existing section', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    expect(result.current).toBeUndefined()
    expect(observers[0].observed.map((element) => element.id)).toEqual(ids)
  })

  it('stays without an active section while nothing reached the band and the first section is still below it', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    vi.spyOn(document.getElementById('one') as HTMLElement, 'getBoundingClientRect').mockReturnValue({ top: 640 } as DOMRect)
    report({ one: false, two: false, three: false })

    expect(result.current).toBeUndefined()
  })

  it('clears the active section when the page goes back above the first section', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    report({ one: true })

    expect(result.current).toBe('one')

    vi.spyOn(document.getElementById('one') as HTMLElement, 'getBoundingClientRect').mockReturnValue({ top: 400 } as DOMRect)
    report({ one: false })

    expect(result.current).toBeUndefined()
  })

  it('activates the section that enters the viewport band', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    report({ two: true })

    expect(result.current).toBe('two')
  })

  it('prefers the topmost visible section in document order', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    report({ three: true, two: true })

    expect(result.current).toBe('two')
  })

  it('keeps the last active section when nothing is visible', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    report({ two: true })
    report({ two: false })

    expect(result.current).toBe('two')
  })

  it('keeps the last active section when the page went past the last one', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    report({ three: true })
    vi.spyOn(document.getElementById('one') as HTMLElement, 'getBoundingClientRect').mockReturnValue({ top: -2400 } as DOMRect)
    report({ three: false })

    expect(result.current).toBe('three')
  })

  it('applies the top offset to the observation band', () => {
    const ids = ['one', 'two', 'three']
    renderHook(() => useScrollSpy(ids, 120))

    expect(observers[0].options?.rootMargin).toBe('-120px 0px -55% 0px')
  })

  it('disconnects on unmount and ignores ids that are not in the document', () => {
    const ids = ['one', 'missing']
    const { unmount } = renderHook(() => useScrollSpy(ids))

    expect(observers[0].observed.map((element) => element.id)).toEqual(['one'])

    unmount()

    expect(observers[0].disconnected).toBe(true)
  })

  it('does nothing when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const ids = ['one', 'two']
    const { result } = renderHook(() => useScrollSpy(ids))

    expect(result.current).toBeUndefined()
    expect(observers).toHaveLength(0)
  })
})

describe('useScrollSpy following the page', () => {
  beforeEach(() => {
    observers.length = 0
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    ;['one', 'two', 'three'].forEach(addSection)
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('keeps following a section that is rendered again as a new element', async () => {
    const { result } = renderHook(() => useScrollSpy(['one', 'two', 'three']))
    const old = document.getElementById('two') as HTMLElement

    old.remove()

    const replacement = addSection('two')

    await flush()

    expect(observers[0].observed).toContain(replacement)
    expect(observers[0].observed).not.toContain(old)
    expect(observers[0].unobserved).toEqual([old])

    report({ two: true })

    expect(result.current).toBe('two')
  })

  it('ignores a late report about an element that was replaced', async () => {
    const { result } = renderHook(() => useScrollSpy(['one', 'two', 'three']))
    const old = document.getElementById('two') as HTMLElement

    old.remove()
    addSection('two')
    await flush()
    act(() => observers[0].callback([{ target: old, isIntersecting: true }]))

    expect(result.current).toBeUndefined()
  })

  it('keeps the active section when only its element is replaced', async () => {
    const { result } = renderHook(() => useScrollSpy(['one', 'two', 'three']))

    report({ two: true })
    document.getElementById('two')?.remove()
    addSection('two')
    await flush()

    expect(result.current).toBe('two')
  })

  it('observes a section that is rendered after the hook mounted, in the order of the ids', async () => {
    renderHook(() => useScrollSpy(['one', 'late', 'three']))

    expect(observers[0].observed.map((element) => element.id)).toEqual(['one', 'three'])

    const late = addSection('late')

    await flush()

    expect(observers[0].observed).toContain(late)
    expect(observers[0].observed).toHaveLength(3)
  })

  it('observes an element that receives the id later', async () => {
    renderHook(() => useScrollSpy(['one', 'later']))

    const element = document.createElement('section')

    document.body.appendChild(element)
    await flush()
    expect(observers[0].observed.map((item) => item.id)).toEqual(['one'])

    element.id = 'later'
    await flush()

    expect(observers[0].observed).toContain(element)
  })

  it('clears the active section when its element leaves the page', async () => {
    const { result } = renderHook(() => useScrollSpy(['one', 'two', 'three']))

    report({ two: true })
    expect(result.current).toBe('two')

    document.getElementById('two')?.remove()
    await flush()

    expect(result.current).toBeUndefined()
  })

  it('moves to another visible section when the active one leaves the page', async () => {
    const { result } = renderHook(() => useScrollSpy(['one', 'two', 'three']))

    report({ two: true, three: true })
    expect(result.current).toBe('two')

    document.getElementById('two')?.remove()
    await flush()

    expect(result.current).toBe('three')
  })

  it('does not subscribe again for an array with the same content and another identity', () => {
    const { rerender } = renderHook(({ ids }) => useScrollSpy(ids), { initialProps: { ids: ['one', 'two'] } })

    rerender({ ids: ['one', 'two'] })
    rerender({ ids: ['one', 'two'] })

    expect(observers).toHaveLength(1)
    expect(observers[0].disconnected).toBe(false)

    rerender({ ids: ['one', 'three'] })

    expect(observers).toHaveLength(2)
    expect(observers[0].disconnected).toBe(true)
    expect(observers[1].observed.map((element) => element.id)).toEqual(['one', 'three'])
  })

  it('stops following the page after it unmounts', async () => {
    const { unmount } = renderHook(() => useScrollSpy(['one', 'late']))

    unmount()
    addSection('late')
    await flush()

    expect(observers[0].observed.map((element) => element.id)).toEqual(['one'])
  })

  it('still observes the sections that exist when MutationObserver is unavailable', () => {
    vi.stubGlobal('MutationObserver', undefined)
    renderHook(() => useScrollSpy(['one', 'two']))

    expect(observers[0].observed.map((element) => element.id)).toEqual(['one', 'two'])
  })

  it('does not run while no section has changed', async () => {
    const { result } = renderHook(() => useScrollSpy(['one', 'two', 'three']))

    report({ two: true })
    document.body.appendChild(document.createElement('div'))
    await flush()

    expect(result.current).toBe('two')
    expect(observers[0].unobserved).toEqual([])
  })
})
