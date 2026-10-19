import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { ButtonLink } from '@components/common/ButtonLink/index.tsx'

const addStyle = (css: string, where: 'start' | 'end') => {
  const style = document.createElement('style')
  style.textContent = css
  if (where === 'start') document.head.prepend(style)
  else document.head.append(style)

  return style
}

const added: HTMLStyleElement[] = []

afterEach(() => {
  added.splice(0).forEach((style) => style.remove())
})

describe('Button customization in a real browser', () => {
  it('lets the caller className win on layout properties even when its css loads first', () => {
    added.push(addStyle('.mine { block-size: 90px; border-radius: 3px; padding-inline: 7px; }', 'start'))
    render(
      <Button className="mine" size="lg">
        Salvar
      </Button>
    )
    const style = getComputedStyle(page.getByRole('button', { name: 'Salvar' }).element())

    expect(style.height).toBe('90px')
    expect(style.borderTopLeftRadius).toBe('3px')
    expect(style.paddingInlineStart).toBe('7px')
  })

  it('lets the caller className win on colors when its css loads after the library', () => {
    added.push(addStyle('.mine { background-color: rgb(1, 2, 3); color: rgb(4, 5, 6); }', 'end'))
    render(
      <Button className="mine" variant="secondary">
        Salvar
      </Button>
    )
    const style = getComputedStyle(page.getByRole('button', { name: 'Salvar' }).element())

    expect(style.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(style.color).toBe('rgb(4, 5, 6)')
  })

  it('renders a correct button with no global reset at all', () => {
    render(<Button>Salvar</Button>)
    const element = page.getByRole('button', { name: 'Salvar' }).element()
    const style = getComputedStyle(element)

    expect(style.display).toBe('inline-flex')
    expect(style.cursor).toBe('pointer')
    expect(style.borderTopStyle).toBe('solid')
    expect(style.boxSizing).toBe('border-box')
    expect(parseFloat(style.height)).toBeGreaterThanOrEqual(24)
  })

  it('shows the same shape on a link rendered as a button', () => {
    render(<ButtonLink href="/docs">Docs</ButtonLink>)
    const style = getComputedStyle(page.getByRole('link', { name: 'Docs' }).element())

    expect(style.textDecorationLine).toBe('none')
    expect(style.display).toBe('inline-flex')
  })
})

describe('ButtonLink external icon in a real browser', () => {
  it('is narrower without the external icon, which is what an icon only link needs', () => {
    render(
      <>
        <ButtonLink href="https://example.com" target="_blank" aria-label="Com ícone externo">
          <svg width="24" height="24" aria-hidden="true" />
        </ButtonLink>
        <ButtonLink href="https://example.com" target="_blank" externalIcon={false} aria-label="Sem ícone externo">
          <svg width="24" height="24" aria-hidden="true" />
        </ButtonLink>
      </>
    )
    const withIcon = page.getByRole('link', { name: 'Com ícone externo' }).element()
    const withoutIcon = page.getByRole('link', { name: 'Sem ícone externo' }).element()
    const widthOf = (element: Element) => element.getBoundingClientRect().width

    expect(withIcon.querySelectorAll('svg')).toHaveLength(2)
    expect(withoutIcon.querySelectorAll('svg')).toHaveLength(1)
    expect(widthOf(withIcon) - widthOf(withoutIcon)).toBeGreaterThanOrEqual(16)
  })

  it('does not leave the hidden warning taking up room', () => {
    render(
      <ButtonLink href="https://example.com" target="_blank" externalIcon={false}>
        Site
      </ButtonLink>
    )
    const link = page.getByRole('link', { name: /Site/ }).element()
    const hidden = link.querySelector('[data-slot="visually-hidden"]') as HTMLElement

    expect(hidden).not.toBeNull()
    expect(getComputedStyle(hidden).position).toBe('absolute')
    expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1)
  })
})

describe('Button hover in a real browser', () => {
  const hoverRules = () => {
    const rules: { selector: string; gated: boolean }[] = []

    const visit = (list: CSSRuleList, gated: boolean) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSMediaRule) visit(rule.cssRules, gated || (rule.conditionText.includes('hover: hover') && rule.conditionText.includes('pointer: fine')))
        else if (rule instanceof CSSStyleRule) {
          if (rule.selectorText.includes(':hover') && rule.selectorText.includes('button')) rules.push({ selector: rule.selectorText, gated })
          if (rule.cssRules.length > 0) visit(rule.cssRules, gated)
        }
      }
    }

    for (const sheet of Array.from(document.styleSheets)) visit(sheet.cssRules, false)

    return rules
  }

  it('keeps every button hover rule behind the fine hover media query', () => {
    render(<Button>Salvar</Button>)
    const rules = hoverRules()

    expect(rules.length).toBeGreaterThan(0)
    expect(rules.filter((rule) => !rule.gated).map((rule) => rule.selector)).toEqual([])
  })

  it('applies the hover state with a fine pointer', async () => {
    render(<Button variant="primary">Salvar</Button>)
    const button = page.getByRole('button', { name: 'Salvar' })

    expect(matchMedia('(hover: hover) and (pointer: fine)').matches).toBe(true)
    await button.hover()

    expect(parseFloat(getComputedStyle(button.element(), '::after').opacity)).toBeGreaterThan(0)
  })
})
