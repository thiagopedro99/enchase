import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useCurrentHref } from '@hooks/useCurrentHref.ts'
import { useNavigator } from '@hooks/useNavigator.ts'
import { useUIConfig } from '@hooks/useUIConfig.ts'
import UIProvider from '@components/uiProvider/index.tsx'

const renders = { navigator: 0, currentHref: 0, config: 0 }

const NavigatorProbe = () => {
  const navigate = useNavigator()

  renders.navigator += 1

  return <button onClick={() => navigate?.('/probe')}>go</button>
}

const CurrentHrefProbe = () => {
  const currentHref = useCurrentHref()

  renders.currentHref += 1

  return <output data-testid="current">{currentHref ?? 'none'}</output>
}

const ConfigProbe = () => {
  const { labels } = useUIConfig()

  renders.config += 1

  return <output data-testid="label">{labels.closeModal}</output>
}

const probes = (
  <>
    <NavigatorProbe />
    <CurrentHrefProbe />
    <ConfigProbe />
  </>
)

const reset = () => {
  renders.navigator = 0
  renders.currentHref = 0
  renders.config = 0
}

describe('UIProvider navigation', () => {
  it('has no navigate and no current location by default', () => {
    reset()
    render(<UIProvider>{probes}</UIProvider>)

    expect(screen.getByTestId('current')).toHaveTextContent('none')
  })

  it('hands the navigate and the current location to the components', () => {
    reset()
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate} currentHref="/docs">
        {probes}
      </UIProvider>
    )

    screen.getByRole('button', { name: 'go' }).click()

    expect(navigate).toHaveBeenCalledWith('/probe')
    expect(screen.getByTestId('current')).toHaveTextContent('/docs')
  })

  it('keeps a stable navigate even when the function it receives changes identity', () => {
    reset()
    const first = vi.fn()
    const second = vi.fn()
    const view = render(<UIProvider navigate={first}>{probes}</UIProvider>)
    const initial = { ...renders }

    view.rerender(<UIProvider navigate={second}>{probes}</UIProvider>)
    screen.getByRole('button', { name: 'go' }).click()

    expect(renders.navigator).toBe(initial.navigator)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith('/probe')
  })

  it('re-renders only who reads the current location when the route changes', () => {
    reset()
    const navigate = vi.fn()
    const view = render(
      <UIProvider navigate={navigate} currentHref="/docs">
        {probes}
      </UIProvider>
    )
    const initial = { ...renders }

    view.rerender(
      <UIProvider navigate={navigate} currentHref="/docs/intro">
        {probes}
      </UIProvider>
    )

    expect(screen.getByTestId('current')).toHaveTextContent('/docs/intro')
    expect(renders.currentHref).toBe(initial.currentHref + 1)
    expect(renders.navigator).toBe(initial.navigator)
    expect(renders.config).toBe(initial.config)
  })

  it('keeps the labels and the motion settings working', () => {
    reset()
    render(<UIProvider labels={{ closeModal: 'Close dialog' }}>{probes}</UIProvider>)

    expect(screen.getByTestId('label')).toHaveTextContent('Close dialog')
  })
})
