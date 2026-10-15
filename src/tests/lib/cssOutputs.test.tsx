import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { defaultThemeCss } from 'enchase/theme'
import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { layerOrder, layeredStyles, themeStylesheet } from '../../../scripts/cssOutputs.mjs'

describe('css outputs of the package', () => {
  it('writes the static theme with the same css the provider injects', () => {
    render(<ColorModeProvider storage={null}>x</ColorModeProvider>)
    const injected = [...document.querySelectorAll('style')].map((style) => style.textContent).find((css) => css?.includes('--enchase-color-primary'))

    expect(themeStylesheet(defaultThemeCss).trim()).toBe(injected?.trim())
  })

  it('covers the light, dark and system dark cases', () => {
    const css = themeStylesheet(defaultThemeCss)

    expect(css).toContain(":root, [data-theme='light']")
    expect(css).toContain("[data-theme='dark']")
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain(':root:not([data-theme])')
  })

  it('wraps the component css in the enchase layer after declaring the order', () => {
    const css = layeredStyles('.a{color:red}')

    expect(css.startsWith(layerOrder)).toBe(true)
    expect(layerOrder).toBe('@layer enchase-theme, enchase-base, enchase;')
    expect(css).toContain('@layer enchase {\n.a{color:red}\n}')
  })
})
