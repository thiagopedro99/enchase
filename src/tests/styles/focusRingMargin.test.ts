import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const width = 'var(--enchase-focus-width, 2px)'

const elsewhere = new Set([
  'common/Checkbox/styles.module.css | .hidden:focus-visible + .box',
  'common/Combobox/styles.module.css | .wrapper[data-variant=\'borderless\'] .field:focus-within',
  'common/DatePicker/subcomponentes/Calendar/subcomponentes/CalendarGrid/styles.module.css | .day:focus-visible .number, .grid[data-keyboard-focus] .day:focus .number',
  'common/RadioGroup/styles.module.css | .hidden:focus-visible + .control',
  'common/Switch/styles.module.css | .hidden:focus-visible + .track'
])

const filesUnder = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? filesUnder(full) : full.endsWith('.module.css') ? [full] : []
  })

const outerRings = (css: string) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selector, body]) => {
    const offset = /outline-offset:\s*([^;]+);/.exec(body)?.[1].trim()

    if (offset === undefined || offset.includes('inset') || offset.startsWith('-')) return []

    return [{ selector: selector.trim().replace(/\s+/g, ' '), offset, margin: /scroll-margin:\s*([^;]+);/.exec(body)?.[1].trim() }]
  })

const drawnOnTheFocused = (selector: string) => selector.split(/,(?![^(]*\))/).every((part) => /(:focus-visible|:focus|:is\(:focus, :open\))$/.test(part.trim()))

const marginOf = (offset: string) => (offset === '0' ? width : `calc(${width} + ${offset})`)

describe('scroll margin of the focus ring', () => {
  const root = path.resolve(__dirname, '../../components')
  const rings = filesUnder(root).flatMap((file) => outerRings(readFileSync(file, 'utf8')).map((ring) => ({ ...ring, file: path.relative(root, file).replace(/\\/g, '/') })))
  const own = rings.filter((ring) => drawnOnTheFocused(ring.selector))
  const others = rings.filter((ring) => !drawnOnTheFocused(ring.selector))

  it('reads an outer ring and what it asks of the margin', () => {
    expect(outerRings('.a:focus-visible { outline-offset: 0; }')).toEqual([{ selector: '.a:focus-visible', offset: '0', margin: undefined }])
    expect(outerRings('.a:focus-visible { outline-offset: var(--enchase-focus-offset-inset, -2px); }')).toEqual([])
    expect(outerRings('@media (x) { .a:focus { outline-offset: 2px; scroll-margin: 4px; } }')).toEqual([{ selector: '.a:focus', offset: '2px', margin: '4px' }])
    expect(drawnOnTheFocused('.a:focus-visible,\n.b:focus-visible')).toBe(true)
    expect(drawnOnTheFocused(".w[data-variant='borderless'] .s:is(:focus, :open)")).toBe(true)
    expect(drawnOnTheFocused('.hidden:focus-visible + .box')).toBe(false)
    expect(drawnOnTheFocused('.day:focus-visible .number')).toBe(false)
  })

  it('gives every ring that the focused element draws outside itself a margin as wide as the ring', () => {
    expect(own.length).toBeGreaterThan(20)
    expect(own.filter((ring) => ring.margin !== marginOf(ring.offset)).map((ring) => `${ring.file} | ${ring.selector}`)).toEqual([])
  })

  it('knows every ring that another element draws, and none that no longer exists', () => {
    expect(new Set(others.map((ring) => `${ring.file} | ${ring.selector}`))).toEqual(elsewhere)
  })
})
