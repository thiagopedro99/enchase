import { afterEach, describe, expect, it } from 'vitest'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Avatar } from '@components/common/Avatar/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, hooked, part, style } from '../../../support/hookProbes.ts'

const picture = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='rgb(255,0,0)'/></svg>"

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const element = document.createElement('style')
  element.textContent = css
  document.head.prepend(element)
  added.push(element)
}

afterEach(() => {
  document.documentElement.removeAttribute('style')
  added.splice(0).forEach((element) => element.remove())
})

const stateOf = (index = 0) => () => part('avatar', index)?.getAttribute('data-state')

describe('Avatar in a real browser', () => {
  it('is a circle of 32, 40 or 56 pixels by size', () => {
    renderInBrowser(
      <>
        <Avatar name="Ana Souza" size="sm" />
        <Avatar name="Ana Souza" />
        <Avatar name="Ana Souza" size="lg" />
      </>
    )

    expect([0, 1, 2].map((index) => part('avatar', index).getBoundingClientRect().width)).toEqual([32, 40, 56])
    expect([0, 1, 2].map((index) => part('avatar', index).getBoundingClientRect().height)).toEqual([32, 40, 56])
    expect(parseFloat(style('avatar').borderTopLeftRadius)).toBeGreaterThan(100)
  })

  it('centers the initials and keeps the avatar the same size whatever the initials', () => {
    renderInBrowser(
      <>
        <Avatar name="W" />
        <Avatar name="Wanderley Wellington" />
      </>
    )
    const [first, second] = [part('avatar', 0), part('avatar', 1)].map((element) => element.getBoundingClientRect())
    const text = part('avatar-fallback', 1).getBoundingClientRect()

    expect(first?.width).toBe(second?.width)
    expect(Math.abs((text.left + text.right) / 2 - ((second?.left ?? 0) + (second?.right ?? 0)) / 2)).toBeLessThan(1)
    expect(Math.abs((text.top + text.bottom) / 2 - ((second?.top ?? 0) + (second?.bottom ?? 0)) / 2)).toBeLessThan(1.5)
  })

  it('loads a real image over the initials and drops them', async () => {
    renderInBrowser(<Avatar name="Ana Souza" src={picture} />)

    await expect.poll(stateOf()).toBe('loaded')

    const box = part('avatar').getBoundingClientRect()
    const image = part('avatar-image').getBoundingClientRect()

    expect([image.width, image.height]).toEqual([box.width, box.height])
    expect(style('avatar-image').objectFit).toBe('cover')
    expect(part('avatar-fallback')).toBeUndefined()
  })

  it('falls back to the initials when the image does not exist', async () => {
    renderInBrowser(<Avatar name="Ana Souza" src="/enchase-no-such-picture.png" />)

    await expect.poll(stateOf()).toBe('fallback')

    expect(part('avatar-image')).toBeUndefined()
    expect(part('avatar-fallback').textContent).toBe('AS')
  })

  it.each(['light', 'dark'] as const)('keeps the initials readable in the %s theme', (mode) => {
    renderInBrowser(<Avatar name="Ana Souza" />, 'never', mode)

    expect(contrastRatio(style('avatar').color, style('avatar').backgroundColor)).toBeGreaterThanOrEqual(4.5)
  })

  it('reads its size, shape, colors and type from hooks', () => {
    hooked(
      [
        ['--enchase-avatar-size-md', '3rem', at('avatar'), 'width', '48px'],
        ['--enchase-avatar-size-md', '3rem', at('avatar'), 'height', '48px'],
        ['--enchase-avatar-radius', '6px', at('avatar'), 'border-top-left-radius'],
        ['--enchase-avatar-background', 'rgb(1, 2, 3)', at('avatar'), 'background-color'],
        ['--enchase-avatar-color', 'rgb(4, 5, 6)', at('avatar'), 'color'],
        ['--enchase-avatar-font-size-md', '21px', at('avatar'), 'font-size'],
        ['--enchase-avatar-font-weight', '700', at('avatar'), 'font-weight'],
        ['--enchase-avatar-line-height', '2', at('avatar'), 'line-height', '42px']
      ],
      <Avatar name="Ana Souza" />
    )
  })

  it('reads the size of each step from its own hook', () => {
    hooked(
      [
        ['--enchase-avatar-size-sm', '1.5rem', at('avatar', 0), 'width', '24px'],
        ['--enchase-avatar-size-lg', '4rem', at('avatar', 1), 'width', '64px']
      ],
      <>
        <Avatar name="Ana Souza" size="sm" />
        <Avatar name="Ana Souza" size="lg" />
      </>
    )
  })

  it('lets the caller class win on the size and the colors even when its css loads before the library', () => {
    addStyle('.mine { inline-size: 70px; block-size: 70px; background-color: rgb(0, 128, 0); }')
    renderInBrowser(<Avatar name="Ana Souza" className="mine" />)

    expect(style('avatar').width).toBe('70px')
    expect(style('avatar').height).toBe('70px')
    expect(style('avatar').backgroundColor).toBe('rgb(0, 128, 0)')
  })

  it('flows inline with the text', () => {
    renderInBrowser(
      <p>
        By <Avatar name="Ana Souza" size="sm" /> Ana
      </p>
    )

    expect(style('avatar').display).toBe('inline-flex')
    expect(style('avatar').verticalAlign).toBe('middle')
  })

  it('does not shrink inside a flex row', () => {
    renderInBrowser(
      <div style={{ display: 'flex', inlineSize: 60 }}>
        <Avatar name="Ana Souza" size="lg" />
        <span style={{ flex: '1 1 0', minInlineSize: 100 }}>name</span>
      </div>
    )

    expect(part('avatar').getBoundingClientRect().width).toBe(56)
  })

  it('waits for the new image when the src changes', async () => {
    const view = renderInBrowser(<Avatar name="Ana Souza" src={picture} />)

    await expect.poll(stateOf()).toBe('loaded')
    view.rerender(<Avatar name="Ana Souza" src="/enchase-no-such-picture.png" />)

    await expect.poll(stateOf()).toBe('fallback')
  })
})
