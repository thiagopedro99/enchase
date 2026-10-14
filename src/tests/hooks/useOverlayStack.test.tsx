import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

import { useOverlayStack } from '@hooks/useOverlayStack.ts'

describe('useOverlayStack', () => {
  it('reports only the last active overlay as the top one', () => {
    const first = renderHook(() => useOverlayStack(true))
    const second = renderHook(() => useOverlayStack(true))

    expect(first.result.current()).toBe(false)
    expect(second.result.current()).toBe(true)

    second.unmount()

    expect(first.result.current()).toBe(true)

    first.unmount()
  })

  it('ignores an overlay that is not active', () => {
    const base = renderHook(() => useOverlayStack(true))
    const idle = renderHook(() => useOverlayStack(false))

    expect(base.result.current()).toBe(true)
    expect(idle.result.current()).toBe(false)

    base.unmount()
    idle.unmount()
  })

  it('takes the overlay off the stack as soon as it turns inactive', () => {
    const base = renderHook(() => useOverlayStack(true))
    const toggled = renderHook(({ active }) => useOverlayStack(active), { initialProps: { active: true } })

    expect(base.result.current()).toBe(false)

    toggled.rerender({ active: false })

    expect(base.result.current()).toBe(true)

    base.unmount()
    toggled.unmount()
  })
})
