import { describe, expect, it } from 'vitest'

import * as main from 'enchase'
import * as locales from 'enchase/locales'
import * as theme from 'enchase/theme'

describe('public entries', () => {
  it('exports the components, providers and hooks from enchase', () => {
    for (const name of ['Button', 'Textarea', 'Badge', 'Alert', 'Switch', 'RadioGroup', 'Modal', 'Popover', 'Sidebar', 'Layout', 'Navbar', 'Footer', 'Icon', 'Link', 'UIProvider', 'ColorModeProvider', 'ToastProvider', 'GlobalStyles', 'useToast', 'useColorMode', 'useScrollSpy', 'useUIConfig']) {
      expect(main, name).toHaveProperty(name)
    }
  })

  it('keeps the example icons and the internals out of enchase', () => {
    expect(main).not.toHaveProperty('HomeIcon')
    expect(main).not.toHaveProperty('useControllableState')
    expect(main).not.toHaveProperty('createTheme')
  })

  it('exports the theme tools from enchase/theme', () => {
    expect(theme).toHaveProperty('createTheme')
    expect(theme).toHaveProperty('validateTheme')
  })

  it('keeps the brand palette internals out of enchase/theme', () => {
    expect(theme).not.toHaveProperty('brandPalette')
    expect(theme).not.toHaveProperty('oklchToHex')
    expect(theme).not.toHaveProperty('rgbToOklch')
    expect(theme).not.toHaveProperty('parseColor')
  })

  it('exports the locale data from enchase/locales', () => {
    expect(locales.en.locale).toBe('en')
    expect(locales.ptBR.locale).toBe('pt-BR')
  })
})
