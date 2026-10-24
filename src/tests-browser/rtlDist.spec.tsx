import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { layered as builtLayeredCss, plain as builtPlainCss } from 'virtual:enchase-consumer-css'
import { Pagination, Switch } from '../../dist-lib/index.js'
import layeredCss from '../../dist-lib/styles.layer.css?inline'
import plainCss from '../../dist-lib/styles.css?inline'

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.append(style)
  added.push(style)
}

const direct = (dir: string, lang: string) => {
  document.documentElement.dir = dir
  document.documentElement.lang = lang
}

const previousIcon = () => document.querySelector('[data-slot="pagination-previous"] svg') as SVGElement

const thumbOffsetsFromTrack = () => {
  const track = (document.querySelector('[data-slot="switch-track"]') as HTMLElement).getBoundingClientRect()
  const thumb = (document.querySelector('[data-slot="switch-thumb"]') as HTMLElement).getBoundingClientRect()

  return { inside: thumb.left >= track.left - 1 && thumb.right <= track.right + 1, fromStart: Math.round(track.right - thumb.right) }
}

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('lang')
})

describe.each([
  ['the plain stylesheet as it is published', plainCss],
  ['the layered stylesheet as it is published', layeredCss],
  ['the plain stylesheet after the default build of Vite', builtPlainCss],
  ['the layered stylesheet after the default build of Vite', builtLayeredCss]
])('%s, with the document set to right to left', (_, css) => {
  it.each(['en', 'pt-BR', 'ar', 'he'])('mirrors the directional icons whatever the language, here lang=%s', (lang) => {
    addStyle(css)
    direct('rtl', lang)
    render(<Pagination pageCount={5} defaultPage={2} />)

    expect(getComputedStyle(previousIcon()).transform).toBe('matrix(-1, 0, 0, 1, 0, 0)')
  })

  it.each(['en', 'pt-BR', 'ar'])('moves the thumb of a checked switch towards the end of the track in rtl, here lang=%s', (lang) => {
    addStyle(css)
    direct('rtl', lang)
    render(<Switch label="Notificações" defaultChecked />)

    expect(thumbOffsetsFromTrack().inside).toBe(true)
    expect(thumbOffsetsFromTrack().fromStart).toBeGreaterThan(8)
  })

  it('does not mirror anything for an rtl language in a left to right document', () => {
    addStyle(css)
    direct('ltr', 'ar')
    render(
      <>
        <Pagination pageCount={5} defaultPage={2} />
        <Switch label="Notificações" defaultChecked />
      </>
    )

    expect(getComputedStyle(previousIcon()).transform).toBe('none')
    expect(thumbOffsetsFromTrack().inside).toBe(true)
    expect(thumbOffsetsFromTrack().fromStart).toBeLessThanOrEqual(8)
  })
})
