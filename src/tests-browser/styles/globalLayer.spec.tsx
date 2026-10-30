import { afterEach, describe, expect, it } from 'vitest'

import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { onRoot, part } from '../support/hookProbes.ts'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

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

const headings = (
  <>
    <h1>One</h1>
    <h2>Two</h2>
    <h3>Three</h3>
    <h4>Four</h4>
    <h5>Five</h5>
    <h6>Six</h6>
  </>
)

const weights = () => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => getComputedStyle(document.querySelector(tag) as Element).fontWeight)

describe('the weight of the headings of the global styles from the hook', () => {
  it('keeps every heading at the medium weight of the theme when no hook is set', () => {
    renderInBrowser(headings)

    expect(weights()).toEqual(['500', '500', '500', '500', '500', '500'])
  })

  it('follows the medium weight of the theme in the headings when no hook is set', () => {
    onRoot({ '--enchase-font-weight-medium': '450' })
    renderInBrowser(headings)

    expect(weights()).toEqual(['450', '450', '450', '450', '450', '450'])
  })

  it('takes the weight of every heading from its hook', () => {
    onRoot({ '--enchase-heading-font-weight': '700' })
    renderInBrowser(headings)

    expect(weights()).toEqual(['700', '700', '700', '700', '700', '700'])
  })

  it('lets the hook win over the medium weight of the theme', () => {
    onRoot({ '--enchase-heading-font-weight': '600', '--enchase-font-weight-medium': '450' })
    renderInBrowser(headings)

    expect(weights()).toEqual(['600', '600', '600', '600', '600', '600'])
  })

  it('leaves the weight that a component sets on its own title alone', () => {
    onRoot({ '--enchase-heading-font-weight': '700' })
    renderInBrowser(
      <>
        <h2>Page</h2>
        <Modal isOpen onClose={() => undefined} title="Title">
          Body
        </Modal>
      </>
    )

    expect([getComputedStyle(document.querySelector('h2') as Element).fontWeight, getComputedStyle(part('modal-title')).fontWeight]).toEqual(['700', '500'])
  })
})
