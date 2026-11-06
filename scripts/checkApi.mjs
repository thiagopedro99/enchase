import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import ts from 'typescript'

import { breaksFile, checkNotes, notesOf, validBreaksFile } from './apiBreaks.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const windows = process.platform === 'win32'
const experimentalPrefix = './experimental/'
const stylePrefix = './styles/'
const inputOwner = /(Props|Options|Input)$/

const squash = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\s*[;,]$/, '')
    .trim()

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))

const hideBindings = (node, source) => {
  const base = node.getStart(source)
  const edits = []

  const walk = (child) => {
    if (ts.isParameter(child) && (ts.isObjectBindingPattern(child.name) || ts.isArrayBindingPattern(child.name))) {
      edits.push({ from: child.name.getStart(source) - base, to: child.name.getEnd() - base, mark: ts.isObjectBindingPattern(child.name) ? '{ ... }' : '[ ... ]' })

      return
    }

    ts.forEachChild(child, walk)
  }

  walk(node)

  return edits.reduceRight((text, { from, to, mark }) => `${text.slice(0, from)}${mark}${text.slice(to)}`, node.getText(source))
}

const sorted = (items) => [...new Set(items)].sort()

const flatten = (value, prefix = '') => (typeof value === 'string' ? { [prefix || 'default']: value } : Object.entries(value).reduce((all, [condition, inner]) => ({ ...all, ...flatten(inner, prefix ? `${prefix}.${condition}` : condition) }), {}))

const opening = '([{<'

const closing = ')]}>'

export const topLevelIndex = (text, needle) => {
  let depth = 0
  let quote = ''

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (quote) {
      if (char === '\\') index += 1
      else if (char === quote) quote = ''
    } else if (char === "'" || char === '"' || char === '`') quote = char
    else if (depth === 0 && text.startsWith(needle, index)) return index
    else if (opening.includes(char)) depth += 1
    else if (closing.includes(char) && !(char === '>' && text[index - 1] === '=')) depth -= 1
  }

  return -1
}

const unwrap = (text) => {
  if (!text.startsWith('(') || !text.endsWith(')')) return text

  let depth = 0

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '(') depth += 1
    else if (text[index] === ')') depth -= 1

    if (depth === 0 && index < text.length - 1) return text
  }

  return unwrap(text.slice(1, -1).trim())
}

export const unionMembers = (text) => {
  const members = []
  let rest = text

  for (let at = topLevelIndex(rest, '|'); at !== -1; at = topLevelIndex(rest, '|')) {
    members.push(rest.slice(0, at))
    rest = rest.slice(at + 1)
  }

  members.push(rest)

  return members.map((member) => unwrap(member.trim())).filter(Boolean)
}

const typePartOf = (text) => {
  if (/^(function|class|interface|enum|namespace)\s/.test(text)) return undefined

  const separator = text.startsWith('type ') ? ' = ' : ':'
  const at = topLevelIndex(text, separator)

  if (at === -1) return undefined

  const prefix = text.slice(0, at)

  return prefix.includes('(') && !text.startsWith('type ') ? undefined : { prefix, type: text.slice(at + separator.length).trim() }
}

export const isWidened = (before, after) => {
  const old = typePartOf(before)
  const next = typePartOf(after)

  if (!old || !next || old.prefix !== next.prefix) return false

  const oldMembers = unionMembers(old.type)
  const nextMembers = unionMembers(next.type)

  return nextMembers.length > oldMembers.length && oldMembers.every((member) => nextMembers.includes(member))
}

const boundOf = (text) => {
  const match = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(text)

  return match ? [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)] : undefined
}

const compareTuples = (left, right) => {
  for (let index = 0; index < 3; index += 1) if (left[index] !== right[index]) return left[index] < right[index] ? -1 : 1

  return 0
}

export const lowerBound = (range) => {
  const bounds = String(range)
    .split('||')
    .map((alternative) => alternative.trim())
    .filter(Boolean)
    .map((alternative) => (/^(>=|\^|~|=)?\s*\d/.test(alternative) ? boundOf(alternative) : [0, 0, 0]))
    .filter(Boolean)

  return bounds.length > 0 ? bounds.sort(compareTuples)[0] : undefined
}

