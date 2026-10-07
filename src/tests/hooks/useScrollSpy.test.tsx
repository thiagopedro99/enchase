import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useScrollSpy } from '@hooks/useScrollSpy.ts'

import type { ObserverCallback, ObserverRecord } from './types.ts'

const observers: ObserverRecord[] = []

class FakeIntersectionObserver {
  private record: ObserverRecord

  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    this.record = { callback, observed: [], disconnected: false, options }
    observers.push(this.record)
  }

  observe(element: Element) {
    this.record.observed.push(element)
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

  it('starts on the first id and observes every existing section', () => {
    const ids = ['one', 'two', 'three']
    const { result } = renderHook(() => useScrollSpy(ids))

    expect(result.current).toBe('one')
    expect(observers[0].observed.map((element) => element.id)).toEqual(ids)
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

    expect(result.current).toBe('one')
    expect(observers).toHaveLength(0)
  })
})
