import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { layeredCss } from './layeredCss.js'
import { componentScopedName } from './scopedName.js'
import { wrapInLayer } from './wrapInLayer.js'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const stub = (file) => fileURLToPath(new URL(`./src/stubs/${file}`, import.meta.url))
const scope = process.env.SCOPE ?? 'default'
const inlineLayer = process.env.INLINE_LAYER === '1'

const generateScopedName = {
  default: undefined,
  pattern: 'enchase-[local]',
  fn: componentScopedName({ salt: pkg.version })
}[scope]

export default defineConfig({
  plugins: [react(), inlineLayer ? null : layeredCss()],
  resolve: {
    alias: [
      { find: '@hooks/useMotionRecipe.ts', replacement: stub('useMotionRecipe.ts') },
      { find: '@utils/classNames.ts', replacement: stub('classNames.ts') },
      { find: '@motion/types.ts', replacement: stub('motionTypes.ts') }
    ]
  },
  css: {
    modules: generateScopedName ? { generateScopedName } : {},
    postcss: inlineLayer ? { plugins: [wrapInLayer('enchase')] } : {}
  },
  build: {
    outDir: process.env.OUT ?? 'dist',
    emptyOutDir: true,
    minify: false,
    cssMinify: process.env.CSS_MINIFY === '1',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'styles'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'motion/react']
    }
  }
})
