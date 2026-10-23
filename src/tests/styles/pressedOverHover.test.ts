import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type Rule = { selector: string; properties: string[]; inHoverQuery: boolean; order: number }

const pressed = [':active', ':focus-visible']

const rulesOf = (css: string): Rule[] => {
  const rules: Rule[] = []
  const containers: boolean[] = []
  let prelude = ''
  let selector = ''
  let body: string | undefined

  for (const char of css) {
    if (body !== undefined) {
      if (char === '}') {
        const properties = body.split(';').map((declaration) => declaration.split(':')[0].trim())

        rules.push({ selector: selector.replace(/\s+/g, ' '), properties: properties.filter(Boolean), inHoverQuery: containers.some(Boolean), order: rules.length })
        body = undefined
        prelude = ''
      } else {
        body += char
      }
    } else if (char === '{') {
      const text = prelude.trim()

      if (text.startsWith('@')) containers.push(text.includes('hover: hover'))
      else {
        selector = text
        body = ''
      }

      prelude = ''
    } else if (char === '}') {
      containers.pop()
      prelude = ''
    } else if (char === ';') {
      prelude = ''
    } else {
      prelude += char
    }
  }

  return rules
}

const targets = (rule: Rule, state: string) => rule.selector.split(',').filter((part) => part.includes(state)).map((part) => part.trim().replace(state, ''))

const pressedBeforeHover = (css: string) => {
  const rules = rulesOf(css)
  const hovered = rules.filter((rule) => rule.inHoverQuery && rule.selector.includes(':hover'))

  return rules.flatMap((rule) =>
    pressed.flatMap((state) =>
      targets(rule, state).flatMap((target) =>
        hovered
          .filter((hover) => hover.order > rule.order && targets(hover, ':hover').includes(target) && hover.properties.some((property) => rule.properties.includes(property)))
          .map((hover) => `${rule.selector} comes before ${hover.selector}`)
      )
    )
  )
}

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

describe('the pressed state over the hover state', () => {
  it('finds a pressed rule that comes before the hover rule of the same element and property', () => {
    const before = '.a:active:not(:disabled)::after { opacity: 1; }\n@media (hover: hover) and (pointer: fine) {\n  .a:hover:not(:disabled)::after { opacity: 0.5; }\n}\n'
    const after = '@media (hover: hover) and (pointer: fine) {\n  .a:hover:not(:disabled)::after { opacity: 0.5; }\n}\n.a:focus-visible:not(:disabled)::after,\n.a:active:not(:disabled)::after { opacity: 1; }\n'

    expect(pressedBeforeHover(before)).toEqual(['.a:active:not(:disabled)::after comes before .a:hover:not(:disabled)::after'])
    expect(pressedBeforeHover(after)).toEqual([])
  })

  it('ignores rules that do not touch the same property or the same element', () => {
    const css = '.a:active { transform: scale(0.9); }\n.b:active { color: red; }\n@media (hover: hover) and (pointer: fine) {\n  .a:hover { color: blue; }\n  .c:hover { color: blue; }\n}\n'

    expect(pressedBeforeHover(css)).toEqual([])
  })

  it('has no component that declares the pressed or focus layer before the hover layer, which would let the hover win while the mouse is down', () => {
    const found = Object.fromEntries(
      cssFiles(root)
        .map((file) => [relative(file), pressedBeforeHover(readFileSync(file, 'utf8'))] as const)
        .filter(([, list]) => list.length > 0)
    )

    expect(found).toEqual({})
  })
})
