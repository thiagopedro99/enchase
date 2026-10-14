import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useControllableState } from '@hooks/useControllableState.ts'

describe('useControllableState', () => {
  it('keeps its own state when uncontrolled and reports changes', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<boolean>(undefined, false, onChange))

    act(() => result.current[1](true))

    expect(result.current[0]).toBe(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('follows the given value when controlled and only reports the request', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<boolean>(false, false, onChange))

    act(() => result.current[1](true))

    expect(result.current[0]).toBe(false)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('accepts an updater and ignores a change to the same value', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControllableState<number>(undefined, 1, onChange))

    act(() => result.current[1]((previous) => previous + 1))
    act(() => result.current[1](2))

    expect(result.current[0]).toBe(2)
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
