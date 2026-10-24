import { resolve } from 'node:path'
import { build } from 'vite'

const entry = '\0enchase-consumer-entry'

export const consumerCss = async (file) => {
  const consumer = {
    name: 'enchase-consumer-entry',
    resolveId: (id) => (id === entry ? entry : undefined),
    load: (id) => (id === entry ? `import ${JSON.stringify(resolve(file))}` : undefined)
  }

  const result = await build({ configFile: false, logLevel: 'silent', plugins: [consumer], build: { write: false, rollupOptions: { input: entry } } })
  const outputs = (Array.isArray(result) ? result : [result]).flatMap((item) => item.output)

  return outputs
    .filter((item) => item.type === 'asset' && item.fileName.endsWith('.css'))
    .map((item) => String(item.source))
    .join('\n')
}
