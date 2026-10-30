import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'

const root = dirname(fileURLToPath(import.meta.url))

const browsers: Record<string, string> = { chrome: 'chrome', edge: 'edge', firefox: 'firefox', safari: 'safari', ios_saf: 'ios' }

const toCssTarget = (entry: string) => {
  const [, name, version] = /^(\w+) >= ([\d.]+)$/.exec(entry) ?? []

  if (!browsers[name]) throw new Error(`the browserslist entry "${entry}" is not name >= version for ${Object.keys(browsers).join(', ')}`)

  return `${browsers[name]}${version}`
}

const cssTarget = (JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).browserslist as string[]).map(toCssTarget)

const clientEntryName = 'index'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@components': resolve(root, './src/components'),
      '@assets': resolve(root, './src/assets'),
      '@styles': resolve(root, './src/styles'),
      '@utils': resolve(root, './src/utils'),
      '@hooks': resolve(root, './src/hooks'),
      '@motion': resolve(root, './src/motion'),
      '@locales': resolve(root, './src/locales')
    }
  },

  build: {
    target: 'es2022',
    outDir: 'dist-lib',
    emptyOutDir: true,
    sourcemap: false,
    minify: false,
    cssCodeSplit: false,
    cssTarget,
    cssMinify: 'lightningcss',
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(root, 'lib/index.ts'),
        theme: resolve(root, 'lib/theme.ts'),
        locales: resolve(root, 'lib/locales.ts'),
        icons: resolve(root, 'lib/icons.ts'),
        'styles/enchase': resolve(root, 'lib/styles/enchase.ts'),
        'styles/shadcn': resolve(root, 'lib/styles/shadcn.ts'),
        'styles/workbench': resolve(root, 'lib/styles/workbench.ts')
      },
      formats: ['es'],
      cssFileName: 'styles'
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        banner: (chunk) => (chunk.isEntry && chunk.name === clientEntryName ? "'use client'" : '')
      }
    }
  }
})
