#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const kitRoot = join(packageRoot, 'eject')

const usage = `usage: enchase eject <Component...> [--dir <folder>] [--force]
       enchase eject --diff <Component...> [--dir <folder>]
       enchase eject --list

Copies the source of a component, and of what only it uses, into your project, so that the code is yours.

  --dir <folder>  where the copies are, relative to the current folder (default: src/enchase)
  --force         overwrite files that already exist and differ from the library
  --diff          compare the copies with the library that is installed now, and say what changed on each side;
                  it writes nothing, and exits with 1 when the library changed a file
  --list          print the components that can be ejected`

const fail = (message) => {
  console.error(`enchase: ${message}`)
  process.exit(1)
}

const hashOf = (path) => createHash('sha256').update(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 16)

const sorted = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))

const pathOf = (folder, file) => join(folder, ...file.split('/'))

const parse = (argv) => {
  const options = { dir: 'src/enchase', force: false, list: false, diff: false, help: false }
  const names = []

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dir') {
      index += 1

      if (!argv[index] || argv[index].startsWith('-')) fail('--dir needs a folder')

      options.dir = argv[index]
    } else if (arg === '--force') options.force = true
    else if (arg === '--list') options.list = true
    else if (arg === '--diff') options.diff = true
    else if (arg === '--help' || arg === '-h') options.help = true
    else if (arg.startsWith('-')) fail(`unknown option ${arg}`)
    else names.push(arg)
  }

  return { names, options }
}

const loadManifest = (destination, options, required) => {
  const path = join(destination, 'enchase.eject.json')
  const shown = join(options.dir, 'enchase.eject.json')

  if (!existsSync(path)) return required ? fail(`${shown} does not exist: nothing was ejected into ${options.dir} with this command`) : { components: {}, files: {} }

  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fail(`${shown} is not valid JSON; fix it or delete it, and run the command again`)
  }
}

const importPath = (destination, kit, name) => {
  const path = relative(process.cwd(), pathOf(destination, kit.components[name])).split(sep).join('/')
  const bare = path.replace(/\.tsx?$/, '').replace(/\/index$/, '')

  return bare.startsWith('.') ? bare : `./${bare}`
}

const eject = (kit, names, options) => {
  const destination = resolve(process.cwd(), options.dir)
  const files = [...new Set(names.flatMap((name) => kit.entries[kit.components[name]].files))].sort()

  const plan = files.map((file) => {
    const from = pathOf(join(kitRoot, 'files'), file)
    const to = pathOf(destination, file)
    const status = !existsSync(to) ? 'new' : hashOf(from) === hashOf(to) ? 'same' : 'different'

    return { file, from, to, status }
  })

  const conflicts = plan.filter((item) => item.status === 'different')

  if (conflicts.length > 0 && !options.force) fail(`these files already exist and are not the ones of the library:\n${conflicts.map((item) => `  - ${pathOf(options.dir, item.file)}`).join('\n')}\nNothing was copied. Run again with --force to overwrite them, or with --diff to see what differs.`)

  const previous = loadManifest(destination, options, false)
  const written = plan.filter((item) => item.status !== 'same')

  written.forEach((item) => {
    mkdirSync(dirname(item.to), { recursive: true })
    copyFileSync(item.from, item.to)
  })

  if (!existsSync(join(destination, 'LICENSE'))) copyFileSync(join(packageRoot, 'LICENSE'), join(destination, 'LICENSE'))

  writeFileSync(
    join(destination, 'enchase.eject.json'),
    `${JSON.stringify(
      {
        package: 'enchase',
        version: kit.version,
        license: kit.license,
        repository: kit.repository,
        components: sorted({ ...previous.components, ...Object.fromEntries(names.map((name) => [name, kit.version])) }),
        files: sorted({ ...previous.files, ...Object.fromEntries(plan.map((item) => [item.file, hashOf(item.from)])) })
      },
      null,
      2
    )}\n`
  )

  console.log(`ejected ${names.join(', ')} into ${options.dir}: ${written.length} files written, ${plan.length - written.length} already there`)
  names.forEach((name) => console.log(`  ${name}: ${importPath(destination, kit, name)}`))
  console.log('The copies import from "enchase" (components, hooks, icons and the provider), so keep it installed, and their styles are CSS Modules, so your bundler has to handle *.module.css.')
  console.log('LICENSE and enchase.eject.json are next to the copies: keep them, the first carries the license of the code and the second lets --diff tell what the library changed.')
}

const lineDiff = (before, after) => {
  const table = Array.from({ length: before.length + 1 }, () => new Array(after.length + 1).fill(0))

  for (let row = before.length - 1; row >= 0; row -= 1) {
    for (let column = after.length - 1; column >= 0; column -= 1) {
      table[row][column] = before[row] === after[column] ? table[row + 1][column + 1] + 1 : Math.max(table[row + 1][column], table[row][column + 1])
    }
  }

  const operations = []
  let row = 0
  let column = 0

  while (row < before.length || column < after.length) {
    if (row < before.length && column < after.length && before[row] === after[column]) {
      operations.push([' ', before[row]])
      row += 1
      column += 1
    } else if (column >= after.length || (row < before.length && table[row + 1][column] >= table[row][column + 1])) {
      operations.push(['-', before[row]])
      row += 1
    } else {
      operations.push(['+', after[column]])
      column += 1
    }
  }

  return operations
}

