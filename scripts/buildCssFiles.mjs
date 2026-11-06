import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { cssComponents, cssMap, joinModules, normalizeCss, orderModules } from './cssFiles.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist-lib')
const split = join(root, 'dist-css')

const filesOf = (directory, extension) =>
  readdirSync(directory, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort()

try {
  const styles = readFileSync(join(dist, 'styles.css'), 'utf8')
  const modules = orderModules(styles, filesOf(split, '.css').map((path) => ({ path, css: readFileSync(join(split, path), 'utf8') })))
  const js = Object.fromEntries(filesOf(dist, '.js').map((path) => [path, readFileSync(join(dist, path), 'utf8')]))

  if (normalizeCss(joinModules(modules)) !== normalizeCss(styles)) throw new Error('the css modules, in the order of styles.css, are not the same css as styles.css: the second build differs from the first in more than the order of declarations')

  const components = cssComponents({ modules, js })
  const output = join(dist, 'css')

  rmSync(output, { recursive: true, force: true })
  mkdirSync(output, { recursive: true })

  for (const { file, css } of components) writeFileSync(join(output, file), css)

  writeFileSync(join(output, 'index.json'), `${JSON.stringify(cssMap(components), null, 2)}\n`)

  console.log(`css files written: ${components.length} components in dist-lib/css`)
} finally {
  rmSync(split, { recursive: true, force: true })
}