const nameOf = (node, source) => (node.name ? node.name.getText(source) : undefined)

const memberKey = (member, source, seen) => {
  const named = nameOf(member, source)

  if (named !== undefined) return named

  const kind = ts.isCallSignatureDeclaration(member) ? '(call)' : ts.isConstructSignatureDeclaration(member) ? '(new)' : ts.isIndexSignatureDeclaration(member) ? '(index)' : ts.isConstructorDeclaration(member) ? '(constructor)' : '(member)'
  const count = (seen.get(kind) ?? 0) + 1

  seen.set(kind, count)

  return count === 1 ? kind : `${kind}#${count}`
}

export const readDeclarations = (packageDir, entries) => {
  const files = entries.map((entry) => entry.file).filter((file) => existsSync(file))
  const program = ts.createProgram({ rootNames: files, options: { noEmit: true, noLib: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, types: [], strict: true } })
  const checker = program.getTypeChecker()
  const prefix = `${resolve(packageDir).replaceAll('\\', '/')}/`

  const own = (declaration) => {
    const path = declaration.getSourceFile().fileName.replaceAll('\\', '/')

    return path.startsWith(prefix) && !path.slice(prefix.length).split('/').includes('node_modules')
  }

  const result = {}

  for (const entry of entries) {
    const source = program.getSourceFile(entry.file)
    const moduleSymbol = source && checker.getSymbolAtLocation(source)

    if (!moduleSymbol) continue

    const lines = new Map()
    const visited = new Set()

    const put = (key, text) => {
      let free = key
      let count = 1

      while (lines.has(free)) {
        count += 1
        free = `${key}#${count}`
      }

      lines.set(free, text)
    }

    const parametersOf = (node) => (node.typeParameters ? `<${node.typeParameters.map((parameter) => squash(parameter.getText(node.getSourceFile()))).join(', ')}>` : '')

    const heritageOf = (node) => (node.heritageClauses ?? []).map((clause) => squash(clause.getText(node.getSourceFile()))).join(' ')

    const follow = (node) => {
      const target = ts.isTypeReferenceNode(node) ? node.typeName : ts.isExpressionWithTypeArguments(node) ? node.expression : ts.isTypeQueryNode(node) ? node.exprName : undefined

      if (target) {
        const identifier = ts.isQualifiedName(target) ? target.right : target
        const symbol = ts.isIdentifier(identifier) || ts.isPropertyAccessExpression(identifier) ? checker.getSymbolAtLocation(identifier) : undefined
        const resolved = symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol

        for (const declaration of resolved?.declarations ?? []) if (own(declaration)) visit(declaration, nameOf(declaration, declaration.getSourceFile()))
      }

      ts.forEachChild(node, follow)
    }

    const members = (owner, list, sourceFile) => {
      const seen = new Map()

      for (const member of list) {
        if (ts.canHaveModifiers(member) && ts.getModifiers(member)?.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword)) continue

        put(`${owner}.${memberKey(member, sourceFile, seen)}`, squash(member.getText(sourceFile)))
      }
    }

    function visit(declaration, name) {
      if (name === undefined || visited.has(declaration)) return

      visited.add(declaration)

      const sourceFile = declaration.getSourceFile()

      if (ts.isInterfaceDeclaration(declaration)) {
        put(name, `interface ${name}${parametersOf(declaration)}${heritageOf(declaration) ? ` ${heritageOf(declaration)}` : ''}`)
        members(name, declaration.members, sourceFile)
      } else if (ts.isTypeAliasDeclaration(declaration)) {
        if (ts.isTypeLiteralNode(declaration.type)) {
          put(name, `type ${name}${parametersOf(declaration)}`)
          members(name, declaration.type.members, sourceFile)
        } else put(name, `type ${name}${parametersOf(declaration)} = ${squash(declaration.type.getText(sourceFile))}`)
      } else if (ts.isClassDeclaration(declaration)) {
        put(name, `class ${name}${parametersOf(declaration)}${heritageOf(declaration) ? ` ${heritageOf(declaration)}` : ''}`)
        members(name, declaration.members, sourceFile)
      } else if (ts.isFunctionDeclaration(declaration)) put(name, squash(hideBindings(declaration, sourceFile)).replace(/^(export\s+)?(default\s+)?(declare\s+)?/, ''))
      else if (ts.isVariableDeclaration(declaration)) put(name, `const ${squash(hideBindings(declaration, sourceFile))}`)
      else if (ts.isEnumDeclaration(declaration)) {
        put(name, `enum ${name}`)
        members(name, declaration.members, sourceFile)
      } else if (ts.isModuleDeclaration(declaration)) put(name, `namespace ${name}`)
      else return

      ts.forEachChild(declaration, follow)
    }

    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      const resolved = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported

      for (const declaration of resolved.declarations ?? []) if (own(declaration)) visit(declaration, exported.getName())
    }

    result[entry.key] = lines
  }

  return result
}

