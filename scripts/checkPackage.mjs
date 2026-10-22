import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { exports } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const targets = (value) => (typeof value === 'string' ? [value] : Object.values(value).flatMap(targets))

const built = [...new Set(targets(exports))].filter((target) => target.startsWith('./dist-lib/'))
const broken = built.filter((target) => !existsSync(join(root, target)) || statSync(join(root, target)).size === 0)

if (broken.length > 0) {
  console.error(`the package exports point to files that are missing or empty:\n${broken.map((target) => `  - ${target}`).join('\n')}`)
  process.exit(1)
}

const clientEntry = exports['.'].import

if (!/^["']use client["'];?\r?\n/.test(readFileSync(join(root, clientEntry), 'utf8'))) {
  console.error(`${clientEntry} must start with the "use client" directive, or React Server Components cannot import the package`)
  process.exit(1)
}

const importsOf = (file) => [...readFileSync(file, 'utf8').matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g)].map((match) => match[1])

const reach = (entry) => {
  const files = new Set()
  const packages = new Set()

  const visit = (file) => {
    if (files.has(file)) return

    files.add(file)

    for (const specifier of importsOf(file)) {
      if (!specifier.startsWith('.')) packages.add(specifier)
      else if (specifier.endsWith('.js') && existsSync(resolve(dirname(file), specifier))) visit(resolve(dirname(file), specifier))
    }
  }

  visit(entry)

  return { files: [...files].map((file) => relative(root, file).split(sep).join('/')), packages: [...packages] }
}

const stylesKey = './styles'
const jsEntries = Object.entries(exports).filter(([, value]) => typeof value === 'object' && typeof value.import === 'string' && value.import.endsWith('.js'))
const leaks = []

for (const [key, value] of jsEntries) {
  const { files, packages } = reach(join(root, value.import))

  if (key !== stylesKey) {
    const styles = files.filter((file) => file.startsWith('dist-lib/styles/presets/'))

    if (styles.length > 0) leaks.push(`${key} reaches the style definitions (${styles.join(', ')}), so every user of it would pay for them`)
  } else {
    const outside = files.filter((file) => file !== value.import.replace(/^\.\//, '') && !file.startsWith('dist-lib/styles/'))

    if (outside.length > 0) leaks.push(`${key} reaches code that is not part of the styles (${outside.join(', ')})`)
    if (packages.length > 0) leaks.push(`${key} imports packages (${packages.join(', ')}), and a style is only data`)
  }
}

if (!jsEntries.some(([key]) => key === stylesKey)) leaks.push(`the package does not export ${stylesKey}`)

if (leaks.length > 0) {
  console.error(`the entries of the package are not isolated:\n${leaks.map((leak) => `  - ${leak}`).join('\n')}`)
  process.exit(1)
}

console.log(`package outputs checked: ${built.length} export targets exist and are not empty, ${clientEntry} starts with "use client", and only ${stylesKey} reaches the style definitions (${jsEntries.length} entries walked)`)
