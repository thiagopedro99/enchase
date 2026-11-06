import { posix } from 'node:path'
import { gzipSync } from 'node:zlib'

export const formatVersion = 1

const marker = /\n?\/\*\$vite\$:\d+\*\/\s*$/

export const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

export const componentOf = (modulePath) => {
  const common = /^components\/common\/([^/]+)\//.exec(modulePath)

  if (common) return { key: kebab(common[1]), folder: `components/common/${common[1]}/` }

  const own = /^components\/([^/]+)\//.exec(modulePath)

  if (own) return { key: kebab(own[1]), folder: `components/${own[1]}/` }

  throw new Error(`the css module ${modulePath} is not inside the folder of a component`)
}

export const jsOf = (modulePath) => modulePath.replace(/\.css$/, '.js')

export const firstRule = (css) => css.slice(0, css.indexOf('}') + 1)

export const orderModules = (styles, modules) =>
  modules
    .map(({ path, css }) => {
      const rule = firstRule(css)
      const offset = rule === '' ? -1 : styles.indexOf(rule)

      if (offset < 0) throw new Error(`the first rule of ${path} is not in styles.css, so its place in the order of the file is unknown`)
      if (styles.indexOf(rule, offset + 1) >= 0) throw new Error(`the first rule of ${path} appears more than once in styles.css, so its place in the order of the file is ambiguous`)

      return { path, css, offset }
    })
    .sort((first, second) => first.offset - second.offset)
    .map(({ path, css }) => ({ path, css }))

export const joinModules = (modules) => `${modules.map(({ css }) => css.replace(/\n$/, '')).join('')}\n`

const parse = (text, start, nested) => {
  const items = []
  let current = ''
  let parentheses = 0
  let quote = ''
  let index = start

  const flush = () => {
    if (current.trim() !== '') items.push({ declaration: current.trim() })

    current = ''
  }

  while (index < text.length) {
    const char = text[index]

    if (quote) {
      current += char

      if (char === '\\') {
        current += text[index + 1] ?? ''
        index += 1
      } else if (char === quote) quote = ''
    } else if (char === '/' && text[index + 1] === '*') {
      const end = text.indexOf('*/', index + 2)

      index = end < 0 ? text.length : end + 1
    } else if (char === '"' || char === "'") {
      quote = char
      current += char
    } else if (char === '(') {
      parentheses += 1
      current += char
    } else if (char === ')') {
      parentheses -= 1
      current += char
    } else if (parentheses === 0 && char === '{') {
      const [children, end] = parse(text, index + 1, true)

      items.push({ rule: current.trim(), children })
      current = ''
      index = end
    } else if (parentheses === 0 && char === ';') flush()
    else if (parentheses === 0 && char === '}') {
      if (!nested) throw new Error('the css has a closing brace with no rule to close')

      flush()

      return [items, index]
    } else current += char

    index += 1
  }

  if (nested) throw new Error('the css ends inside a rule')

  flush()

  return [items, index]
}

const render = (items, sorted) => {
  const output = []
  let run = []

  const flush = () => {
    output.push(...(sorted ? run.sort() : run).map((declaration) => `${declaration};`))
    run = []
  }

  for (const item of items) {
    if (item.declaration !== undefined) run.push(item.declaration)
    else {
      flush()
      output.push(`${item.rule}{${render(item.children, true)}}`)
    }
  }

  flush()

  return output.join('')
}

export const rulesOf = (css) => parse(css.replace(marker, ''), 0, false)[0].map((item) => render([item], false))

export const normalizeCss = (css) => rulesOf(css).join('')

const isSubsequence = (part, whole) => {
  let position = 0

  for (const item of part) {
    position = whole.indexOf(item, position)

    if (position < 0) return false

    position += 1
  }

  return true
}

export const keepsOrder = (fileCss, stylesCss) => isSubsequence(rulesOf(fileCss), rulesOf(stylesCss))

export const sameRules = (stylesCss, fileCssList) => {
  const expected = rulesOf(stylesCss).sort()
  const found = fileCssList.flatMap(rulesOf).sort()

  return expected.length === found.length && expected.every((rule, index) => rule === found[index])
}

export const importsOf = (source) => [...source.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g)].map((match) => match[1])

export const reachable = (js, entries) => {
  const seen = new Set()

  const visit = (file) => {
    if (seen.has(file) || !(file in js)) return

    seen.add(file)

    for (const specifier of importsOf(js[file])) if (specifier.startsWith('.') && specifier.endsWith('.js')) visit(posix.join(posix.dirname(file), specifier))
  }

  entries.forEach(visit)

  return seen
}

export const cssComponents = ({ modules, js }) => {
  const groups = new Map()

  for (const module of modules) {
    const { key, folder } = componentOf(module.path)

    if (!groups.has(key)) groups.set(key, { key, folder, modules: [] })

    groups.get(key).modules.push(module)
  }

  const keys = [...groups.keys()]
  const owner = new Map(modules.map((module) => [jsOf(module.path), componentOf(module.path).key]))

  return keys.map((key) => {
    const { folder, modules: own } = groups.get(key)
    const entries = Object.keys(js).filter((file) => file.startsWith(folder))

    if (entries.length === 0) throw new Error(`the component ${key} has no javascript in ${folder}, from which its css is reached`)

    const owners = new Set([...reachable(js, entries)].flatMap((file) => (owner.has(file) ? [owner.get(file)] : [])))
    const css = joinModules(own)

    return {
      key,
      file: `${key}.css`,
      files: own.map((module) => module.path),
      needs: keys.filter((other) => other !== key && owners.has(other)),
      css,
      bytes: Buffer.byteLength(css),
      gzip: gzipSync(css, { level: 9 }).length
    }
  })
}

export const cssMap = (components) => ({
  format: formatVersion,
  components: Object.fromEntries(components.map(({ key, file, needs, files, bytes, gzip }) => [key, { file, needs, files, bytes, gzip }]))
})
