import { describe, expect, it } from 'vitest'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { onRoot, part, style } from './hookProbes.ts'

describe('Checkbox in a real browser', () => {
  it('breaks a label that has no room to wrap instead of overflowing the container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 140 }}>
        <Checkbox label={word} />
      </div>
    )
    const container = part('checkbox').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('checkbox').getBoundingClientRect().width).toBeLessThanOrEqual(140)
  })

  it('paints the border of an unchecked box with the error color when it is invalid, and not when it is checked', () => {
    renderInBrowser(
      <>
        <Checkbox label="Valid" />
        <Checkbox label="Invalid" aria-invalid="true" />
        <Checkbox label="Invalid and checked" aria-invalid="true" defaultChecked />
      </>
    )
    const error = getComputedStyle(document.documentElement).getPropertyValue('--enchase-color-error').trim()
    const probe = document.createElement('span')

    probe.style.color = error
    document.body.append(probe)

    const expected = getComputedStyle(probe).color

    probe.remove()

    expect(style('checkbox-box', 1).borderTopColor).toBe(expected)
    expect(style('checkbox-box', 0).borderTopColor).not.toBe(expected)
    expect(style('checkbox-box', 2).borderTopColor).not.toBe(expected)
  })

  it('takes the border of an unchecked invalid box from its hook', () => {
    onRoot({ '--enchase-checkbox-box-border-color-invalid': 'rgb(1, 2, 3)' })
    renderInBrowser(<Checkbox label="Invalid" aria-invalid="true" />)

    expect(style('checkbox-box').borderTopColor).toBe('rgb(1, 2, 3)')
  })
})
