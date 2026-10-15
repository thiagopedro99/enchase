import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Container } from '@components/common/Container/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { renderInBrowser } from './harness.tsx'

afterEach(async () => {
  await page.viewport(1280, 800)
})

describe('Container maximum width in a real browser', () => {
  it('stops growing at the configured breakpoint', async () => {
    await page.viewport(1280, 800)
    renderInBrowser(<Container maxWidth="md" padding={false} data-testid="c" />)

    expect(page.getByTestId('c').element().getBoundingClientRect().width).toBe(768)
  })

  it('follows a breakpoint changed in the provider', async () => {
    await page.viewport(1280, 800)
    renderInBrowser(
      <UIProvider breakpoints={{ md: '640px' }}>
        <Container maxWidth="md" padding={false} data-testid="c" />
      </UIProvider>
    )

    expect(page.getByTestId('c').element().getBoundingClientRect().width).toBe(640)
  })

  it('fills the viewport below the breakpoint and for the full width', async () => {
    await page.viewport(600, 800)
    renderInBrowser(
      <>
        <Container maxWidth="xl" padding={false} data-testid="narrow" />
        <Container maxWidth="full" padding={false} data-testid="full" />
      </>
    )
    const available = (page.getByTestId('narrow').element().parentElement as HTMLElement).getBoundingClientRect().width

    expect(available).toBeLessThan(768)
    expect(page.getByTestId('narrow').element().getBoundingClientRect().width).toBe(available)
    expect(page.getByTestId('full').element().getBoundingClientRect().width).toBe(available)
  })
})
