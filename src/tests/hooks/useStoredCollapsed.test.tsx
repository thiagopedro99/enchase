import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useStoredCollapsed } from '@hooks/useStoredCollapsed.ts'

const key = 'enchase-test-collapsed'

afterEach(() => window.localStorage.clear())

describe('useStoredCollapsed', () => {
  it('restores the stored value after mounting', () => {
    window.localStorage.setItem(key, 'true')
    const setCollapsed = vi.fn()

    renderHook(() => useStoredCollapsed(key, false, setCollapsed))

    expect(setCollapsed).toHaveBeenCalledWith(true)
  })

  it('writes the value when it changes after restoring', () => {
    const setCollapsed = vi.fn()
    const { rerender } = renderHook(({ collapsed }) => useStoredCollapsed(key, collapsed, setCollapsed), { initialProps: { collapsed: false } })

    rerender({ collapsed: true })

    expect(window.localStorage.getItem(key)).toBe('true')
  })

  it('does nothing without a key and ignores unknown stored values', () => {
    window.localStorage.setItem(key, 'maybe')
    const setCollapsed = vi.fn()

    renderHook(() => useStoredCollapsed(undefined, false, setCollapsed))
    renderHook(() => useStoredCollapsed(key, false, setCollapsed))

    expect(setCollapsed).not.toHaveBeenCalled()
  })

  it('survives a storage that throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => renderHook(() => useStoredCollapsed(key, false, vi.fn()))).not.toThrow()

    spy.mockRestore()
  })
})
