import { describe, expect, it } from 'vitest'

import { escapeCell, renderApiDocs } from '../../../scripts/apiDocs.mjs'

import type { ComponentDoc, HookDoc, IconsDoc } from '../../../scripts/apiDocs.mjs'

const button: ComponentDoc = {
  name: 'Button',
  element: 'button',
  props: [
    { name: 'variant', type: "'primary' | 'secondary'", required: false, default: 'primary', description: 'Estilo visual.' },
    { name: 'label', type: 'string', required: true, description: 'Texto do botão.' },
    { name: 'size', type: "'sm' | 'md'", required: false }
  ]
}

const hook: HookDoc = {
  name: 'useThing',
  signature: 'useThing(id: string): { value: string }',
  note: 'Devolve o valor.',
  members: [{ name: 'value', type: 'string | number' }]
}

const icons: IconsDoc = {
  element: 'svg',
  props: [{ name: 'size', type: 'number', required: false, default: '24', description: 'Lado do ícone.' }],
  items: [
    { name: 'PlusIcon', dataIcon: 'plus', directional: false },
    { name: 'ChevronLeftIcon', dataIcon: 'chevron-left', directional: true }
  ]
}

const render = (components: ComponentDoc[] = [button], hooks: HookDoc[] = [hook], iconsDoc: IconsDoc = icons) => renderApiDocs({ components, hooks, icons: iconsDoc })

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

    expect(markdown).toContain("| `variant` | `'primary' \\| 'secondary'` | `primary` | Estilo visual. |")
    expect(markdown).toContain('| `label` | `string` | *obrigatória* | Texto do botão. |')
  })

  it('shows a dash for an optional prop without a default and leaves the description empty without one', () => {
    expect(render()).toContain('| `size` | `\'sm\' \\| \'md\'` | — |  |')
  })

  it('names the element whose attributes the component accepts and the ref target', () => {
    const markdown = render([button, { name: 'Input', element: 'input', refElement: 'input', props: [] }, { name: 'Shell', element: 'root', props: [] }])

    expect(markdown).toContain('Aceita também os demais atributos de `<button>`, repassados ao elemento.')
    expect(markdown).toContain('Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.')
    expect(markdown).toContain('Aceita também os demais atributos HTML do elemento raiz.')
  })

  it('does not print a made up tag when the element of the ref is unknown', () => {
    const markdown = render([{ name: 'Field', element: 'root', refElement: 'root', props: [] }])

    expect(markdown).toContain('Encaminha o `ref` para o elemento raiz.')
    expect(markdown).not.toContain('<root>')
  })

  it('says so when a component has no props of its own', () => {
    expect(render([{ name: 'Plain', props: [] }])).toContain('### Plain\n\nSem props próprias.')
  })

  it('lists the hooks with the signature, the note and the members of the result', () => {
    const markdown = render()

    expect(markdown).toContain('### useThing\n\n```ts\nuseThing(id: string): { value: string }\n```\n\nDevolve o valor.')
    expect(markdown).toContain("| Membro | Tipo |\n| --- | --- |\n| `value` | `string \\| number` |")
  })

  it('omits the result table of a hook that returns no object', () => {
    expect(render([button], [{ name: 'useFlag', signature: 'useFlag(): boolean', members: [] }])).not.toContain('Retorno:')
  })

  it('sorts components and hooks by name so the output does not depend on the export order', () => {
    const markdown = render([{ name: 'Zeta', props: [] }, { name: 'Alpha', props: [] }], [{ name: 'useB', signature: 'useB()', members: [] }, { name: 'useA', signature: 'useA()', members: [] }])

    expect(markdown.indexOf('### Alpha')).toBeLessThan(markdown.indexOf('### Zeta'))
    expect(markdown.indexOf('### useA')).toBeLessThan(markdown.indexOf('### useB'))
    expect(markdown).toContain('[Alpha](#alpha) · [Zeta](#zeta)')
  })

  it('lists the icons with the props they share, the data-icon and whether they mirror in right-to-left text', () => {
    const markdown = render()

    expect(markdown).toContain('## Ícones')
    expect(markdown).toContain('Exportados por `enchase/icons`')
    expect(markdown).toContain('| `size` | `number` | `24` | Lado do ícone. |')
    expect(markdown).toContain('Aceita também os demais atributos de `<svg>`, repassados ao elemento.')
    expect(markdown).toContain('| Ícone | `data-icon` | Espelha em RTL |\n| --- | --- | --- |\n| `ChevronLeftIcon` | `chevron-left` | sim |\n| `PlusIcon` | `plus` | — |')
  })

  it('puts the icons after the hooks', () => {
    const markdown = render()

    expect(markdown.indexOf('## Hooks')).toBeLessThan(markdown.indexOf('## Ícones'))
  })

  it('ends with a single newline and uses no carriage returns', () => {
    const markdown = render()

    expect(markdown.endsWith('\n')).toBe(true)
    expect(markdown.endsWith('\n\n')).toBe(false)
    expect(markdown).not.toContain('\r')
  })
})
