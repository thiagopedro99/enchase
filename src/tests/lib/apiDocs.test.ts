import { describe, expect, it } from 'vitest'

import { escapeCell, renderApiDocs } from '../../../scripts/apiDocs.mjs'

import type { ComponentDoc, CssHooksGroup, HookDoc, IconsDoc } from '../../../scripts/apiDocs.mjs'

const button: ComponentDoc = {
  name: 'Button',
  element: 'button',
  props: [
    { name: 'variant', type: "'primary' | 'secondary'", required: false, default: 'primary', description: 'Visual style.' },
    { name: 'label', type: 'string', required: true, description: 'Button text.' },
    { name: 'size', type: "'sm' | 'md'", required: false }
  ]
}

const hook: HookDoc = {
  name: 'useThing',
  signature: 'useThing(id: string): { value: string }',
  note: 'Returns the value.',
  members: [{ name: 'value', type: 'string | number' }]
}

const icons: IconsDoc = {
  element: 'svg',
  props: [{ name: 'size', type: 'number', required: false, default: '24', description: 'Side of the icon.' }],
  items: [
    { name: 'PlusIcon', dataIcon: 'plus', directional: false },
    { name: 'ChevronLeftIcon', dataIcon: 'chevron-left', directional: true }
  ]
}

const cssHooks: CssHooksGroup[] = [
  {
    component: 'Alert',
    hooks: [
      { name: '--enchase-alert-radius', owner: 'Alert', default: '0.75rem', token: '--enchase-radius-md', properties: ['border-radius'], components: ['Alert'] },
      { name: '--enchase-alert-title-font-weight', owner: 'Alert', default: '18px', properties: ['font-weight', 'line-height'], components: ['Alert', 'Modal'] }
    ]
  }
]

const render = (components: ComponentDoc[] = [button], hooks: HookDoc[] = [hook], iconsDoc: IconsDoc = icons, groups: CssHooksGroup[] = []) => renderApiDocs({ components, hooks, icons: iconsDoc, cssHooks: groups })

describe('escapeCell', () => {
  it('escapes the pipes so a union stays in one table cell', () => {
    expect(escapeCell("'a' | 'b'")).toBe("'a' \\| 'b'")
  })

  it('joins the lines and trims the ends', () => {
    expect(escapeCell('  first\n  second\r\nthird  ')).toBe('first second third')
  })
})

describe('renderApiDocs', () => {
  it('writes one table row per prop with the type, the default and the description', () => {
    const markdown = render()

    expect(markdown).toContain("| `variant` | `'primary' \\| 'secondary'` | `primary` | Visual style. |")
    expect(markdown).toContain('| `label` | `string` | *required* | Button text. |')
  })

  it('shows a dash for an optional prop without a default and leaves the description empty without one', () => {
    expect(render()).toContain('| `size` | `\'sm\' \\| \'md\'` | — |  |')
  })

  it('names the element whose attributes the component accepts and the ref target', () => {
    const markdown = render([button, { name: 'Input', element: 'input', refElement: 'input', props: [] }, { name: 'Shell', element: 'root', props: [] }])

    expect(markdown).toContain('Also accepts the other attributes of `<button>`, passed on to the element.')
    expect(markdown).toContain('Also accepts the other attributes of `<input>`, passed on to the element. Forwards the `ref` to `<input>`.')
    expect(markdown).toContain('Also accepts the other HTML attributes of the root element.')
  })

  it('does not print a made up tag when the element of the ref is unknown', () => {
    const markdown = render([{ name: 'Field', element: 'root', refElement: 'root', props: [] }])

    expect(markdown).toContain('Forwards the `ref` to the root element.')
    expect(markdown).not.toContain('<root>')
  })

  it('says so when a component has no props of its own', () => {
    expect(render([{ name: 'Plain', props: [] }])).toContain('### Plain\n\nNo props of its own.')
  })

  it('lists the hooks with the signature, the note and the members of the result', () => {
    const markdown = render()

    expect(markdown).toContain('### useThing\n\n```ts\nuseThing(id: string): { value: string }\n```\n\nReturns the value.')
    expect(markdown).toContain("| Member | Type |\n| --- | --- |\n| `value` | `string \\| number` |")
  })

  it('omits the result table of a hook that returns no object', () => {
    expect(render([button], [{ name: 'useFlag', signature: 'useFlag(): boolean', members: [] }])).not.toContain('Returns:')
  })

  it('sorts components and hooks by name so the output does not depend on the export order', () => {
    const markdown = render([{ name: 'Zeta', props: [] }, { name: 'Alpha', props: [] }], [{ name: 'useB', signature: 'useB()', members: [] }, { name: 'useA', signature: 'useA()', members: [] }])

    expect(markdown.indexOf('### Alpha')).toBeLessThan(markdown.indexOf('### Zeta'))
    expect(markdown.indexOf('### useA')).toBeLessThan(markdown.indexOf('### useB'))
    expect(markdown).toContain('[Alpha](#alpha) · [Zeta](#zeta)')
  })

  it('lists the icons with the props they share, the data-icon and whether they mirror in right-to-left text', () => {
    const markdown = render()

    expect(markdown).toContain('## Icons')
    expect(markdown).toContain('Exported by `enchase/icons`')
    expect(markdown).toContain('| `size` | `number` | `24` | Side of the icon. |')
    expect(markdown).toContain('Also accepts the other attributes of `<svg>`, passed on to the element.')
    expect(markdown).toContain('| Icon | `data-icon` | Mirrors in RTL |\n| --- | --- | --- |\n| `ChevronLeftIcon` | `chevron-left` | yes |\n| `PlusIcon` | `plus` | — |')
  })

  it('puts the icons after the hooks', () => {
    const markdown = render()

    expect(markdown.indexOf('## Hooks')).toBeLessThan(markdown.indexOf('## Icons'))
  })

  it('lists the css hooks of each component with the default, the token it follows and the property it changes', () => {
    const markdown = render([button], [hook], icons, cssHooks)

    expect(markdown).toContain('## CSS hooks')
    expect(markdown).toContain('### Alert\n\n| Hook | Default | Property |\n| --- | --- | --- |')
    expect(markdown).toContain('| `--enchase-alert-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |')
    expect(markdown).toContain('| `--enchase-alert-title-font-weight` | `18px` | `font-weight`, `line-height` (also in Modal) |')
  })

  it('leaves the css hooks out when there are none, and puts them after the icons', () => {
    expect(render()).not.toContain('CSS hooks')

    const markdown = render([button], [hook], icons, cssHooks)

    expect(markdown.indexOf('## Icons')).toBeLessThan(markdown.indexOf('## CSS hooks'))
  })

  it('ends with a single newline and uses no carriage returns', () => {
    const markdown = render()

    expect(markdown.endsWith('\n')).toBe(true)
    expect(markdown.endsWith('\n\n')).toBe(false)
    expect(markdown).not.toContain('\r')
  })
})
