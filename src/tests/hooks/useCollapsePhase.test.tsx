import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook } from '@testing-library/react'

import { useCollapsePhase } from '@hooks/useCollapsePhase.ts'

const Probe = ({ collapsed }: { collapsed: boolean }) => {
  const { phase, ref, compact } = useCollapsePhase<HTMLDivElement>(collapsed)

  return <div ref={ref} data-testid="probe" data-state={phase} data-compact={compact ? '' : undefined} />
}

describe('useCollapsePhase', () => {
  afterEach(() => vi.restoreAllMocks())

  it('starts settled in the phase that matches the prop', () => {
    expect(renderHook(() => useCollapsePhase(true)).result.current).toMatchObject({ phase: 'collapsed', compact: true })
    expect(renderHook(() => useCollapsePhase(false)).result.current).toMatchObject({ phase: 'expanded', compact: false })
  })

  it('settles at once when the element has no transition', () => {
    const { rerender, getByTestId } = render(<Probe collapsed={false} />)

    rerender(<Probe collapsed />)

    expect(getByTestId('probe')).toHaveAttribute('data-state', 'collapsed')
  })

  describe('with a real transition', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.spyOn(window, 'getComputedStyle').mockReturnValue({ transitionDuration: '250ms', transitionDelay: '0s', animationName: 'none', animationDuration: '0s', animationDelay: '0s' } as unknown as CSSStyleDeclaration)
    })

    afterEach(() => vi.useRealTimers())

    it('goes through collapsing and ends on the inline-size transition end', () => {
      const { rerender, getByTestId } = render(<Probe collapsed={false} />)

      rerender(<Probe collapsed />)
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'collapsing')
      expect(getByTestId('probe')).not.toHaveAttribute('data-compact')

      fireEvent.transitionEnd(getByTestId('probe'), { propertyName: 'opacity' })
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'collapsing')

      fireEvent.transitionEnd(getByTestId('probe'), { propertyName: 'inline-size' })
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'collapsed')
      expect(getByTestId('probe')).toHaveAttribute('data-compact')
    })

    it('falls back to a timer when the transition end never arrives', () => {
      const { rerender, getByTestId } = render(<Probe collapsed />)

      rerender(<Probe collapsed={false} />)
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'expanding')

      act(() => vi.advanceTimersByTime(320))
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'expanded')
    })

    it('retargets when the prop flips in the middle of the movement', () => {
      const { rerender, getByTestId } = render(<Probe collapsed={false} />)

      rerender(<Probe collapsed />)
      rerender(<Probe collapsed={false} />)
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'expanding')

      act(() => vi.advanceTimersByTime(320))
      expect(getByTestId('probe')).toHaveAttribute('data-state', 'expanded')
    })
  })
})
