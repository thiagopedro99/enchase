import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Popover } from '@components/common/Popover/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { parseComputedColor } from './color.ts'
import { renderInBrowser } from './harness.tsx'
import { onRoot } from './hookProbes.ts'
import { capture } from './pixels.ts'

import type { PlacementInput } from '../positioning/index.ts'
import type { Rgba } from './color.ts'

const placements = (['top', 'bottom', 'left', 'right'] as const).flatMap((side) => [side, `${side}-start`, `${side}-end`]) as PlacementInput[]

const outward = { top: [0, 1], bottom: [0, -1], left: [1, 0], right: [-1, 0] } as const

const tolerance = 6

const flat = { '--enchase-popover-content-background': 'rgb(200, 40, 40)', '--enchase-popover-content-shadow': 'none' }

const outlined = { ...flat, '--enchase-popover-content-border-width': '3px', '--enchase-popover-content-border-color': 'rgb(20, 40, 220)', '--enchase-popover-arrow-size': '24px' }

const kinds = {
  plain: { border: 0, tipInset: 2.5, middleInset: 5 },
  outlined: { border: 3, tipInset: 2, middleInset: 9 }
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

const content = () => document.querySelector<HTMLElement>('[data-slot="popover-content"]')

const near = (first: Rgba, second: Rgba) => [first.r - second.r, first.g - second.g, first.b - second.b].every((difference) => Math.abs(difference) <= tolerance)

const opened = (placement: PlacementInput, top = 300) => (
  <div style={{ position: 'absolute', top, left: 560 }}>
    <Popover defaultOpen arrow placement={placement} content={<div style={{ width: 160, height: 120 }}>Conteúdo</div>}>
      <button>Abrir</button>
    </Popover>
  </div>
)

const sample = async (kind: keyof typeof kinds) => {
  const { border, tipInset, middleInset } = kinds[kind]
  const box = content() as HTMLElement
  const arrow = box.querySelector('[data-slot="popover-arrow"]') as HTMLElement
  const rect = box.getBoundingClientRect()
  const tip = arrow.getBoundingClientRect()
  const side = box.dataset.placement?.split('-')[0] as keyof typeof outward
  const [ux, uy] = outward[side]
  const alongX = Math.abs(uy)
  const alongY = Math.abs(ux)
  const centerX = tip.left + tip.width / 2
  const centerY = tip.top + tip.height / 2
  const half = tip.width / 2
  const edge = { top: rect.bottom, bottom: rect.top, left: rect.right, right: rect.left }[side]
  const toward = (alongX ? rect.left + rect.width / 2 >= centerX : rect.top + rect.height / 2 >= centerY) ? 1 : -1
  const at = (outwards: number, beside = 0) => ({ x: centerX + ux * outwards + alongX * beside * toward, y: centerY + uy * outwards + alongY * beside * toward })
  const colorAt = await capture()
  const style = getComputedStyle(box)
  const palette = { box: parseComputedColor(style.backgroundColor), border: parseComputedColor(style.borderTopColor), page: colorAt(4, 4) }
  const nameOf = (point: { x: number; y: number }) => {
    const pixel = colorAt(point.x, point.y)

    return Object.entries(palette).find(([, color]) => near(pixel, color))?.[0] ?? `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`
  }
  const seen = {
    placement: box.dataset.placement,
    centered: Math.abs((alongX ? centerY : centerX) - edge) < 0.75,
    contrast: !near(palette.box, palette.page),
    tip: nameOf(at(half - tipInset)),
    middle: nameOf(at(half - middleInset)),
    base: nameOf(at(-(border || 4) / 2)),
    beside: nameOf(at(2, half + 4))
  }

  return border > 0 ? { ...seen, band: nameOf(at(-border / 2, 50)) } : seen
}

const painted = (placement: string, kind: keyof typeof kinds) => ({
  placement,
  centered: true,
  contrast: true,
  tip: kind === 'outlined' ? 'border' : 'box',
  middle: 'box',
  base: 'box',
  beside: 'page',
  ...(kind === 'outlined' ? { band: 'border' } : {})
})

describe.each(placements)('the arrow of a popover placed %s', (placement) => {
  it('is painted in the color of the box up to its tip, and leaves the page bare beside it', async () => {
    onRoot(flat)
    renderInBrowser(opened(placement))

    await expect.poll(() => sample('plain'), { timeout: 5000 }).toEqual(painted(placement, 'plain'))
  })

  it('carries the border along its two outward sides, and not across its base', async () => {
    onRoot(outlined)
    renderInBrowser(opened(placement))

    await expect.poll(() => sample('outlined'), { timeout: 5000 }).toEqual(painted(placement, 'outlined'))
  })
})

describe('the arrow of a popover in the other conditions', () => {
  it('is painted with the colors of the dark theme', async () => {
    onRoot({ '--enchase-popover-content-shadow': 'none' })
    renderInBrowser(opened('bottom'), 'never', 'dark')

    await expect.poll(() => sample('plain'), { timeout: 5000 }).toEqual(painted('bottom', 'plain'))
  })

  it('is painted with the colors of the light theme', async () => {
    onRoot({ '--enchase-popover-content-shadow': 'none' })
    renderInBrowser(opened('top'), 'never', 'light')

    await expect.poll(() => sample('plain'), { timeout: 5000 }).toEqual(painted('top', 'plain'))
  })

  it('is painted on the physical side that start resolves to in right to left', async () => {
    onRoot(flat)
    renderInBrowser(
      <div dir="rtl">
        <UIProvider locale={{ ...ptBR, dir: 'rtl' }}>{opened('start')}</UIProvider>
      </div>
    )

    await expect.poll(() => sample('plain'), { timeout: 5000 }).toEqual(painted('right', 'plain'))
  })

  it('stays painted and in place while long content scrolls inside the box', async () => {
    await page.viewport(1280, 400)
    onRoot(flat)
    renderInBrowser(
      <div style={{ position: 'absolute', top: 100, left: 560 }}>
        <Popover defaultOpen arrow content={<div style={{ width: 200, height: 900 }}>Conteúdo alto</div>}>
          <button>Abrir</button>
        </Popover>
      </div>
    )
    const body = () => document.querySelector('[data-slot="popover-body"]') as HTMLElement
    const arrow = () => (content() as HTMLElement).querySelector('[data-slot="popover-arrow"]') as HTMLElement

    await expect.poll(() => body()?.scrollHeight > body()?.clientHeight).toBe(true)

    const before = arrow().getBoundingClientRect().toJSON()

    body().scrollTop = 200

    await expect.poll(() => body().scrollTop).toBe(200)
    expect(arrow().getBoundingClientRect().toJSON()).toEqual(before)
    await expect.poll(() => sample('plain'), { timeout: 5000 }).toEqual(painted('bottom', 'plain'))
  })
})
