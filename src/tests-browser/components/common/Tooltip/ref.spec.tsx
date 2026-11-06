import { createRef } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { resetTooltipGroup } from '@components/common/Tooltip/defaultData.ts'
import { renderInBrowser } from '../../../support/harness.tsx'

beforeEach(resetTooltipGroup)

describe('the ref of the Tooltip in a real browser', () => {
  it('holds the bubble once it is placed above the trigger, and is null after it hides', async () => {
    const target = createRef<HTMLSpanElement>()
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip ref={target} text="Dica" position="top" openDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      </div>,
      'auto'
    )

    expect(target.current).toBeNull()

    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(() => target.current?.dataset.position).toBe('top')

    const trigger = page.getByRole('button', { name: 'Alvo' }).element().getBoundingClientRect()

    expect(target.current).toBe(document.querySelector('[data-slot="tooltip-bubble"]'))
    expect(target.current?.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.top)

    await userEvent.unhover(page.getByRole('button', { name: 'Alvo' }))

    await expect.poll(() => target.current, { timeout: 4000 }).toBeNull()
  })
})
