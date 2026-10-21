import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Alert } from '@components/common/Alert/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Link } from '@components/common/Link/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { renderInBrowser } from './harness.tsx'

import type { CSSProperties, ReactNode } from 'react'

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const part = (name: string) => document.body.querySelector(`[data-slot="${name}"]`) as HTMLElement

const style = (name: string) => getComputedStyle(part(name))

const ratio = (name: string) => Number.parseFloat(style(name).lineHeight) / Number.parseFloat(style(name).fontSize)

describe('the corners of the components from the hooks', () => {
  it('follows the scale of the theme when no hook is set, and the hook wins over the scale', () => {
    renderInBrowser(scoped({ '--enchase-radius-md': '5px' }, <Alert>Saved</Alert>))
    expect(style('alert').borderTopLeftRadius).toBe('5px')

    document.body.innerHTML = ''
    renderInBrowser(scoped({ '--enchase-radius-md': '5px', '--enchase-alert-radius': '3px' }, <Alert>Saved</Alert>))
    expect(style('alert').borderTopLeftRadius).toBe('3px')
  })

  it('takes the corners of each part from its own hook', () => {
    renderInBrowser(
      scoped(
        {
          '--enchase-card-radius': '7px',
          '--enchase-badge-radius': '4px',
          '--enchase-checkbox-box-radius': '6px',
          '--enchase-switch-track-radius': '5px',
          '--enchase-alert-close-radius': '2px'
        },
        <>
          <Card>Card</Card>
          <Badge>Badge</Badge>
          <Checkbox label="Terms" />
          <Switch label="Alerts" />
          <Alert onClose={() => undefined}>Saved</Alert>
        </>
      )
    )

    expect(['card', 'badge', 'checkbox-box', 'switch-track', 'alert-close'].map((name) => style(name).borderTopLeftRadius)).toEqual(['7px', '4px', '6px', '5px', '2px'])
  })

  it('keeps the 2px corners of the checkbox when a theme written before the hooks does not have them', () => {
    render(<Checkbox label="Terms" />)

    expect(style('checkbox-box').borderTopLeftRadius).toBe('2px')
  })

  it('moves the field and its outline together with one hook', () => {
    renderInBrowser(scoped({ '--enchase-input-field-radius': '3px' }, <Input label="Name" />))

    expect([style('input-field').borderTopLeftRadius, style('input-outline').borderTopLeftRadius]).toEqual(['3px', '3px'])
  })

  it('follows the control radius of the theme in the field and its outline', () => {
    renderInBrowser(scoped({ '--enchase-radius-control': '9px' }, <Input label="Name" />))

    expect([style('input-field').borderTopLeftRadius, style('input-outline').borderTopLeftRadius]).toEqual(['9px', '9px'])
  })
})

describe('the text of the components from the hooks', () => {
  it('takes the font size, the weight and the line height of a badge from its hooks, a size at a time', () => {
    renderInBrowser(
      scoped(
        { '--enchase-badge-font-size-sm': '9px', '--enchase-badge-font-size-md': '19px', '--enchase-badge-font-weight': '800', '--enchase-badge-line-height': '2' },
        <>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
        </>
      )
    )

    const badges = [...document.body.querySelectorAll<HTMLElement>('[data-slot="badge"]')].map((badge) => getComputedStyle(badge))

    expect(badges.map((badge) => [badge.fontSize, badge.fontWeight, badge.lineHeight])).toEqual([
      ['9px', '800', '18px'],
      ['19px', '800', '38px']
    ])
  })

  it('takes the line height and the letter spacing of a button from its hooks', () => {
    renderInBrowser(scoped({ '--enchase-button-line-height': '2', '--enchase-button-letter-spacing': '3px' }, <Button>Save</Button>))

    expect(ratio('button')).toBe(2)
    expect(style('button').letterSpacing).toBe('3px')
  })

  it('follows the line height and the letter spacing of the theme when no hook is set', () => {
    renderInBrowser(
      scoped(
        { '--enchase-line-height-normal': '2', '--enchase-line-height-tight': '1.7', '--enchase-letter-spacing-control': '2px' },
        <>
          <Alert>Saved</Alert>
          <Button>Save</Button>
        </>
      )
    )

    expect(ratio('alert')).toBe(2)
    expect(ratio('button')).toBeCloseTo(1.7, 2)
    expect(style('button').letterSpacing).toBe('2px')
  })

  it('keeps the line height of the alert at 1.5 when a theme written before the tokens does not have them', () => {
    render(<Alert>Saved</Alert>)

    expect(ratio('alert')).toBe(1.5)
  })

  it('takes the weight of the legend of a radio group from its hook', () => {
    renderInBrowser(scoped({ '--enchase-radio-group-legend-font-weight': '800', '--enchase-radio-group-legend-font-size': '21px' }, <RadioGroup label="Plan" options={[{ value: 'a', label: 'A' }]} />))

    expect([style('radio-group-legend').fontWeight, style('radio-group-legend').fontSize]).toEqual(['800', '21px'])
  })

  it('takes the underline offset of a link from its hook', () => {
    renderInBrowser(scoped({ '--enchase-link-underline-offset': '5px' }, <Link href="/docs">Docs</Link>))

    expect(style('link').textUnderlineOffset).toBe('5px')
  })
})
