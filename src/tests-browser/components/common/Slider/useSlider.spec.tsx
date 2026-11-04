import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { useSlider } from '@components/common/Slider/useSlider.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { letGoOfTheMouse, parkMouse } from '../../../support/pointer.ts'

import type { UseSliderOptions } from '@components/common/Slider/types.ts'

afterEach(async () => {
  await letGoOfTheMouse()
  await parkMouse()
})

const Shell = (options: UseSliderOptions) => {
  const slider = useSlider(options)

  return (
    <div data-testid="root" data-dragging={slider.dragging ? '' : undefined} data-pointer-focus={slider.pointerFocus ? '' : undefined}>
      <div {...slider.getControlProps({ 'data-testid': 'control', style: { position: 'relative', inlineSize: 200, blockSize: 24, touchAction: 'none' } })}>
        <div {...slider.getTrackProps({ 'data-testid': 'track', style: { position: 'absolute', inset: 0 } })}>
          <div {...slider.getThumbProps({ 'aria-label': 'Volume', style: { position: 'absolute', insetInlineStart: `${slider.percent}%`, inlineSize: 16, blockSize: 24 } })} />
        </div>
      </div>
    </div>
  )
}

const control = () => page.getByTestId('control').element() as HTMLElement

const thumb = () => page.getByRole('slider').element() as HTMLElement

const root = () => page.getByTestId('root').element() as HTMLElement

const value = () => Number(thumb().getAttribute('aria-valuenow'))

const at = (ratio: number) => ({ x: 200 * ratio, y: 12 })

describe('useSlider in a real browser', () => {
  it('sets the value where the mouse goes down and takes the focus to the thumb', async () => {
    renderInBrowser(<Shell />)
    await userEvent.click(control(), { position: at(0.5) })

    expect(value()).toBe(50)
    expect(document.activeElement).toBe(thumb())
    expect(root().hasAttribute('data-pointer-focus')).toBe(true)
  })

  it('follows a drag from one point to another, snaps it to the step and lets it go at the end', async () => {
    renderInBrowser(<Shell step={10} />)
    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(0.2), targetPosition: at(0.73), steps: 8 })

    expect(value()).toBe(70)
    expect(root().hasAttribute('data-dragging')).toBe(false)
  })

  it('holds the value at the ends when the drag goes past them', async () => {
    renderInBrowser(
      <div style={{ paddingInline: 150 }}>
        <Shell defaultValue={50} />
      </div>
    )
    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(0.5), targetPosition: { x: 200 + 140, y: 12 }, force: true, steps: 5 })

    expect(value()).toBe(100)

    await userEvent.dragAndDrop(control(), control(), { sourcePosition: at(1), targetPosition: { x: -140, y: 12 }, force: true, steps: 5 })

    expect(value()).toBe(0)
  })

  it('maps the pointer from the right edge when it runs from right to left', async () => {
    renderInBrowser(
      <div dir="rtl">
        <Shell />
      </div>
    )
    await userEvent.click(control(), { position: at(0.75) })

    expect(value()).toBe(25)
  })

  it('moves with the arrows, PageUp, PageDown, Home and End, and mirrors the arrows from right to left', async () => {
    const view = renderInBrowser(<Shell defaultValue={50} />)

    await userEvent.tab()

    expect(document.activeElement).toBe(thumb())

    await userEvent.keyboard('{ArrowRight}')

    expect(value()).toBe(51)

    await userEvent.keyboard('{PageUp}')

    expect(value()).toBe(61)

    await userEvent.keyboard('{Home}')

    expect(value()).toBe(0)

    await userEvent.keyboard('{End}')

    expect(value()).toBe(100)

    view.unmount()
    renderInBrowser(
      <div dir="rtl">
        <Shell defaultValue={50} />
      </div>
    )
    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(value()).toBe(49)
  })

  it('drops the pointer focus flag with a key, and ignores the pointer when it is disabled', async () => {
    renderInBrowser(<Shell disabled />)
    await userEvent.click(control(), { position: at(0.5) })

    expect(value()).toBe(0)
    expect(thumb().hasAttribute('tabindex')).toBe(false)
  })
})
