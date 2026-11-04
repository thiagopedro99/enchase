#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const kitRoot = join(packageRoot, 'eject')

const usage = `usage: enchase eject <Component...> [--dir <folder>] [--force]
       enchase eject --list

Copies the source of a component, and of what only it uses, into your project, so that the code is yours.

  --dir <folder>  where to copy to, relative to the current folder (default: src/enchase)
  --force         overwrite files that already exist and differ from the library
  --list          print the components that can be ejected`

const fail = (message) => {
  console.error(`enchase: ${message}`)
  process.exit(1)
}

const hashOf = (path) => createHash('sha256').update(readFileSync(path, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 16)

const sorted = (object) => Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))

const parse = (argv) => {
  const options = { dir: 'src/enchase', force: false, list: false, help: false }
  const names = []

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dir') {
      index += 1

      if (!argv[index] || argv[index].startsWith('-')) fail('--dir needs a folder')

      options.dir = argv[index]
    } else if (arg === '--force') options.force = true
    else if (arg === '--list') options.list = true
    else if (arg === '--help' || arg === '-h') options.help = true
    else if (arg.startsWith('-')) fail(`unknown option ${arg}`)
    else names.push(arg)
  }

  return { names, options }
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

if (names.length === 0) fail(`name the components to eject, as in "enchase eject Button"\n${usage}`)

const unknown = names.filter((name) => !kit.components[name])

if (unknown.length > 0) {
  const hints = unknown.map((name) => available.find((candidate) => candidate.toLowerCase() === name.toLowerCase())).filter(Boolean)

  fail(`${unknown.join(', ')} cannot be ejected${hints.length > 0 ? `; did you mean ${hints.join(', ')}?` : ''} Run "enchase eject --list" to see the components.`)
}

const destination = resolve(process.cwd(), options.dir)
const files = [...new Set(names.flatMap((name) => kit.entries[kit.components[name]].files))].sort()

const plan = files.map((file) => {
  const from = join(kitRoot, 'files', ...file.split('/'))
  const to = join(destination, ...file.split('/'))
  const status = !existsSync(to) ? 'new' : hashOf(from) === hashOf(to) ? 'same' : 'different'

  return { file, from, to, status }
})

const conflicts = plan.filter((item) => item.status === 'different')

if (conflicts.length > 0 && !options.force) fail(`these files already exist and are not the ones of the library:\n${conflicts.map((item) => `  - ${join(options.dir, ...item.file.split('/'))}`).join('\n')}\nNothing was copied. Run again with --force to overwrite them.`)

const written = plan.filter((item) => item.status !== 'same')

written.forEach((item) => {
  mkdirSync(dirname(item.to), { recursive: true })
  copyFileSync(item.from, item.to)
})

const manifestPath = join(destination, 'enchase.eject.json')
const licensePath = join(destination, 'LICENSE')

const previous = (() => {
  if (!existsSync(manifestPath)) return { components: {}, files: {} }

  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    return fail(`${join(options.dir, 'enchase.eject.json')} is not valid JSON; fix it or delete it, and run the command again`)
  }
})()

if (!existsSync(licensePath)) copyFileSync(join(packageRoot, 'LICENSE'), licensePath)

writeFileSync(
  manifestPath,
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

const importPath = (name) => {
  const path = relative(process.cwd(), join(destination, ...kit.components[name].split('/'))).split(sep).join('/')
  const bare = path.replace(/\.tsx?$/, '').replace(/\/index$/, '')

  return bare.startsWith('.') ? bare : `./${bare}`
}

console.log(`ejected ${names.join(', ')} into ${options.dir}: ${written.length} files written, ${plan.length - written.length} already there`)
names.forEach((name) => console.log(`  ${name}: ${importPath(name)}`))
console.log('The copies import from "enchase" (components, hooks, icons and the provider), so keep it installed, and their styles are CSS Modules, so your bundler has to handle *.module.css.')
console.log('LICENSE and enchase.eject.json are next to the copies: keep them, the first carries the license of the code.')
