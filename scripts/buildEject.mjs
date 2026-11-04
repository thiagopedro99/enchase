import ts from 'typescript'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
const out = join(root, 'eject')
const filesOut = join(out, 'files')
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const tsconfig = JSON.parse(readFileSync(join(root, 'tsconfig.app.json'), 'utf8'))
const aliases = Object.entries(tsconfig.compilerOptions.paths)
  .filter(([key, [target]]) => key.startsWith('@') && key.endsWith('/*') && target.startsWith('./src/'))
  .map(([key, [target]]) => [key.slice(0, -1), join(root, target.slice(0, -1))])

const suffixes = ['', '.ts', '.tsx', '/index.ts', '/index.tsx']
const codeFile = /\.(ts|tsx)$/
const entryPattern = /^src\/components\/(common\/[^/]+|layout|navbar|footer)\/index\.tsx$/
const allowedPackages = /^(react|react-dom)(\/.*)?$|^enchase(\/(icons|locales|theme))?$/
const toPosix = (path) => path.split(sep).join('/')
const where = (file) => toPosix(relative(root, file))

const resolveSpecifier = (from, specifier) => {
  const alias = aliases.find(([prefix]) => specifier.startsWith(prefix))
  const base = specifier.startsWith('.') ? resolve(dirname(from), specifier) : alias ? join(alias[1], specifier.slice(alias[0].length)) : null

  if (base === null) return { external: specifier }

  const file = suffixes.map((suffix) => base + suffix).find((candidate) => existsSync(candidate) && statSync(candidate).isFile())

  if (!file) throw new Error(`${where(from)} imports ${specifier}, which does not exist`)

  return { file }
}

const parse = (file) => ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)

const hasModifier = (node, kind) => node.modifiers?.some((modifier) => modifier.kind === kind) ?? false

const exportInfo = new Map()

const exportsOf = (file) => {
  if (exportInfo.has(file)) return exportInfo.get(file)

  const source = parse(file)
  const info = { local: new Set(), types: new Set(), named: new Map(), stars: [], defaultOf: null }
  const bindings = new Map()

  exportInfo.set(file, info)

  for (const node of source.statements) {
    if (!ts.isImportDeclaration(node) || !node.importClause) continue

    const { name, namedBindings } = node.importClause
    const spec = node.moduleSpecifier.text

    if (name) bindings.set(name.text, { spec, imported: 'default' })
    if (namedBindings && ts.isNamedImports(namedBindings)) namedBindings.elements.forEach((element) => bindings.set(element.name.text, { spec, imported: (element.propertyName ?? element.name).text }))
  }

  for (const node of source.statements) {
    if (ts.isExportDeclaration(node)) {
      const spec = node.moduleSpecifier?.text

      if (!node.exportClause && spec) info.stars.push(spec)

      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          const imported = (element.propertyName ?? element.name).text
          const from = spec ? { spec, imported } : bindings.get(imported)
          const typeOnly = node.isTypeOnly || element.isTypeOnly

          if (from) info.named.set(element.name.text, { ...from, typeOnly })
          else info.local.add(element.name.text)
          if (typeOnly) info.types.add(element.name.text)
        }
      }
    } else if (ts.isExportAssignment(node)) {
      info.local.add('default')
      if (ts.isIdentifier(node.expression)) info.defaultOf = node.expression.text
    } else if (hasModifier(node, ts.SyntaxKind.ExportKeyword)) {
      if (hasModifier(node, ts.SyntaxKind.DefaultKeyword)) info.local.add('default')
      else if (ts.isVariableStatement(node)) node.declarationList.declarations.forEach((declaration) => ts.isIdentifier(declaration.name) && info.local.add(declaration.name.text))
      else if (node.name) {
        info.local.add(node.name.text)
        if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) info.types.add(node.name.text)
      }
    }
  }

  return info
}

const originOf = (file, name, seen = new Set()) => {
  const key = `${file}:${name}`

  if (seen.has(key)) return null

  seen.add(key)

  const info = exportsOf(file)
  const named = info.named.get(name)

  if (named) {
    const target = resolveSpecifier(file, named.spec)
    const origin = target.file ? originOf(target.file, named.imported, seen) : null

    return origin && { ...origin, typeOnly: origin.typeOnly || named.typeOnly }
  }

  if (info.local.has(name)) return { file, name, typeOnly: info.types.has(name) }

  for (const spec of info.stars) {
    const target = resolveSpecifier(file, spec)
    const found = target.file ? originOf(target.file, name, seen) : null

    if (found) return found
  }

  return null
}

