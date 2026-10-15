import { describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'

const paragraphs = Array.from({ length: 300 }, (_, index) => `<p>Parágrafo ${index} com texto suficiente para quebrar em várias linhas dentro da coluna de conteúdo e forçar o layout a refazer as quebras quando a largura muda.</p>`).join('')

const setup = (variant: 'aside' | 'columns') => {
  const style = document.createElement('style')
  style.textContent =
    variant === 'aside'
      ? '.w{display:grid;grid-template-columns:auto minmax(0,1fr)} .a{inline-size:280px;transition:inline-size 250ms cubic-bezier(.2,0,0,1);background:#ddd} .w[data-c] .a{inline-size:80px} .m{min-inline-size:0}'
      : '.w{display:grid;grid-template-columns:280px minmax(0,1fr);transition:grid-template-columns 250ms cubic-bezier(.2,0,0,1)} .w[data-c]{grid-template-columns:80px minmax(0,1fr)} .a{background:#ddd;overflow:hidden} .m{min-inline-size:0}'
  const root = document.createElement('div')
  root.className = 'w'
  root.innerHTML = `<aside class="a">menu</aside><main class="m">${paragraphs}</main>`
  document.head.append(style)
  document.body.append(root)

  return {
    root,
    cleanup: () => {
      style.remove()
      root.remove()
    }
  }
}

const metric = (metrics: { name: string; value: number }[], name: string) => metrics.find((item) => item.name === name)?.value ?? 0

const run = async (variant: 'aside' | 'columns') => {
  const { root, cleanup } = setup(variant)
  await cdp().send('Performance.enable')
  const before = (await cdp().send('Performance.getMetrics')).metrics
  root.toggleAttribute('data-c')
  await new Promise((resolve) => setTimeout(resolve, 450))
  const after = (await cdp().send('Performance.getMetrics')).metrics
  cleanup()

  return {
    layoutMs: Math.round((metric(after, 'LayoutDuration') - metric(before, 'LayoutDuration')) * 1000),
    layoutCount: metric(after, 'LayoutCount') - metric(before, 'LayoutCount'),
    styleMs: Math.round((metric(after, 'RecalcStyleDuration') - metric(before, 'RecalcStyleDuration')) * 1000)
  }
}

describe('cost of animating the collapse in a real browser', () => {
  it('compares the sidebar inline size against grid columns', async () => {
    const aside = await run('aside')
    const columns = await run('columns')

    expect(aside.layoutCount).toBeGreaterThan(0)
    expect(columns.layoutCount).toBeGreaterThan(0)
    expect(aside.layoutMs / aside.layoutCount).toBeLessThan(16)
    expect(columns.layoutMs / columns.layoutCount).toBeLessThan(16)
  })
})
