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

export const needsOf = ({ groups, js }) => {
  const keys = groups.map(({ key }) => key)
  const owner = new Map(groups.flatMap(({ key, files }) => files.map((path) => [jsOf(path), key])))

  return Object.fromEntries(
    groups.map(({ key, folder }) => {
      const entries = Object.keys(js).filter((file) => file.startsWith(folder))

      if (entries.length === 0) throw new Error(`the component ${key} has no javascript in ${folder}, from which its css is reached`)

      const owners = new Set([...reachable(js, entries)].flatMap((file) => (owner.has(file) ? [owner.get(file)] : [])))

      return [key, keys.filter((other) => other !== key && owners.has(other))]
    })
  )
}

const gzipOf = (css) => gzipSync(css, { level: 9 }).length

export const cssComponents = ({ modules, js }) => {
  const grouped = new Map()

  for (const module of modules) {
    const { key, folder } = componentOf(module.path)

    if (!grouped.has(key)) grouped.set(key, { key, folder, modules: [] })

    grouped.get(key).modules.push(module)
  }

  const groups = [...grouped.values()].map(({ key, folder, modules: own }) => ({ key, folder, files: own.map((module) => module.path), modules: own }))
  const needs = needsOf({ groups, js })

  return groups.map(({ key, files, modules: own }) => {
    const css = joinModules(own)

    return { key, file: `${key}.css`, files, needs: needs[key], css, bytes: Buffer.byteLength(css), gzip: gzipOf(css) }
  })
}

export const cssMap = (components) => ({
  format: formatVersion,
  components: Object.fromEntries(components.map(({ key, file, needs, files, bytes, gzip }) => [key, { file, needs, files, bytes, gzip }]))
})

const rightToLeft = /\[dir=["']?rtl["']?\]/g

const countOf = (css, pattern) => (css.match(pattern) ?? []).length

export const cssFileProblems = ({ map, files, styles, sources, js }) => {
  const problems = []
  const entries = Object.entries(map.components ?? {})
  const names = Object.keys(files)

  if (map.format !== formatVersion) problems.push(`css/index.json has the format ${map.format}, and this build writes the format ${formatVersion}`)

  for (const [key, component] of entries) {
    const css = files[component.file]

    if (component.file !== `${key}.css`) problems.push(`css/index.json gives ${key} the file ${component.file}, and it must be ${key}.css`)

    if (css === undefined) {
      problems.push(`css/${component.file}, the file of ${key}, does not exist`)
      continue
    }

    if (Buffer.byteLength(css) !== component.bytes) problems.push(`css/index.json says that ${component.file} has ${component.bytes} bytes, and it has ${Buffer.byteLength(css)}`)
    if (gzipOf(css) !== component.gzip) problems.push(`css/index.json says that ${component.file} has ${component.gzip} bytes in gzip, and it has ${gzipOf(css)}`)
    if (!css.endsWith('\n') || css.endsWith('\n\n')) problems.push(`css/${component.file} must end with one newline`)
    if (css.includes('$vite$')) problems.push(`css/${component.file} has the marker that Vite writes at the end of a stylesheet, which belongs to styles.css alone`)
    if (css.includes('data-density')) problems.push(`css/${component.file} reads data-density, which only theme.css may do`)
    if (css.includes(':dir(') || css.includes(':lang(')) problems.push(`css/${component.file} has a :dir() or a :lang() selector, which the sources do not: a right to left rule was rewritten`)
    if (!keepsOrder(css, styles)) problems.push(`css/${component.file} has rules that styles.css does not have, or in another order than styles.css`)
  }

  for (const name of names) if (!entries.some(([, component]) => component.file === name)) problems.push(`css/${name} is not in css/index.json`)

  const owned = entries.flatMap(([key, component]) => component.files.map((path) => [path, key]))
  const misplaced = owned.filter(([path, key]) => {
    try {
      return componentOf(path).key !== key
    } catch {
      return true
    }
  })
  const repeated = owned.filter(([path], index) => owned.findIndex(([other]) => other === path) !== index)
  const missing = sources.filter((source) => !owned.some(([path]) => path === source))
  const stray = owned.filter(([path]) => !sources.includes(path))

  if (misplaced.length > 0) problems.push(`css/index.json lists css modules under a component that is not the one of their folder: ${misplaced.map(([path, key]) => `${path} under ${key}`).join(', ')}`)
  if (repeated.length > 0) problems.push(`css/index.json lists a css module in more than one file: ${repeated.map(([path]) => path).join(', ')}`)
  if (missing.length > 0) problems.push(`css modules of the sources that no file of css/ has: ${missing.join(', ')}`)
  if (stray.length > 0) problems.push(`css/index.json lists css modules that the sources do not have: ${stray.map(([path]) => path).join(', ')}`)

  if (names.length > 0 && !sameRules(styles, Object.values(files))) problems.push('the rules of the files of css/, all together, are not the rules of styles.css: one is missing, repeated or different')

  const wanted = countOf(styles, rightToLeft)
  const found = Object.values(files).reduce((sum, css) => sum + countOf(css, rightToLeft), 0)

  if (found !== wanted) problems.push(`the files of css/ have ${found} [dir=rtl] selectors and styles.css has ${wanted}`)

  if (problems.length === 0) {
    const groups = entries.map(([key, component]) => ({ key, folder: componentOf(component.files[0]).folder, files: component.files }))
    const expected = needsOf({ groups, js })
    const keys = entries.map(([key]) => key)

    for (const [key, component] of entries) {
      if (component.needs.join() !== expected[key].join()) problems.push(`css/index.json says that ${key} needs ${component.needs.join(', ') || 'nothing'}, and its javascript reaches the css of ${expected[key].join(', ') || 'nothing'}`)

      for (const need of component.needs) if (keys.indexOf(need) < 0 || keys.indexOf(need) > keys.indexOf(key)) problems.push(`css/index.json says that ${key} needs ${need}, which is not before it in the order of styles.css`)
    }
  }

  return problems
}
