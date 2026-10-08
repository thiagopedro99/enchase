import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import GlobalStyles from '@styles/globalStyles.tsx'

describe('global styles', () => {
  it('underlines inline links so they do not rely on color alone (WCAG 1.4.1)', () => {
    render(
      <>
        <GlobalStyles />
        <p>
          Read the <a href="/docs">documentation</a> first.
        </p>
      </>
    )

    expect(getComputedStyle(screen.getByRole('link', { name: 'documentation' })).textDecoration).toContain('underline')
  })
})
