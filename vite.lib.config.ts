import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const root = dirname(fileURLToPath(import.meta.url))

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
    cssMinify: 'lightningcss',
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(root, 'lib/index.ts'),
        theme: resolve(root, 'lib/theme.ts'),
        locales: resolve(root, 'lib/locales.ts')
      },
      formats: ['es'],
      cssFileName: 'styles'
    },
    rolldownOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^motion($|\/)/],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        banner: (chunk) => (chunk.name === 'index' ? "'use client'" : '')
      }
    }
  }
})
