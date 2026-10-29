import { describe, expect, it } from 'vitest'

import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

describe('global styles next to the components in a real browser', () => {
  it('keeps the component padding even though the global reset zeroes it', () => {
    const { getByRole } = renderInBrowser(
      <>
        <Button size="lg">Salvar</Button>
        <ButtonLink href="/x" size="lg">
          Abrir
        </ButtonLink>
      </>
    )

    expect(getComputedStyle(getByRole('button')).paddingInlineStart).not.toBe('0px')
    expect(getComputedStyle(getByRole('link')).paddingInlineStart).not.toBe('0px')
  })

  it('puts the global reset in a layer so unlayered styles always win', () => {
    renderInBrowser(<span data-testid="probe">x</span>)
    const sheets = [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules])

    expect(sheets.some((rule) => rule instanceof CSSLayerBlockRule && rule.name === 'enchase-base')).toBe(true)
  })

  it('jumps at once instead of scrolling smoothly', () => {
    renderInBrowser(<span>x</span>)

    expect(getComputedStyle(document.documentElement).scrollBehavior).toBe('auto')
  })
})
