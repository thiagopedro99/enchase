import { describe, expect, it, vi } from 'vitest'

import { mergeRefs } from '@utils/mergeRefs.ts'

describe('mergeRefs', () => {
  it('sets every object ref and calls every callback ref with the node', () => {
    const first = { current: null as HTMLDivElement | null }
    const second = vi.fn()
    const node = document.createElement('div')

    mergeRefs(first, second)(node)

    expect(first.current).toBe(node)
    expect(second).toHaveBeenCalledWith(node)
  })

  it('clears the object refs and calls the callbacks with null when it detaches', () => {
    const first = { current: null as HTMLDivElement | null }
    const second = vi.fn()
    const node = document.createElement('div')
    const detach = mergeRefs(first, second)(node) as () => void

    detach()

    expect(first.current).toBeNull()
    expect(second).toHaveBeenLastCalledWith(null)
  })

  it('runs the cleanup a callback ref returns instead of calling it with null', () => {
    const cleanup = vi.fn()
    const callback = vi.fn(() => cleanup)
    const detach = mergeRefs(callback)(document.createElement('div')) as () => void

    detach()

    expect(callback).toHaveBeenCalledTimes(1)
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('skips refs that are missing', () => {
    const only = { current: null as HTMLDivElement | null }
    const node = document.createElement('div')
    const detach = mergeRefs(undefined, only, null as never)(node) as () => void

    expect(only.current).toBe(node)

    detach()

    expect(only.current).toBeNull()
  })
})
