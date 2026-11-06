import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Menu } from '@components/common/Menu/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'

import type { MenuEntry } from '@components/common/Menu/types.ts'

const entries: MenuEntry[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete' }
]

describe('the ref of the Menu in a real browser', () => {
  it('holds the open menu, which the arrow keys still walk through, and is null once it closes', async () => {
    const target = createRef<HTMLDivElement>()
    renderInBrowser(
      <div style={{ margin: '120px auto', width: 120 }}>
        <Menu ref={target} label="Actions" items={entries}>
          <button>Open</button>
        </Menu>
      </div>,
      'auto'
    )

    expect(target.current).toBeNull()

    page.getByRole('button', { name: 'Open' }).element().focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.element(page.getByRole('menu')).toBeVisible()

    expect(target.current).toBe(page.getByRole('menu', { name: 'Actions' }).element().closest('[data-slot="popover-content"]'))
    expect(document.activeElement?.textContent).toBe('Edit')

    await userEvent.keyboard('{ArrowDown}')

    expect(document.activeElement?.textContent).toBe('Duplicate')

    await userEvent.keyboard('{Escape}')

    await expect.poll(() => target.current, { timeout: 4000 }).toBeNull()
    expect(page.getByRole('button', { name: 'Open' }).element()).toHaveFocus()
  })
})
