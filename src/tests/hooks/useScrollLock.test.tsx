import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useScrollLock } from '@hooks/useScrollLock.ts'

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = 'auto'
  })

  it('locks while mounted and restores the previous value on unmount', () => {
    const { unmount } = renderHook(() => useScrollLock())

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('auto')
  })

  it('stays locked until the last of several locks is released', () => {
    const first = renderHook(() => useScrollLock())
    const second = renderHook(() => useScrollLock())

    first.unmount()
    expect(document.body.style.overflow).toBe('hidden')

    second.unmount()
    expect(document.body.style.overflow).toBe('auto')
  })

  it('does nothing while inactive', () => {
    renderHook(() => useScrollLock(false))

    expect(document.body.style.overflow).toBe('auto')
  })
})
