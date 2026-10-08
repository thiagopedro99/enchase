import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { writeFileSync } from 'node:fs'
const here = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '')
const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="entry.css"><title>t</title></head><body><div id="root"></div><script type="module" src="entry.js"></script></body></html>'
const stackPlugin = {
  name: 'stack',
  setup(b) {
    b.onResolve({ filter: /^@components\/common\/(Modal|Tooltip)\/index\.tsx$/ }, (args) => {
      if (!args.importer.endsWith('entry.tsx')) return
      return { path: here + '/src/components/common/' + args.path.split('/')[2] + '/index.stack.tsx' }
    })
  }
}
for (const [out, plugins] of [['dist', []], ['dist-stack', [stackPlugin]]]) {
  await build({
    entryPoints: [here + '/entry.tsx'],
    bundle: true,
    outdir: here + '/' + out,
    format: 'esm',
    jsx: 'automatic',
    tsconfig: here + '/tsconfig.app.json',
    nodePaths: [here + '/../../node_modules'],
    loader: { '.module.css': 'local-css', '.css': 'css' },
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'warning',
    plugins
  })
  writeFileSync(here + '/' + out + '/index.html', html)
}
console.log('built')
