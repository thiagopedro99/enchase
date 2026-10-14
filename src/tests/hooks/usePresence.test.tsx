import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, renderHook } from '@testing-library/react'

import { usePresence } from '@hooks/usePresence.ts'

const Panel = ({ open, exitMs }: { open: boolean; exitMs?: number }) => {
  const { mounted, state, ref } = usePresence<HTMLDivElement>(open, { exitMs })

  return mounted ? (
    <div ref={ref} data-state={state} data-testid="panel">
      <span data-testid="child">content</span>
    </div>
  ) : null
}

const frames = () => act(() => vi.advanceTimersByTime(40))

describe('usePresence', () => {
  beforeEach(() => vi.useFakeTimers())

  afterEach(() => vi.useRealTimers())

  it('starts open and mounted when it renders open, and closed and unmounted otherwise', () => {
    expect(renderHook(() => usePresence(true)).result.current).toMatchObject({ mounted: true, state: 'open' })
    expect(renderHook(() => usePresence(false)).result.current).toMatchObject({ mounted: false, state: 'closed' })
  })

  it('mounts as entering and settles to open after two frames', () => {
    const { rerender, getByTestId } = render(<Panel open={false} />)

    rerender(<Panel open />)
    expect(getByTestId('panel')).toHaveAttribute('data-state', 'entering')

    frames()
    expect(getByTestId('panel')).toHaveAttribute('data-state', 'open')
  })

  it('stays mounted while exiting and unmounts when the panel transition ends', () => {
    const { rerender, getByTestId, queryByTestId } = render(<Panel open />)

    rerender(<Panel open={false} />)
    expect(getByTestId('panel')).toHaveAttribute('data-state', 'exiting')

    fireEvent.transitionEnd(getByTestId('panel'))
    expect(queryByTestId('panel')).not.toBeInTheDocument()
  })

  it('unmounts on animationend too', () => {
    const { rerender, getByTestId, queryByTestId } = render(<Panel open />)

    rerender(<Panel open={false} />)
    fireEvent.animationEnd(getByTestId('panel'))

    expect(queryByTestId('panel')).not.toBeInTheDocument()
  })

  it('ignores transitions that bubble up from a child', () => {
    const { rerender, getByTestId } = render(<Panel open />)

    rerender(<Panel open={false} />)
    fireEvent.transitionEnd(getByTestId('child'))

    expect(getByTestId('panel')).toHaveAttribute('data-state', 'exiting')
  })

  it('unmounts after the safety timeout when no transition event arrives', () => {
    const { rerender, queryByTestId } = render(<Panel open exitMs={200} />)

    rerender(<Panel open={false} exitMs={200} />)
    act(() => vi.advanceTimersByTime(199))
    expect(queryByTestId('panel')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(2))
    expect(queryByTestId('panel')).not.toBeInTheDocument()
  })

  it('can be interrupted: reopening while exiting keeps it mounted and never closes it', () => {
    const { rerender, getByTestId } = render(<Panel open exitMs={200} />)

    rerender(<Panel open={false} exitMs={200} />)
    act(() => vi.advanceTimersByTime(100))
    rerender(<Panel open exitMs={200} />)
    expect(getByTestId('panel')).toHaveAttribute('data-state', 'entering')

    act(() => vi.advanceTimersByTime(500))
    expect(getByTestId('panel')).toHaveAttribute('data-state', 'open')
  })

  it('goes straight to exiting when closed while still entering', () => {
    const { rerender, getByTestId, queryByTestId } = render(<Panel open={false} />)

    rerender(<Panel open />)
    rerender(<Panel open={false} />)
    expect(getByTestId('panel')).toHaveAttribute('data-state', 'exiting')

    fireEvent.transitionEnd(getByTestId('panel'))
    expect(queryByTestId('panel')).not.toBeInTheDocument()
  })
})
