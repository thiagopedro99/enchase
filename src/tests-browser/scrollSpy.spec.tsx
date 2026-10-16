import { describe, expect, it } from 'vitest'

import { useScrollSpy } from '@hooks/useScrollSpy.ts'
import { renderInBrowser } from './harness.tsx'
import { frames } from './settle.ts'

const ids = ['recursos', 'demos', 'contato']

const Page = () => {
  const active = useScrollSpy(ids)

  return (
    <>
      <output style={{ position: 'fixed', insetBlockStart: 0, insetInlineStart: 0 }}>{active ?? 'none'}</output>
      <div style={{ height: '120vh' }} />
      {ids.map((id) => (
        <section key={id} id={id} style={{ height: '100vh' }}>
          {id}
        </section>
      ))}
      <div style={{ height: '150vh' }} />
    </>
  )
}

const readActive = () => document.querySelector('output')?.textContent

const sectionOf = (id: string) => document.getElementById(id) as HTMLElement

const scrollToSection = (id: string) => window.scrollTo(0, sectionOf(id).offsetTop - 40)

describe('useScrollSpy in a real browser', () => {
  it('has no active section while the hero is on screen', async () => {
    renderInBrowser(<Page />)
    await frames(4)

    expect(readActive()).toBe('none')
  })

  it('activates the section that reaches the band and clears it back above the first section', async () => {
    renderInBrowser(<Page />)

    scrollToSection('recursos')
    await expect.poll(readActive).toBe('recursos')

    scrollToSection('demos')
    await expect.poll(readActive).toBe('demos')

    window.scrollTo(0, 0)
    await expect.poll(readActive).toBe('none')
  })

  it('keeps the last section once the page went past it', async () => {
    renderInBrowser(<Page />)

    scrollToSection('contato')
    await expect.poll(readActive).toBe('contato')

    window.scrollTo(0, document.documentElement.scrollHeight)
    await frames(4)

    expect(sectionOf('contato').getBoundingClientRect().bottom).toBeLessThan(96)
    expect(readActive()).toBe('contato')
  })
})
