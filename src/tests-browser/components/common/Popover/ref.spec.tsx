import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Popover } from '@components/common/Popover/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

describe('the ref of the Popover in a real browser', () => {
  it('holds the open content, placed beside the trigger, and is null once the exit animation ends', async () => {
    const target = createRef<HTMLDivElement>()
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 120 }}>
        <Popover ref={target} label="Detalhes" content={<button>Dentro</button>}>
          <button>Abrir</button>
        </Popover>
      </div>,
      'auto'
    )

    expect(target.current).toBeNull()

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.element(page.getByRole('dialog')).toBeVisible()

    const trigger = page.getByRole('button', { name: 'Abrir' }).element().getBoundingClientRect()
    const content = (target.current as HTMLDivElement).getBoundingClientRect()

    expect(target.current).toBe(page.getByRole('dialog').element())
    expect(content.top).toBeGreaterThanOrEqual(trigger.bottom - 1)

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => target.current, { timeout: 4000 }).toBeNull()
    expect(page.getByRole('button', { name: 'Abrir' }).element()).toHaveFocus()
  })
})
