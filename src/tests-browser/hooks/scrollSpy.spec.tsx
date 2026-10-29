import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { useScrollSpy } from '@hooks/useScrollSpy.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { frames } from '../support/settle.ts'

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

const DynamicPage = () => {
  const [generation, setGeneration] = useState(0)
  const [showLast, setShowLast] = useState(false)
  const active = useScrollSpy(ids)

  return (
    <>
      <output style={{ position: 'fixed', insetBlockStart: 0, insetInlineStart: 0 }}>{active ?? 'none'}</output>
      <button type="button" style={{ position: 'fixed', insetBlockStart: 0, insetInlineEnd: 0 }} onClick={() => setGeneration((value) => value + 1)}>
        remontar
      </button>
      <button type="button" style={{ position: 'fixed', insetBlockStart: 40, insetInlineEnd: 0 }} onClick={() => setShowLast((value) => !value)}>
        alternar
      </button>
      <div style={{ height: '120vh' }} />
      <section key={`recursos-${generation}`} id="recursos" style={{ height: '100vh' }}>
        recursos
      </section>
      <section key={`demos-${generation}`} id="demos" style={{ height: '100vh' }}>
        demos
      </section>
      {showLast && (
        <section id="contato" style={{ height: '100vh' }}>
          contato
        </section>
      )}
      <div style={{ height: '150vh' }} />
    </>
  )
}

const readActive = () => document.querySelector('output')?.textContent

const clickButton = (name: string) => (Array.from(document.querySelectorAll('button')).find((button) => button.textContent === name) as HTMLButtonElement).click()

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

  it('keeps the highlight right after a section is rendered again as a new element', async () => {
    renderInBrowser(<DynamicPage />)

    scrollToSection('demos')
    await expect.poll(readActive).toBe('demos')

    const before = sectionOf('recursos')

    clickButton('remontar')
    await expect.poll(() => sectionOf('recursos') !== before).toBe(true)
    await frames(4)
    expect(readActive()).toBe('demos')

    scrollToSection('recursos')
    await expect.poll(readActive).toBe('recursos')

    scrollToSection('demos')
    await expect.poll(readActive).toBe('demos')
  })

  it('follows a section that is only rendered later and lets go of one that is removed', async () => {
    renderInBrowser(<DynamicPage />)

    scrollToSection('demos')
    await expect.poll(readActive).toBe('demos')

    clickButton('alternar')
    await expect.poll(() => document.getElementById('contato') !== null).toBe(true)
    scrollToSection('contato')
    await expect.poll(readActive).toBe('contato')

    clickButton('alternar')
    await expect.poll(() => document.getElementById('contato') === null).toBe(true)
    await expect.poll(readActive).not.toBe('contato')
  })
})
