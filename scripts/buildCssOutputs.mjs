import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'

import { layeredStyles, themeStylesheet } from './cssOutputs.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist-lib')

const { defaultThemeCss } = await import(pathToFileURL(join(dist, 'theme.js')).href)
const styles = readFileSync(join(dist, 'styles.css'), 'utf8')

writeFileSync(join(dist, 'styles.layer.css'), layeredStyles(styles))
writeFileSync(join(dist, 'theme.css'), themeStylesheet(defaultThemeCss))

console.log('css outputs written: styles.layer.css and theme.css')
