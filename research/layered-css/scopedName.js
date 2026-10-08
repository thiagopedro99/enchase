import { createHash } from 'node:crypto'
import { basename, dirname } from 'node:path'

export const componentScopedName = ({ prefix = 'enchase', salt = '' } = {}) => (local, filename) => {
  const file = filename.split('?')[0]
  const component = basename(dirname(file))
  const hash = createHash('sha256').update(`${salt}:${file.replace(/\\/g, '/').split('/src/').pop()}:${local}`).digest('base64url').slice(0, 5)
  return `${prefix}-${component}-${local}-${hash}`
}
