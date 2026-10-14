import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { renderInBrowser } from './harness.tsx'

describe('browser mode', () => {
  it('lays out a real button with a measurable box', async () => {
    renderInBrowser(<Button>Salvar</Button>)
    const box = page.getByRole('button', { name: 'Salvar' }).element().getBoundingClientRect()

    expect(box.width).toBeGreaterThan(24)
    expect(box.height).toBeGreaterThan(24)
  })
})