const entryLabel = (name, key) => (key === '.' ? name : `${name}${key.slice(1)}`)

const typedEntries = (pkg, packageDir) =>
  Object.entries(pkg.exports ?? {})
    .filter(([, value]) => typeof value === 'object' && typeof value.types === 'string' && value.types.endsWith('.d.ts'))
    .map(([key, value]) => ({ key, label: entryLabel(pkg.name, key), file: join(packageDir, value.types), experimental: key.startsWith(experimentalPrefix) }))

const filesUnder = (directory, accepts) => (existsSync(directory) ? readdirSync(directory, { recursive: true }).filter(accepts).map((file) => join(directory, file)) : [])

const readFile = (file) => (existsSync(file) ? readFileSync(file, 'utf8') : '')

export const readCss = (packageDir) => {
  const dist = join(packageDir, 'dist-lib')
  const stylesheets = [readFile(join(dist, 'styles.css')), readFile(join(dist, 'theme.css'))].join('\n')
  const scripts = filesUnder(dist, (file) => file.endsWith('.js') && !file.replaceAll('\\', '/').startsWith('styles/')).map(readFile).join('\n')
  const slots = []

  for (const match of stylesheets.matchAll(/\[data-slot=['"]([a-z0-9-]+)['"]\]/g)) slots.push(match[1])
  for (const match of scripts.matchAll(/\bslot\(\s*["']([a-z0-9-]+)["'](?:\s*,\s*["']([a-z0-9-]+)["'])?\s*\)/g)) slots.push(match[2] ? `${match[1]}-${match[2]}` : match[1])
  for (const match of scripts.matchAll(/["']data-slot["']\s*:\s*["']([a-z0-9-]+)["']/g)) slots.push(match[1])

  return { hooks: sorted(stylesheets.match(/--enchase-[a-z0-9-]+/g) ?? []), slots: sorted(slots) }
}

const styleRecords = (style) => [style?.hooks, style?.colorHooks, style?.light?.hooks, style?.dark?.hooks, style?.density?.compact?.hooks]

export const readStyles = async (packageDir, pkg, load) => {
  const result = {}

  for (const [key, value] of Object.entries(pkg.exports ?? {})) {
    if (!key.startsWith(stylePrefix) || typeof value !== 'object' || typeof value.import !== 'string') continue

    const name = key.slice(stylePrefix.length)
    const loaded = await load(pathToFileURL(join(packageDir, value.import)).href)

    result[name] = sorted(styleRecords(loaded[name]).flatMap((record) => Object.keys(record ?? {})))
  }

  return result
}

export const readSurface = async (packageDir, load = (url) => import(url)) => {
  const pkg = readJson(join(packageDir, 'package.json'))
  const entries = typedEntries(pkg, packageDir)
  const declarations = readDeclarations(packageDir, entries)

  return {
    name: pkg.name,
    version: pkg.version,
    exports: Object.fromEntries(Object.entries(pkg.exports ?? {}).map(([key, value]) => [key, flatten(value)])),
    bin: typeof pkg.bin === 'string' ? { [pkg.name]: pkg.bin } : (pkg.bin ?? {}),
    minimums: { node: pkg.engines?.node, peers: pkg.peerDependencies ?? {}, optionalPeers: Object.entries(pkg.peerDependenciesMeta ?? {}).filter(([, meta]) => meta?.optional === true).map(([name]) => name), browsers: pkg.browserslist ?? [] },
    entries: entries.map(({ key, label, experimental }) => ({ key, label, experimental, lines: [...(declarations[key] ?? new Map()).entries()] })),
    css: readCss(packageDir),
    styles: await readStyles(packageDir, pkg, load)
  }
}

export const diffLines = (before, after) => {
  const result = { removed: [], changed: [], widened: [], added: [], addedRequired: [] }

  for (const [key, text] of before) {
    if (!after.has(key)) result.removed.push({ key, detail: text })
    else if (after.get(key) !== text) result[isWidened(text, after.get(key)) ? 'widened' : 'changed'].push({ key, detail: `${text} -> ${after.get(key)}` })
  }

  for (const [key, text] of after) if (!before.has(key)) result.added.push({ key, detail: text })

  const owner = (key) => key.split('.')[0]
  const removedOwners = new Set(result.removed.filter(({ key }) => !key.includes('.')).map(({ key }) => key))
  const addedOwners = new Set(result.added.filter(({ key }) => !key.includes('.')).map(({ key }) => key))

  result.removed = result.removed.filter(({ key }) => !key.includes('.') || !removedOwners.has(owner(key)))
  result.added = result.added.filter(({ key }) => !key.includes('.') || !addedOwners.has(owner(key)))

  const required = result.added.filter(({ key, detail }) => key.includes('.') && inputOwner.test(owner(key)) && before.has(owner(key)) && !before.has(key) && requiredMember(key, detail))

  result.addedRequired = required
  result.added = result.added.filter((item) => !required.includes(item))

  return result
}

const requiredMember = (key, text) => {
  const member = key.slice(key.indexOf('.') + 1).replace(/#\d+$/, '')
  const head = text.replace(/^readonly\s+/, '')

  if (member.startsWith('(')) return true

  return head.startsWith(member) && !head.slice(member.length).startsWith('?')
}

const raised = (before, after) => {
  const old = lowerBound(before)
  const next = lowerBound(after)

  return old !== undefined && next !== undefined && compareTuples(next, old) > 0
}

const browserOf = (entry) => {
  const match = /^(\w+)\s*>=\s*([\d.]+)$/.exec(entry)

  return match ? { name: match[1], version: match[2] } : undefined
}

export const compareSurfaces = (before, after) => {
  const breaks = []
  const notes = []
  const widened = []
  const added = []

  const fail = (section, key, detail, names = []) => breaks.push({ section, key, detail, names })

  const stable = (key) => !key.startsWith(experimentalPrefix)

  for (const [key, conditions] of Object.entries(before.exports)) {
    if (!stable(key)) continue

    const next = after.exports[key]

    if (!next) {
      fail('exports', `removed exports ${key}`, 'the entry is gone', [key])
      continue
    }

    for (const [condition, target] of Object.entries(conditions)) {
      if (!(condition in next)) fail('exports', `removed exports ${key} ${condition}`, `the condition ${condition} is gone`, [key])
      else if (next[condition] !== target) notes.push(`exports ${key} ${condition}: ${target} -> ${next[condition]}`)
    }
  }

  for (const key of Object.keys(after.exports)) if (stable(key) && !before.exports[key]) added.push(`exports ${key}`)

  for (const [name, target] of Object.entries(before.bin)) {
    if (!(name in after.bin)) fail('bin', `removed bin ${name}`, 'the command is gone', [name])
    else if (after.bin[name] !== target) notes.push(`bin ${name}: ${target} -> ${after.bin[name]}`)
  }

  const { node: oldNode, peers: oldPeers, browsers: oldBrowsers } = before.minimums
  const { node: newNode, peers: newPeers, browsers: newBrowsers, optionalPeers } = after.minimums

  if (newNode !== undefined && (oldNode === undefined || raised(oldNode, newNode))) fail('minimums', 'raised engines.node', `${oldNode ?? 'none'} -> ${newNode}`, ['engines'])

  for (const [name, range] of Object.entries(newPeers)) {
    if (!(name in oldPeers)) {
      if (!optionalPeers.includes(name)) fail('minimums', `added peerDependencies.${name}`, `${range} is a new peer`, [name])
    } else if (raised(oldPeers[name], range)) fail('minimums', `raised peerDependencies.${name}`, `${oldPeers[name]} -> ${range}`, [name])
  }

  const newByBrowser = new Map(newBrowsers.map((entry) => [browserOf(entry)?.name ?? entry, entry]))

  for (const entry of oldBrowsers) {
    const old = browserOf(entry)
    const next = newByBrowser.get(old?.name ?? entry)

    if (!next) fail('minimums', `removed browserslist ${old?.name ?? entry}`, `${entry} is gone`, [old?.name ?? entry])
    else if (old && raised(old.version, browserOf(next)?.version ?? '0')) fail('minimums', `raised browserslist ${old.name}`, `${entry} -> ${next}`, [old.name])
    else if (!old && next !== entry) fail('minimums', `removed browserslist ${entry}`, `${entry} -> ${next}`, [entry])
  }

  const afterEntries = new Map(after.entries.map((entry) => [entry.label, entry]))

  const reported = (key) => breaks.some((item) => item.key === `removed exports ${key}` || item.key.startsWith(`removed exports ${key} `))

  for (const entry of before.entries.filter(({ experimental }) => !experimental)) {
    const next = afterEntries.get(entry.label)

    if (!next) {
      if (!reported(entry.key)) fail('declarations', `removed ${entry.label}`, 'the entry has no declarations now', [entry.label])

      continue
    }

    const diff = diffLines(new Map(entry.lines), new Map(next.lines))
    const symbol = (key) => key.split('#')[0]

    for (const item of diff.removed) fail('declarations', `removed ${entry.label} ${item.key}`, item.detail, [symbol(item.key).split('.')[0], symbol(item.key)])
    for (const item of diff.changed) fail('declarations', `changed ${entry.label} ${item.key}`, item.detail, [symbol(item.key).split('.')[0], symbol(item.key)])
    for (const item of diff.addedRequired) fail('declarations', `added required ${entry.label} ${item.key}`, item.detail, [symbol(item.key).split('.')[0], symbol(item.key)])
    for (const item of diff.widened) widened.push(`${entry.label} ${item.key}: ${item.detail}`)
    for (const item of diff.added) added.push(`${entry.label} ${item.key}`)
  }

  for (const entry of after.entries.filter(({ experimental }) => !experimental)) if (!before.entries.some(({ label }) => label === entry.label)) added.push(`entry ${entry.label}`)

  const oldHooks = new Set(before.css.hooks)
  const newHooks = new Set(after.css.hooks)
  const oldSlots = new Set(before.css.slots)
  const newSlots = new Set(after.css.slots)

  for (const hook of oldHooks) if (!newHooks.has(hook)) fail('css', `removed css hook ${hook}`, 'no stylesheet of the package has it now', [hook])
  for (const slot of oldSlots) if (!newSlots.has(slot)) fail('css', `removed data-slot ${slot}`, 'no part renders it now', [slot])
  for (const hook of newHooks) if (!oldHooks.has(hook)) added.push(`css hook ${hook}`)
  for (const slot of newSlots) if (!oldSlots.has(slot)) added.push(`data-slot ${slot}`)

  for (const [style, hooks] of Object.entries(before.styles)) {
    const next = after.styles[style]

    if (!next) {
      if (!reported(`${stylePrefix}${style}`)) fail('styles', `removed style ${style}`, 'the style entry is gone', [style])

      continue
    }

    for (const hook of hooks) if (!next.includes(hook)) fail('styles', `removed style ${style} ${hook}`, 'the style no longer sets it', [hook])
  }

  const experimental = []
  const oldExperimental = new Map(before.entries.filter(({ experimental: flag }) => flag).map((entry) => [entry.label, entry]))
  const newExperimental = new Map(after.entries.filter(({ experimental: flag }) => flag).map((entry) => [entry.label, entry]))

  for (const label of sorted([...oldExperimental.keys(), ...newExperimental.keys()])) {
    const old = oldExperimental.get(label)
    const next = newExperimental.get(label)
    const hook = hookOf(next ?? old)

    if (!old) experimental.push({ label, hook, kind: 'added', items: [`entry ${label}`] })
    else if (!next) experimental.push({ label, hook, kind: 'removed', items: [`entry ${label}`] })
    else {
      const diff = diffLines(new Map(old.lines), new Map(next.lines))
      const items = [...diff.removed.map((item) => `removed ${item.key}`), ...diff.changed.map((item) => `changed ${item.key}: ${item.detail}`), ...diff.widened.map((item) => `widened ${item.key}: ${item.detail}`), ...diff.addedRequired.map((item) => `added ${item.key}`), ...diff.added.map((item) => `added ${item.key}`)]

      if (items.length > 0) experimental.push({ label, hook, kind: 'changed', items })
    }
  }

  return { breaks, notes, widened, added, experimental }
}

const hookOf = (entry) => entry.lines.map(([key, text]) => (!key.includes('.') && /^(function|const) use[A-Z]/.test(text) ? key : undefined)).find(Boolean) ?? entry.label

export const applyBreaks = ({ detected, file, baseline }) => {
  const result = { errors: [], warnings: [], declared: [] }
  const keys = new Set(detected.map(({ key }) => key))

  if (file === undefined) {
    for (const { key, detail } of detected) result.errors.push(`${key}: ${detail} (not declared in ${breaksFile})`)

    return result
  }

  if (!validBreaksFile(file)) {
    result.errors.push(`${breaksFile} must be { "since": "<version>", "breaks": [ { "key": "...", "note": "..." } ] }`)

    return result
  }

  if (file.since !== baseline) {
    const ignored = applyBreaks({ detected, file: undefined, baseline })

    return { ...ignored, warnings: [`${breaksFile} is for the release after ${file.since} and the version compared is ${baseline}: it was ignored, and it can be deleted`, ...ignored.warnings] }
  }

  const listed = new Set(file.breaks.map(({ key }) => key))

  for (const { key, detail } of detected) {
    if (listed.has(key)) result.declared.push(key)
    else result.errors.push(`${key}: ${detail} (not declared in ${breaksFile})`)
  }

  for (const key of listed) if (!keys.has(key)) result.errors.push(`${breaksFile} lists "${key}", which did not break`)

  return result
}

export const renderReport = ({ before, after, result, errors, warnings }) => {
  const stable = after.entries.filter(({ experimental }) => !experimental)
  const lines = [`check:api: ${after.name} ${after.version} (this build) against ${before.name} ${before.version} (published)`]
  const of = (section) => result.breaks.filter((item) => item.section === section).length
  const row = (title, summary) => lines.push(`${title.padEnd(14)}${summary}`)

  row('exports', `${Object.keys(after.exports).length} keys, ${of('exports')} removed`)
  row('declarations', `${stable.length} stable entries, ${stable.reduce((total, entry) => total + entry.lines.length, 0)} lines: ${of('declarations')} removed or changed, ${result.widened.length} widened`)
  row('css', `${after.css.hooks.length} --enchase-* names and ${after.css.slots.length} data-slot names, ${of('css')} removed`)
  row('styles', `${Object.keys(after.styles).length} styles, ${Object.values(after.styles).reduce((total, hooks) => total + hooks.length, 0)} hooks, ${of('styles')} removed`)
  row('bin', `${Object.keys(after.bin).length} command, ${of('bin')} removed`)
  row('minimums', `engines.node, ${Object.keys(after.minimums.peers).length} peers, ${after.minimums.browsers.length} browsers, ${of('minimums')} raised or removed`)
  row('experimental', result.experimental.length === 0 ? 'no change' : result.experimental.map((change) => `${change.label} ${change.kind} (${change.items.length})`).join(', '))

  if (result.widened.length > 0) lines.push('', 'widened (compatible, for review):', ...result.widened.map((item) => `  ${item}`))
  if (result.notes.length > 0) lines.push('', 'retargeted:', ...result.notes.map((item) => `  ${item}`))
  if (result.experimental.length > 0) lines.push('', 'experimental (never fails):', ...result.experimental.flatMap((change) => [`  ${change.label} (${change.hook}) ${change.kind}`, ...change.items.slice(0, 12).map((item) => `    ${item}`), ...(change.items.length > 12 ? [`    ... and ${change.items.length - 12} more`] : [])]))
  if (warnings.length > 0) lines.push('', ...warnings.map((warning) => `warning: ${warning}`))
  if (errors.length > 0) lines.push('', 'not accepted:', ...errors.map((error) => `  ${error}`))

  lines.push('', errors.length === 0 ? 'result: ok' : `result: ${errors.length} problem${errors.length === 1 ? '' : 's'}`)

  return lines.join('\n')
}

const run = (command, args, options = {}) => execFileSync(command, args, { encoding: 'utf8', shell: windows, stdio: ['ignore', 'pipe', 'pipe'], ...options })

const unpack = (tarball, destination) => {
  mkdirSync(destination, { recursive: true })
  run('tar', ['-xzf', tarball, '-C', destination])

  return join(destination, 'package')
}

export const resolveBaseline = (name, requested) => {
  if (requested) {
    if (existsSync(join(requested, 'package.json'))) return { dir: requested }
    if (existsSync(requested) && requested.endsWith('.tgz')) {
      const temporary = mkdtempSync(join(tmpdir(), 'enchase-api-'))

      return { dir: unpack(requested, temporary), temporary }
    }

    throw new Error(`--baseline ${requested} is neither a package folder nor a .tgz`)
  }

  let version

  try {
    version = run('npm', ['view', `${name}@latest`, 'version']).trim()
  } catch (error) {
    if (/E404|404 Not Found|is not in this registry/.test(`${error.stderr}${error.stdout}`)) return undefined

    throw new Error(`could not read the latest published ${name} from npm (${String(error.stderr ?? error.message).split('\n')[0]}). Pass --baseline <folder|tarball> to compare without the network.`)
  }

  const cache = join(root, 'node_modules', '.cache', 'enchase-api', version)
  const dir = join(cache, 'package')

  if (!existsSync(join(dir, 'package.json'))) {
    rmSync(cache, { recursive: true, force: true })
    mkdirSync(cache, { recursive: true })
    run('npm', ['pack', `${name}@${version}`, '--pack-destination', cache, '--silent'])
    unpack(join(cache, `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`), cache)
  }

  return { dir }
}

const argument = (name) => {
  const at = process.argv.indexOf(name)

  return at === -1 ? undefined : process.argv[at + 1]
}

const main = async () => {
  const currentDir = resolve(argument('--current') ?? root)

  if (!existsSync(join(currentDir, 'dist-lib'))) throw new Error(`${join(currentDir, 'dist-lib')} does not exist: run "npm run build:lib" first`)

  const after = await readSurface(currentDir)
  const baseline = resolveBaseline(after.name, argument('--baseline'))

  if (!baseline) {
    console.log(`check:api: ${after.name} is not on npm yet, so there is nothing to compare`)

    return
  }

  try {
    const before = await readSurface(baseline.dir)
    const result = compareSurfaces(before, after)
    const breaksPath = join(currentDir, breaksFile)
    const file = existsSync(breaksPath) ? readJson(breaksPath) : undefined
    const applied = applyBreaks({ detected: result.breaks, file, baseline: before.version })
    const changelog = join(currentDir, 'CHANGELOG.md')
    const notes = before.version !== after.version && existsSync(changelog) ? notesOf(readFileSync(changelog, 'utf8'), after.version) : undefined
    const declared = result.breaks.filter(({ key }) => applied.declared.includes(key))
    const errors = [...applied.errors, ...(notes ? checkNotes({ notes, declared, experimental: result.experimental }) : [])]

    if (process.argv.includes('--json')) console.log(JSON.stringify({ baseline: before.version, current: after.version, ...result, errors, warnings: applied.warnings }, null, 2))
    else console.log(renderReport({ before, after, result, errors, warnings: applied.warnings }))

    if (errors.length > 0) process.exitCode = 1
  } finally {
    if (baseline.temporary) rmSync(baseline.temporary, { recursive: true, force: true })
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
