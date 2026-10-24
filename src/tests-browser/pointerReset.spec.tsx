import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { soak } from './settle.ts'

const hovered = () => (document.querySelector('[data-slot="button"]') as HTMLElement).matches(':hover')

describe('the pointer between the tests of a run', () => {
  it('stays over the button that a test hovered, until the test is over', async () => {
    renderInBrowser(<Button>First</Button>)
    await userEvent.hover(page.getByRole('button', { name: 'First' }))

    expect(hovered()).toBe(true)
  })

  it('is out of the page in the next test, so a button drawn where the last one was is not hovered', async () => {
    renderInBrowser(<Button>Second</Button>)
    await soak(300)

    expect(hovered()).toBe(false)
  })
})
