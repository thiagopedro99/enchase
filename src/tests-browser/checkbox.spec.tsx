import { describe, expect, it } from 'vitest'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { part } from './hookProbes.ts'

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
})
