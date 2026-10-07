import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mockSystemColorScheme } from '@tests/colorScheme.ts'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { ServerStyleSheet, useTheme } from 'styled-components'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { useColorMode } from '@hooks/useColorMode.ts'
import { lightTheme } from '@styles/themes/index.ts'

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

describe('ColorModeProvider with a custom theme', () => {
  const stylesOf = (props: Partial<ColorModeProviderProps>) => {
    const sheet = new ServerStyleSheet()

    try {
      renderToString(
        sheet.collectStyles(
          <ColorModeProvider storage={null} {...props}>
            <Probe />
          </ColorModeProvider>
        )
      )

      return sheet.getStyleTags().replace(/\s+/g, '')
    } finally {
      sheet.seal()
    }
  }

  it('writes the colors and fonts of the given theme as css variables', () => {
    mockScheme('light')

    const styles = stylesOf({ theme: { fonts: { primary: 'Arial' }, light: { colors: { primary: '#0B6BCB' } }, dark: { colors: { primary: '#99CCFF' } } } })

    expect(styles).toContain('--enchase-color-primary:#0B6BCB')
    expect(styles).toContain('--enchase-color-primary:#99CCFF')
    expect(styles).toContain('--enchase-font-primary:Arial')
  })

  it('keeps handing the components references that do not change with the theme', () => {
    mockScheme('light')
    renderProbe({ theme: { light: { colors: { background: '#FAFAFA' } } } })

    expect(screen.getByTestId('background')).toHaveTextContent('var(--enchase-color-background)')
  })

  it('keeps the built-in values when no theme is given', () => {
    mockScheme('light')

    expect(stylesOf({})).toContain('--enchase-color-primary:' + lightTheme.colors.primary)
  })

  it('refuses an invalid value instead of writing it as css', () => {
    mockScheme('light')
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => renderProbe({ theme: { light: { colors: { primary: 'red; display: none' } } } })).toThrow('Invalid color for "light.colors.primary"')
    expect(() => renderProbe({ theme: { fonts: { primary: 'Arial; } body { display: none' } } })).toThrow('Invalid font family for "fonts.primary"')

    error.mockRestore()
  })

  it('uses the theme it is given each time', () => {
    mockScheme('light')

    expect(stylesOf({ theme: { light: { colors: { primary: '#0B6BCB' } } } })).toContain('--enchase-color-primary:#0B6BCB')
    expect(stylesOf({ theme: { light: { colors: { primary: '#C2185B' } } } })).toContain('--enchase-color-primary:#C2185B')
  })
})

describe('ColorModeProvider contrast warning', () => {
  const warnSpy = () => vi.spyOn(console, 'warn').mockImplementation(() => undefined)

  it('warns about the pairs of a custom theme that are below the minimum contrast', () => {
    mockScheme('light')
    const warn = warnSpy()
    renderProbe({ theme: { light: { colors: { onPrimary: '#EEEEEE', primary: '#DDDDDD' } } } })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('light · onPrimary on primary')

    warn.mockRestore()
  })

  it('stays quiet for a custom theme that is fine, for the default theme and for a theme without contrast problems', () => {
    mockScheme('light')
    const warn = warnSpy()
    renderProbe()
    renderProbe({ theme: { fonts: { primary: 'Arial' } } })
    renderProbe({ theme: { light: { colors: { primary: '#3F37C9' } } } })

    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
  })

  it('warns only once for the same problem when the parent renders again with an equal theme', () => {
    mockScheme('light')
    const warn = warnSpy()
    const bad = () => ({ light: { colors: { onPrimary: '#EEEEEE', primary: '#DDDDDD' } } })
    const view = renderProbe({ theme: bad() })

    view.rerender(
      <ColorModeProvider storage={createMemoryStorage()} theme={bad()}>
        <Probe />
      </ColorModeProvider>
    )

    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
  })

  it('does not warn again when only the mode changes', async () => {
    mockScheme('light')
    const user = userEvent.setup()
    const warn = warnSpy()
    renderProbe({ theme: { light: { colors: { onPrimary: '#EEEEEE', primary: '#DDDDDD' } } } })

    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(warn).toHaveBeenCalledTimes(1)

    warn.mockRestore()
  })
})

describe('useColorMode', () => {
  it('throws a clear error outside the provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    expect(() => render(<Probe />)).toThrow('useColorMode must be used within a ColorModeProvider')

    error.mockRestore()
  })
})
