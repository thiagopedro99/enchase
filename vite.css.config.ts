import { defineConfig, mergeConfig } from 'vite'

import lib from './vite.lib.config.ts'

export default mergeConfig(lib, defineConfig({ build: { outDir: 'dist-css', cssCodeSplit: true } }))
