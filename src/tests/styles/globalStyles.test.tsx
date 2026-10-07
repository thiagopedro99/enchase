import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it } from 'vitest'

import { darkTheme, lightTheme } from '@styles/themes/index.ts'
import GlobalStyles from '@styles/globalStyles.ts'

describe.each([
  ['light', lightTheme],
  ['dark', darkTheme]
])('global styles in the %s theme', (_, theme) => {
  it('underlines inline links so they do not rely on color alone (WCAG 1.4.1)', () => {
    render(
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <p>
          Read the <a href="/docs">documentation</a> first.
        </p>
      </ThemeProvider>
    )

    expect(getComputedStyle(screen.getByRole('link', { name: 'documentation' })).textDecoration).toContain('underline')
  })
})
