import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockSystemColorScheme } from '@tests/colorScheme.ts'
import userEvent from '@testing-library/user-event'
import { useTheme } from 'styled-components'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { useColorMode } from '@hooks/useColorMode.ts'

import type { ColorModeProviderProps, ColorModeStorage } from '@components/colorMode/types.ts'

const createMemoryStorage = (initial: Record<string, string> = {}): ColorModeStorage & { data: Map<string, string> } => {
  const data = new Map(Object.entries(initial))

  return { data, getItem: (key) => data.get(key) ?? null, setItem: (key, value) => void data.set(key, value) }
}

const Probe = () => {
  const { mode, resolvedMode, setMode, toggleMode } = useColorMode()
  const theme = useTheme()

  return (
    <>
      <p data-testid="mode">{mode}</p>
      <p data-testid="resolved">{resolvedMode}</p>
      <p data-testid="background">{theme.colors.background}</p>
      <button onClick={toggleMode}>toggle</button>
      <button onClick={() => setMode('dark')}>dark</button>
      <button onClick={() => setMode('light')}>light</button>
      <button onClick={() => setMode('system')}>system</button>
    </>
  )
}

const renderProbe = (props: Partial<ColorModeProviderProps> = {}) =>
  render(
    <ColorModeProvider storage={createMemoryStorage()} {...props}>
      <Probe />
    </ColorModeProvider>
  )

let scheme: ReturnType<typeof mockSystemColorScheme> | undefined

const mockScheme = (initial: 'light' | 'dark') => {
  scheme = mockSystemColorScheme(initial)

  return scheme
}

afterEach(() => {
  scheme?.restore()
  scheme = undefined
})

describe('ColorModeProvider', () => {
  it('follows the system preference by default', () => {
    mockScheme('dark')
    renderProbe()

    expect(screen.getByTestId('mode')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('resolves to light when the system prefers light', () => {
    mockScheme('light')
    renderProbe()

    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('ignores the system preference when a mode is chosen explicitly', () => {
    mockScheme('dark')
    renderProbe({ defaultMode: 'light' })

    expect(screen.getByTestId('mode')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')
  })

  it('follows live changes of the system preference while in system mode', () => {
    const controller = mockScheme('light')
    renderProbe()

    act(() => controller.set('dark'))

    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('makes the choice explicit when toggling and flips the resolved mode', async () => {
    mockScheme('dark')
    const user = userEvent.setup()
    renderProbe()

    await user.click(screen.getByRole('button', { name: 'toggle' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('light')
    expect(screen.getByTestId('resolved')).toHaveTextContent('light')

    await user.click(screen.getByRole('button', { name: 'toggle' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })

  it('goes back to following the system after choosing system again', async () => {
    mockScheme('dark')
    const user = userEvent.setup()
    renderProbe({ defaultMode: 'light' })

    await user.click(screen.getByRole('button', { name: 'system' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('system')
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
  })

  it('marks the document with the resolved mode and its color scheme', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    renderProbe({ defaultMode: 'light' })

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('hands the components references to css variables that do not change with the mode', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    renderProbe({ defaultMode: 'light' })

    expect(screen.getByTestId('background')).toHaveTextContent('var(--enchase-color-background)')

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(screen.getByTestId('background')).toHaveTextContent('var(--enchase-color-background)')
  })

  it('remembers the choice in the given storage and restores it on the next mount', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    const storage = createMemoryStorage()
    const first = renderProbe({ storage })

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(storage.data.get('enchase-color-mode')).toBe('dark')

    first.unmount()
    renderProbe({ storage })

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })

  it('uses a custom storage key', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    const storage = createMemoryStorage()
    renderProbe({ storage, storageKey: 'meu-app-tema' })

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(storage.data.get('meu-app-tema')).toBe('dark')
    expect(storage.data.has('enchase-color-mode')).toBe(false)
  })

  it('ignores an invalid stored value and falls back to the default mode', () => {
    mockScheme('light')
    renderProbe({ storage: createMemoryStorage({ 'enchase-color-mode': 'banana' }) })

    expect(screen.getByTestId('mode')).toHaveTextContent('system')
  })

  it('does not touch any storage when storage is null', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    renderProbe({ storage: null })

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(setItem).not.toHaveBeenCalled()

    setItem.mockRestore()
  })

  it('keeps working when the storage throws', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    const storage: ColorModeStorage = {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      }
    }
    renderProbe({ storage })

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
  })

  it('can be controlled: the given mode wins, the change is reported and nothing is stored', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    const storage = createMemoryStorage()
    const onModeChange = vi.fn()
    renderProbe({ mode: 'dark', onModeChange, storage })

    await user.click(screen.getByRole('button', { name: 'light' }))

    expect(onModeChange).toHaveBeenCalledWith('light')
    expect(screen.getByTestId('mode')).toHaveTextContent('dark')
    expect(storage.data.size).toBe(0)
  })
})

describe('useColorMode', () => {
  it('throws a clear error outside the provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => render(<Probe />)).toThrow('useColorMode must be used within a ColorModeProvider')

    error.mockRestore()
  })
})
