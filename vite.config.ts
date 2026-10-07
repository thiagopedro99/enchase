import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-styled-components']
      }
    })
  ],

  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : ['debugger'],
    legalComments: 'none',
  },

  resolve: {
    alias: {
      '@components': resolve(__dirname, './src/components'),
      '@actions': resolve(__dirname, './src/actions'),
      '@assets': resolve(__dirname, './src/assets'),
      '@routes': resolve(__dirname, './src/routes'),
      '@styles': resolve(__dirname, './src/styles'),
      '@stores': resolve(__dirname, './src/stores'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@motion': resolve(__dirname, './src/motion'),
      '@tests': resolve(__dirname, './src/tests'),
      '@pages': resolve(__dirname, './src/pages'),
      '@docs': resolve(__dirname, './src/docs'),
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) {
            return;
          }

          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }

          return 'vendor';
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return 'assets/[name]-[hash][extname]';
          }

          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];

          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[ext]/[name]-[hash][extname]`;
        },

        compact: true,
        generatedCode: {
          constBindings: true,
        },
      },

      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    reportCompressedSize: true,
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs'],
    },
  },

  server: {
    hmr: {
      overlay: false,
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'styled-components',
      'zustand',
      'axios',
      'lucide-react',
    ],
  },

  publicDir: 'public',

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false
  },
}));