const unifiedDiff = (yours, library, context = 3) => {
  const operations = lineDiff(yours.split('\n'), library.split('\n'))
  const changed = operations.flatMap(([kind], index) => (kind === ' ' ? [] : [index]))

  const ranges = changed.reduce((list, index) => {
    const last = list[list.length - 1]

    if (last && index - last.end <= context * 2) last.end = index
    else list.push({ start: index, end: index })

    return list
  }, [])

  return ranges.flatMap(({ start, end }) => {
    const from = Math.max(0, start - context)
    const slice = operations.slice(from, Math.min(operations.length, end + context + 1))
    const before = operations.slice(0, from)
    const yoursStart = before.filter(([kind]) => kind !== '+').length + 1
    const libraryStart = before.filter(([kind]) => kind !== '-').length + 1
    const yoursLength = slice.filter(([kind]) => kind !== '+').length
    const libraryLength = slice.filter(([kind]) => kind !== '-').length

    return [`@@ -${yoursStart},${yoursLength} +${libraryStart},${libraryLength} @@`, ...slice.map(([kind, line]) => `${kind}${line}`)]
  })
}

const stateOf = (manifest, file, from, to) => {
  const library = hashOf(from)
  const base = manifest.files[file]

  if (!existsSync(to)) return base === undefined ? 'new' : 'missing'

  const yours = hashOf(to)

  if (yours === library) return 'same'
  if (base === undefined) return 'new'
  if (library === base) return 'yours'

  return yours === base ? 'library' : 'both'
}

const meanings = {
  library: 'the library changed it, yours is as it was ejected',
  both: 'the library changed it and so did you',
  yours: 'you changed it, the library did not',
  new: 'the library has it now and your copy does not match',
  missing: 'you deleted it'
}

const diff = (kit, names, options) => {
  const destination = resolve(process.cwd(), options.dir)
  const manifest = loadManifest(destination, options, true)
  const absent = names.filter((name) => !manifest.components[name])

  if (absent.length > 0) fail(`${absent.join(', ')} ${absent.length > 1 ? 'were' : 'was'} not ejected into ${options.dir}`)

  const tally = { same: 0, yours: 0, library: 0, both: 0, new: 0, missing: 0 }

  names.forEach((name) => {
    const states = kit.entries[kit.components[name]].files.map((file) => {
      const from = pathOf(join(kitRoot, 'files'), file)
      const to = pathOf(destination, file)

      return { file, from, to, state: stateOf(manifest, file, from, to) }
    })

    const changed = states.filter(({ state }) => state !== 'same')

    states.forEach(({ state }) => (tally[state] += 1))
    console.log(`${name}: ejected from ${manifest.components[name]}, the package installed is ${kit.version}${changed.length === 0 ? ', and the copy is the library' : ''}`)
    changed.forEach(({ file, state }) => console.log(`  ${state.padEnd(7)} ${file}: ${meanings[state]}`))

    changed
      .filter(({ state, to }) => ['library', 'both', 'new'].includes(state) && existsSync(to))
      .forEach(({ file, from, to }) => {
        console.log(`\n--- yours/${file}\n+++ library/${file}`)
        console.log(unifiedDiff(readFileSync(to, 'utf8').replace(/\r\n/g, '\n'), readFileSync(from, 'utf8').replace(/\r\n/g, '\n')).join('\n'))
        console.log('')
      })
  })

  console.log(`${tally.same} files are the library, ${tally.library} changed by the library, ${tally.both} by both, ${tally.yours} by you, ${tally.new} new in the library, ${tally.missing} deleted by you`)

  if (tally.library + tally.both + tally.new > 0) process.exitCode = 1
}

const [command, ...rest] = process.argv.slice(2)

if (!command || command === '--help' || command === '-h') {
  console.log(usage)
  process.exit(0)
}

if (command !== 'eject') fail(`unknown command ${command}\n${usage}`)

const { names, options } = parse(rest)

if (options.help) {
  console.log(usage)
  process.exit(0)
}

if (!existsSync(join(kitRoot, 'index.json'))) fail('this install of enchase has no sources to copy')

const kit = JSON.parse(readFileSync(join(kitRoot, 'index.json'), 'utf8'))
const available = Object.keys(kit.components).sort()

if (options.list) {
  available.forEach((name) => console.log(`${name} (${kit.entries[kit.components[name]].files.length} files)`))
  process.exit(0)
}

if (options.diff && options.force) fail('--diff writes nothing, so --force has nothing to do with it')

if (names.length === 0) fail(`name the components to ${options.diff ? 'compare' : 'eject'}, as in "enchase eject ${options.diff ? '--diff ' : ''}Button"\n${usage}`)

const unknown = names.filter((name) => !kit.components[name])

if (unknown.length > 0) {
  const hints = unknown.map((name) => available.find((candidate) => candidate.toLowerCase() === name.toLowerCase())).filter(Boolean)

  fail(`${unknown.join(', ')} cannot be ejected${hints.length > 0 ? `; did you mean ${hints.join(', ')}?` : ''} Run "enchase eject --list" to see the components.`)
}

if (options.diff) diff(kit, names, options)
else eject(kit, names, options)
