import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

import type { CSSProperties, ReactNode } from 'react'

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const part = (name: string) => document.body.querySelector(`[data-slot="${name}"]`) as HTMLElement

const minimum = (element: HTMLElement) => {
  const style = getComputedStyle(element)

  return { width: style.minWidth, height: style.minHeight }
}

const box = (element: HTMLElement) => {
  const { width, height } = element.getBoundingClientRect()

  return { width, height }
}

const numberField = <NumberInput label="Amount" defaultValue={1} />

describe('the regular target size from the token', () => {
  it('keeps a form control 40px tall and the steppers of a number field 40px square', () => {
    renderInBrowser(
      <>
        <Checkbox label="Terms" />
        {numberField}
      </>
    )

    expect(minimum(part('checkbox')).height).toBe('40px')
    expect(box(part('number-input-increase'))).toEqual({ width: 40, height: 40 })
    expect(box(part('number-input-decrease'))).toEqual({ width: 40, height: 40 })
  })

  it('takes the size from the token set on a container', () => {
    renderInBrowser(
      scoped(
        { '--enchase-hit-size': '32px' },
        <>
          <Checkbox label="Terms" />
          {numberField}
        </>
      )
    )

    expect(minimum(part('checkbox')).height).toBe('32px')
    expect(box(part('number-input-increase'))).toEqual({ width: 32, height: 32 })
  })

  it('never goes under the 24px floor, whatever the token says', () => {
    renderInBrowser(
      scoped(
        { '--enchase-hit-size': '8px' },
        <>
          <Checkbox label="Terms" />
          {numberField}
        </>
      )
    )

    expect(minimum(part('checkbox'))).toEqual({ width: '24px', height: '24px' })
    expect(box(part('number-input-increase'))).toEqual({ width: 24, height: 24 })
  })

  it('keeps the 40px target when a theme written before the token does not have it', () => {
    render(<Checkbox label="Terms" />)

    expect(minimum(part('checkbox')).height).toBe('40px')
  })
})

describe('the large target size from the token', () => {
  it('keeps the theme toggle 44px square', () => {
    renderInBrowser(<ThemeToggle />)

    expect(minimum(part('theme-toggle'))).toEqual({ width: '44px', height: '44px' })
  })

  it('takes the size from its own token, apart from the regular one', () => {
    renderInBrowser(
      scoped(
        { '--enchase-hit-size-lg': '30px' },
        <>
          <ThemeToggle />
          <Checkbox label="Terms" />
        </>
      )
    )

    expect(minimum(part('theme-toggle'))).toEqual({ width: '30px', height: '30px' })
    expect(minimum(part('checkbox')).height).toBe('40px')
  })

  it('never goes under the 24px floor either', () => {
    renderInBrowser(scoped({ '--enchase-hit-size-lg': '0px' }, <ThemeToggle />))

    expect(minimum(part('theme-toggle'))).toEqual({ width: '24px', height: '24px' })
  })
})
