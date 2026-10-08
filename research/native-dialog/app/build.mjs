import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'

await build({ entryPoints: ['client.jsx'], bundle: true, format: 'iife', outfile: 'dist/client.js', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'error' })
await build({ entryPoints: ['App.jsx'], bundle: true, platform: 'node', format: 'esm', outfile: 'dist/app.server.mjs', jsx: 'automatic', packages: 'external', logLevel: 'error' })
const { App } = await import('./dist/app.server.mjs')
const { renderToString } = await import('react-dom/server')
const { createElement } = await import('react')
for (const variant of ['native', 'portal']) for (const initialOpen of [false, true]) {
  const props = { variant, initialOpen }
  const html = renderToString(createElement(App, props))
  writeFileSync(`dist/${variant}-${initialOpen}.html`, `<!doctype html><html><head><meta charset="utf-8"><style>dialog{opacity:0}</style></head><body><div id="root">${html}</div><script>window.__props=${JSON.stringify(props)}</script><script src="client.js"></script></body></html>`)
  console.log(variant, initialOpen, html)
}
