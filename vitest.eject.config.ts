import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

import base from './vite.config.ts'

import type { Alias } from 'vite'

const root = dirname(fileURLToPath(import.meta.url))
const copy = resolve(root, '.eject-contract')
const folders = (process.env.ENCHASE_EJECT_FOLDERS ?? '').split(',').filter(Boolean)

if (folders.length === 0) throw new Error('ENCHASE_EJECT_FOLDERS must list the folders of the components that were ejected, as in common/Button,common/Tabs')

const ejected: Alias[] = folders.map((folder) => ({ find: new RegExp(`^@components/${folder}(/.*)?$`), replacement: `${resolve(copy, 'components', folder)}$1` }))

const inherited: Alias[] = Object.entries(base.resolve?.alias ?? {}).map(([find, replacement]) => ({ find, replacement: String(replacement) }))

export default defineConfig({
  ...base,
  resolve: { ...base.resolve, alias: [...ejected, ...inherited] },
  test: { ...base.test, globalSetup: [] }
})