const publicEntries = [
  ['enchase', 'index.ts'],
  ['enchase/icons', 'icons.ts'],
  ['enchase/locales', 'locales.ts'],
  ['enchase/theme', 'theme.ts']
]

const publicNames = new Map()
const published = []

for (const [specifier, name] of publicEntries) {
  const entry = join(root, 'lib', name)
  const info = exportsOf(entry)

  for (const exported of [...info.named.keys(), ...info.local]) {
    const origin = originOf(entry, exported)

    if (!origin) throw new Error(`lib/${name} exports ${exported}, which does not lead to a declaration`)

    const names = publicNames.get(origin.file) ?? new Map()

    if (!names.has(origin.name)) names.set(origin.name, { specifier, exported })

    publicNames.set(origin.file, names)
    published.push({ specifier, exported, ...origin })
  }
}

for (const [file, names] of publicNames) {
  const alias = exportsOf(file).defaultOf

  if (alias && names.has(alias) && !names.has('default')) names.set('default', names.get(alias))
}

const ownerOf = (file) => {
  const parts = relative(src, file).split(sep)

  if (parts[0] !== 'components') return null
  if (parts[1] === 'common') return parts.length > 3 ? `common/${parts[2]}` : null

  return ['layout', 'navbar', 'footer'].includes(parts[1]) ? parts[1] : null
}

const relativeSpecifier = (from, target) => {
  const path = posix.relative(toPosix(dirname(from)), toPosix(target))
  const prefixed = path.startsWith('.') ? path : `./${path}`

  return codeFile.test(prefixed) ? prefixed.replace(codeFile, '').replace(/\/index$/, '') : prefixed
}

const elementsOf = (node) => {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause

    if (!clause || (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings))) return null

    const items = clause.namedBindings ? clause.namedBindings.elements.map((element) => ({ imported: (element.propertyName ?? element.name).text, local: element.name.text, typeOnly: element.isTypeOnly })) : []

    return { items: clause.name ? [{ imported: 'default', local: clause.name.text, typeOnly: false }, ...items] : items, typeOnly: clause.isTypeOnly }
  }

  if (!node.exportClause || !ts.isNamedExports(node.exportClause)) return null

  return { items: node.exportClause.elements.map((element) => ({ imported: (element.propertyName ?? element.name).text, local: element.name.text, typeOnly: element.isTypeOnly })), typeOnly: node.isTypeOnly }
}

const binding = (item, imported) => `${item.typeOnly ? 'type ' : ''}${imported === item.local ? imported : `${imported} as ${item.local}`}`

const statements = (node, elements, names, specifier) => {
  const verb = ts.isImportDeclaration(node) ? 'import' : 'export'
  const type = elements.typeOnly ? 'type ' : ''
  const pub = elements.items.filter((item) => names.has(item.imported))
  const kept = elements.items.filter((item) => !names.has(item.imported))
  const groups = pub.reduce((map, item) => map.set(names.get(item.imported).specifier, [...(map.get(names.get(item.imported).specifier) ?? []), item]), new Map())
  const lines = [...groups].map(([from, items]) => `${verb} ${type}{ ${items.map((item) => binding(item, names.get(item.imported).exported)).join(', ')} } from '${from}'`)

  if (kept.length === 0) return { lines, local: false }

  const asDefault = verb === 'import' ? kept.find((item) => item.imported === 'default') : undefined
  const rest = kept.filter((item) => item !== asDefault)
  const braces = rest.length > 0 ? `{ ${rest.map((item) => binding(item, item.imported)).join(', ')} }` : ''
  const clause = [asDefault?.local, braces].filter(Boolean).join(', ')

  return { lines: [...lines, `${verb} ${type}${clause} from '${specifier}'`], local: true }
}

const analysis = new Map()

