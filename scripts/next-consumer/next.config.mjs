import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const config = {
  reactStrictMode: true,
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url))
}

export default config
