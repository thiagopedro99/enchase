import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { setForcedColors, setReducedMotion } from './media.ts'
import { unlessWebkit } from './browserSkips.ts'
import { waitForSettled } from './settle.ts'

const plans = [
  { value: 'free', label: 'Grátis' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Equipe' }
]

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setForcedColors('none')
})

const part = (name: string, index = 0) => document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)[index]

const radios = () => [...document.body.querySelectorAll<HTMLInputElement>('[data-slot="radio-group-input"]')]

const checkedValue = () => radios().find((radio) => radio.checked)?.value

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const paintOf = (element: HTMLElement) => {
  const style = getComputedStyle(element)
  const filledByBorder = style.borderTopStyle !== 'none' && parseFloat(style.borderTopWidth) * 2 >= element.getBoundingClientRect().width - 0.5

  return filledByBorder ? style.borderTopColor : style.backgroundColor
}

const centerOf = (element: HTMLElement) => {
  const box = element.getBoundingClientRect()

  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

const watchTransitions = (element: HTMLElement) => {
  const started: string[] = []

  element.addEventListener('transitionrun', (event) => started.push((event as TransitionEvent).propertyName))

  return started
}

describe('RadioGroup in a real browser', () => {
  it('is exposed as a named radio group with a radio per option', () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} />)

    expect(page.getByRole('radiogroup', { name: 'Plano' }).element()).toBe(part('radio-group'))
    expect(page.getByRole('radio').elements()).toHaveLength(3)
    expect(page.getByRole('radio', { name: 'Pro' }).element()).toBe(radios()[1])
  })

  it.each(['light', 'dark'] as const)('keeps the rings, the dot and the texts readable in the %s theme', (mode) => {
    renderInBrowser(
      <>
        <RadioGroup label="Plano" options={plans} defaultValue="pro" helperText="Dá para trocar" />
        <RadioGroup label="Erro" options={plans} error="Escolha um" />
      </>,
      'never',
      mode
    )
    const control = (index: number) => getComputedStyle(part('radio-group-control', index))
    const dot = paintOf(part('radio-group-control', 1).firstElementChild as HTMLElement)

    for (const name of surfaces) {
      expect(contrastRatio(control(0).borderTopColor, surface(name)), `unchecked ring on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(control(1).borderTopColor, surface(name)), `checked ring on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(dot, surface(name)), `dot on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(control(3).borderTopColor, surface(name)), `invalid ring on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(getComputedStyle(part('radio-group-legend')).color, surface(name)), `legend on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('radio-group-label')).color, surface(name)), `label on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('radio-group-helper')).color, surface(name)), `helper on ${name}`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(getComputedStyle(part('radio-group-error')).color, surface(name)), `error on ${name}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('draws a 20 px ring with a 10 px dot centered inside it only on the selected option', () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} defaultValue="pro" />)
    const dot = (index: number) => part('radio-group-control', index).firstElementChild as HTMLElement

    expect(part('radio-group-control', 1).getBoundingClientRect().width).toBeCloseTo(20, 0)
    expect(part('radio-group-control', 1).getBoundingClientRect().height).toBeCloseTo(20, 0)
    expect(dot(1).getBoundingClientRect().width).toBeCloseTo(10, 0)
    expect(centerOf(dot(1)).x).toBeCloseTo(centerOf(part('radio-group-control', 1)).x, 0)
    expect(centerOf(dot(1)).y).toBeCloseTo(centerOf(part('radio-group-control', 1)).y, 0)
    expect(getComputedStyle(dot(1)).opacity).toBe('1')
    expect(getComputedStyle(dot(0)).opacity).toBe('0')
  })

  it('moves the selection with the arrow keys and skips a disabled option', async () => {
    renderInBrowser(<RadioGroup label="Plano" options={[plans[0], { ...plans[1], disabled: true }, plans[2]]} defaultValue="free" />)

    await userEvent.tab()
    expect(document.activeElement).toBe(radios()[0])

    await userEvent.keyboard('{ArrowDown}')
    expect(checkedValue()).toBe('team')
    expect(document.activeElement).toBe(radios()[2])

    await userEvent.keyboard('{ArrowUp}')
    expect(checkedValue()).toBe('free')

    if (unlessWebkit('radioWrap')) {
      await userEvent.keyboard('{ArrowUp}')
      expect(checkedValue()).toBe('team')
    }
  })

  it('enters the group on the first radio when nothing is selected and selects it with Space', async () => {
    renderInBrowser(
      <>
        <RadioGroup label="Plano" options={plans} />
        <button>Depois</button>
      </>
    )

    await userEvent.tab()
    expect(document.activeElement).toBe(radios()[0])
    expect(checkedValue()).toBeUndefined()

    await userEvent.keyboard(' ')
    expect(checkedValue()).toBe('free')

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Depois' }).element())
  })

  it('selects with a pointer on the ring as well as on the label', async () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} />)

    await userEvent.click(part('radio-group-control', 1))
    expect(checkedValue()).toBe('pro')

    await userEvent.click(page.getByText('Equipe'))
    expect(checkedValue()).toBe('team')
  })

  it('does not select anything when the group is disabled', async () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} disabled defaultValue="free" />)

    await userEvent.click(page.getByText('Pro'), { force: true })

    expect(checkedValue()).toBe('free')
    expect(getComputedStyle(part('radio-group-control')).cursor).toBe('not-allowed')
    expect(getComputedStyle(part('radio-group-label')).cursor).toBe('not-allowed')
  })

  it('shows a visible focus ring on the ring of the focused option when reached by keyboard', async () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} defaultValue="pro" />)

    await userEvent.tab()
    const style = getComputedStyle(part('radio-group-control', 1))

    expect(document.activeElement).toBe(radios()[1])
    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)
    expect(getComputedStyle(part('radio-group-control', 0)).outlineStyle).toBe('none')

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('keeps every option at least 24 by 24 px', () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} />)

    for (let index = 0; index < plans.length; index += 1) {
      const box = part('radio-group-option', index).getBoundingClientRect()

      expect(box.width).toBeGreaterThanOrEqual(24)
      expect(box.height).toBeGreaterThanOrEqual(24)
    }
  })

  it('stacks the options by default and puts them side by side when horizontal', () => {
    renderInBrowser(
      <>
        <RadioGroup label="Vertical" options={plans} />
        <RadioGroup label="Horizontal" options={plans} orientation="horizontal" />
      </>
    )
    const top = (index: number) => part('radio-group-option', index).getBoundingClientRect().top

    expect(top(1)).toBeGreaterThan(top(0))
    expect(top(4)).toBeCloseTo(top(3), 0)
    expect(part('radio-group-option', 4).getBoundingClientRect().left).toBeGreaterThan(part('radio-group-option', 3).getBoundingClientRect().right)
  })

  it('wraps a horizontal group inside a narrow container without overflowing', () => {
    renderInBrowser(
      <div style={{ inlineSize: 180 }}>
        <RadioGroup label="Plano" options={plans} orientation="horizontal" />
      </div>
    )
    const container = part('radio-group').parentElement as HTMLElement

    expect(part('radio-group-option', 2).getBoundingClientRect().top).toBeGreaterThan(part('radio-group-option', 0).getBoundingClientRect().top)
    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
  })

  it('breaks an unbreakable legend, label and helper text inside a narrow container', () => {
    const word = 'Benachrichtigungseinstellungsverwaltungsseite'

    renderInBrowser(
      <div style={{ inlineSize: 140 }}>
        <RadioGroup label={word} options={[{ value: 'a', label: word }]} helperText={word} />
        <RadioGroup label={word} options={[{ value: 'a', label: word }]} error={word} />
      </div>
    )
    const container = part('radio-group').parentElement as HTMLElement

    expect(container.scrollWidth).toBeLessThanOrEqual(container.clientWidth)
    expect(part('radio-group', 0).getBoundingClientRect().width).toBeLessThanOrEqual(140)
  })

  it('starts the horizontal row on the right in right-to-left text', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(<RadioGroup label="Plano" options={plans} orientation="horizontal" />)

    expect(part('radio-group-option', 0).getBoundingClientRect().left).toBeGreaterThan(part('radio-group-option', 1).getBoundingClientRect().left)
  })

  it('paints the legend and the unselected rings with the error color when invalid', () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} error="Escolha um" defaultValue="pro" />)
    const error = getComputedStyle(part('radio-group-error')).color

    expect(getComputedStyle(part('radio-group-legend')).color).toBe(error)
    expect(getComputedStyle(part('radio-group-control', 0)).borderTopColor).toBe(error)
    expect(getComputedStyle(part('radio-group-control', 1)).borderTopColor).not.toBe(error)
  })

  it('lets the caller class and slot selectors win on layout even when its css loads before the library', () => {
    addStyle('.mine { max-inline-size: 150px; } [data-slot="radio-group-options"] { gap: 13px; } [data-slot="radio-group-option"] { min-block-size: 64px; } [data-slot="radio-group-legend"] { margin-block-end: 21px; }')
    renderInBrowser(<RadioGroup label="Plano" options={plans} className="mine" />)

    expect(part('radio-group').getBoundingClientRect().width).toBeLessThanOrEqual(150)
    expect(getComputedStyle(part('radio-group-options')).rowGap).toBe('13px')
    expect(getComputedStyle(part('radio-group-option')).minHeight).toBe('64px')
    expect(getComputedStyle(part('radio-group-legend')).marginBlockEnd).toBe('21px')
  })
})

describe('RadioGroup motion in a real browser', () => {
  it('fades and scales the dot in and out with the duration of the pop recipe', async () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} defaultValue="free" />, 'auto')
    const dot = (index: number) => part('radio-group-control', index).firstElementChild as HTMLElement
    const entering = watchTransitions(dot(1))
    const leaving = watchTransitions(dot(0))

    expect(parseFloat(getComputedStyle(dot(1)).transitionDuration)).toBeCloseTo(0.15, 2)

    await userEvent.click(page.getByText('Pro'))

    await expect.poll(() => entering).toContain('opacity')
    await expect.poll(() => entering).toContain('transform')
    await expect.poll(() => leaving).toContain('opacity')
    await waitForSettled(() => part('radio-group'))
    expect(getComputedStyle(dot(1)).opacity).toBe('1')
    expect(getComputedStyle(dot(0)).opacity).toBe('0')
  })

  it('takes the duration from the animation tuning', () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} animation={{ tuning: { duration: 0.4 } }} />, 'auto')

    expect(parseFloat(getComputedStyle(part('radio-group-control').firstElementChild as HTMLElement).transitionDuration)).toBeCloseTo(0.4, 2)
  })

  it.each([
    ['never mode', undefined, 'never'],
    ['animation={false}', false, 'auto']
  ] as const)('shows the dot at once with %s', async (_name, animation, motion) => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} animation={animation} />, motion)

    await userEvent.click(page.getByText('Pro'))

    expect(part('radio-group').getAnimations({ subtree: true })).toEqual([])
    expect(getComputedStyle(part('radio-group-control', 1).firstElementChild as HTMLElement).opacity).toBe('1')
  })

  it('stops scaling the dot under reduced motion but still fades it', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<RadioGroup label="Plano" options={plans} />, 'auto')
    const dot = part('radio-group-control', 1).firstElementChild as HTMLElement
    const started = watchTransitions(dot)

    await userEvent.click(page.getByText('Pro'))

    expect(getComputedStyle(dot).transitionProperty).toBe('opacity')
    await expect.poll(() => started).toContain('opacity')
    expect(started).not.toContain('transform')
    expect(getComputedStyle(dot).transform).toBe('none')
  })
})

describe('RadioGroup in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('keeps the dot visible against the page so the selection still shows', async () => {
    renderInBrowser(<RadioGroup label="Plano" options={plans} defaultValue="pro" />)
    const dot = part('radio-group-control', 1).firstElementChild as HTMLElement

    await setForcedColors('active')
    const probe = document.createElement('div')

    probe.style.backgroundColor = 'Canvas'
    document.body.append(probe)
    const canvas = getComputedStyle(probe).backgroundColor
    probe.remove()

    expect(getComputedStyle(dot).opacity).toBe('1')
    expect(contrastRatio(paintOf(dot), canvas)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(getComputedStyle(part('radio-group-control', 1)).borderTopColor, canvas)).toBeGreaterThanOrEqual(3)
  })
})