const analyze = (file) => {
  if (analysis.has(file)) return analysis.get(file)

  const source = parse(file)
  const edits = []
  const deps = new Set()

  const retarget = (literal, target) => {
    const specifier = relativeSpecifier(file, target)

    if (resolveSpecifier(file, specifier).file !== target) throw new Error(`${where(file)}: ${specifier} would resolve to a file other than ${where(target)}`)

    edits.push({ start: literal.getStart(source) + 1, end: literal.getEnd() - 1, text: specifier })
    deps.add(target)

    return specifier
  }

  const visit = (node) => {
    const literal = (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier ? node.moduleSpecifier : null

    if (literal) {
      const resolved = resolveSpecifier(file, literal.text)

      if (resolved.file) {
        const names = publicNames.get(resolved.file)
        const sameFamily = ownerOf(file) !== null && ownerOf(file) === ownerOf(resolved.file)
        const elements = names && !sameFamily ? elementsOf(node) : null
        const covered = elements && elements.items.length > 0 && elements.items.some((item) => names.has(item.imported))

        if (covered) {
          const specifier = relativeSpecifier(file, resolved.file)
          const { lines, local } = statements(node, elements, names, specifier)

          if (local) {
            if (resolveSpecifier(file, specifier).file !== resolved.file) throw new Error(`${where(file)}: ${specifier} would resolve to a file other than ${where(resolved.file)}`)
            deps.add(resolved.file)
          }

          edits.push({ start: node.getStart(source), end: node.getEnd(), text: lines.join('\n') })
        } else retarget(literal, resolved.file)
      }
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
      const resolved = resolveSpecifier(file, node.arguments[0].text)

      if (resolved.file) retarget(node.arguments[0], resolved.file)
    }

    ts.forEachChild(node, visit)
  }

  visit(source)

  const text = edits.sort((a, b) => b.start - a.start).reduce((result, edit) => result.slice(0, edit.start) + edit.text + result.slice(edit.end), readFileSync(file, 'utf8'))
  const result = { text, deps: [...deps] }

  analysis.set(file, result)

  return result
}

const closureOf = (entry) => {
  const files = new Set()

  const visit = (file) => {
    if (files.has(file)) return

    files.add(file)

    if (codeFile.test(file)) analyze(file).deps.forEach(visit)
  }

  visit(entry)

  return [...files]
}

const roots = published.filter(({ specifier, exported, file, typeOnly }) => specifier === 'enchase' && !typeOnly && /^[A-Z]/.test(exported) && entryPattern.test(where(file))).sort((a, b) => a.exported.localeCompare(b.exported))

if (roots.length === 0) throw new Error('lib/index.ts exports no component that can be ejected')

const entries = {}
const components = {}
const written = new Set()

rmSync(out, { recursive: true, force: true })

for (const { exported, file } of roots) {
  const entry = toPosix(relative(src, file))

  components[exported] = entry
  entries[entry] ??= { files: closureOf(file).map((member) => toPosix(relative(src, member))).sort() }
}

const entryFiles = new Set(Object.keys(entries))

for (const files of Object.values(entries).map((entry) => entry.files)) {
  for (const name of files) {
    if (written.has(name)) continue

    const file = join(src, name)
    const target = join(filesOut, name)

    written.add(name)
    mkdirSync(dirname(target), { recursive: true })

    if (!codeFile.test(name)) copyFileSync(file, target)
    else writeFileSync(target, entryFiles.has(name) ? `'use client'\n\n${analyze(file).text}` : analyze(file).text)
  }
}

const problems = []

for (const name of written) {
  const target = join(filesOut, name)

  if (/(^|\/)(tests|tests-browser|docs)\//.test(name) || /\.(test|spec|stories)\./.test(name)) problems.push(`${name} is a test, a story or a doc, and the kit must not ship it`)
  if (!codeFile.test(name)) continue

  const text = readFileSync(target, 'utf8')

  if (entryFiles.has(name) && !text.startsWith("'use client'\n")) problems.push(`${name} is the entry of a component and must start with the "use client" directive`)

  const source = ts.createSourceFile(target, text, ts.ScriptTarget.Latest, true, name.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)

  const check = (literal) => {
    const specifier = literal.text

    if (specifier.startsWith('.')) {
      const base = resolve(dirname(target), specifier)
      const found = suffixes.map((suffix) => base + suffix).find((candidate) => existsSync(candidate) && statSync(candidate).isFile())

      if (!found) problems.push(`${name} imports ${specifier}, which the kit does not have`)
    } else if (!allowedPackages.test(specifier)) problems.push(`${name} imports ${specifier}, and a copy may only import react, react-dom and enchase`)
  }

  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) check(node.moduleSpecifier)
    else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) check(node.arguments[0])

    ts.forEachChild(node, visit)
  }

  visit(source)
}

if (problems.length > 0) {
  console.error(`the eject kit is not as it should be:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`)
  process.exit(1)
}

writeFileSync(join(out, 'index.json'), `${JSON.stringify({ format: 1, version: manifest.version, license: manifest.license, repository: manifest.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''), components, entries }, null, 2)}\n`)

console.log(`eject kit written: ${Object.keys(components).length} components, ${Object.keys(entries).length} entries, ${written.size} files`)
