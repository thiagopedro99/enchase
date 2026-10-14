import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const typesDir = join(root, 'dist-lib', 'types')

const aliases = {
  '@components': 'src/components',
  '@assets': 'src/assets',
  '@styles': 'src/styles',
  '@utils': 'src/utils',
  '@hooks': 'src/hooks',
  '@motion': 'src/motion',
  '@locales': 'src/locales'
}

const specifier = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.d.ts') ? [path] : []
  })

const toRelative = (file, target) => {
  const path = relative(dirname(file), join(typesDir, target)).split(sep).join('/')
  return path.startsWith('.') ? path : `./${path}`
}

const rewrite = (file, value) => {
  const alias = Object.keys(aliases).find((key) => value.startsWith(`${key}/`))
  const resolved = alias ? toRelative(file, `${aliases[alias]}/${value.slice(alias.length + 1)}`) : value
  if (!resolved.startsWith('.')) return resolved

  return resolved.replace(/\.tsx?$/, '.js')
}

let changed = 0

for (const file of walk(typesDir)) {
  const source = readFileSync(file, 'utf8')
  const output = source.replace(specifier, (match, head, quote, value) => {
    const next = rewrite(file, value)
    return next === value ? match : `${head}${quote}${next}${quote}`
  })

  if (output !== source) {
    writeFileSync(file, output)
    changed += 1
  }
}

const leaked = walk(typesDir).filter((file) => /['"]@(components|assets|styles|utils|hooks|motion|locales)\//.test(readFileSync(file, 'utf8')))

if (leaked.length > 0) {
  console.error(`aliases still present in: ${leaked.join(', ')}`)
  process.exit(1)
}

console.log(`declarations rewritten in ${changed} files`)
