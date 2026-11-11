export const breaksFile = 'api-breaks.json'

export const namesOfKey = (key) => {
  const last = key.split(' ').pop()

  return [...new Set([last, last.split('.')[0]])]
}

const validItem = (item) => typeof item?.key === 'string' && typeof item?.note === 'string'

export const validBreaksFile = (file) => typeof file === 'object' && file !== null && !Array.isArray(file) && typeof file.since === 'string' && Array.isArray(file.breaks) && file.breaks.every(validItem) && (file.behavior === undefined || (Array.isArray(file.behavior) && file.behavior.every(validItem)))

export const notesOf = (markdown, version) => {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => line.trim() === `## v${version}`)

  if (start === -1) return undefined

  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '))
  const section = lines.slice(start + 1, end === -1 ? undefined : end)
  const notes = section.findIndex((line) => line.trim() === '### Notes')

  if (notes === -1) return { text: '', first: '' }

  const next = section.findIndex((line, index) => index > notes && line.startsWith('### '))
  const body = section.slice(notes + 1, next === -1 ? undefined : next)

  return { text: body.join('\n'), first: body.find((line) => line.startsWith('- ')) ?? '' }
}

export const checkNotes = ({ notes, declared, experimental = [] }) => {
  const errors = []

  for (const item of declared) {
    const names = item.names ?? namesOfKey(item.key)
    const cited = notes.first.includes(item.key) || names.some((name) => notes.first.includes(`\`${name}\``))

    if (!cited) errors.push(`the first bullet of the Notes must cite "${item.key}" (or ${names.map((name) => `\`${name}\``).join(' or ')}) as a break`)
  }

  for (const change of experimental) if (!notes.text.includes(`\`${change.hook}\``)) errors.push(`the Notes must name \`${change.hook}\`, which changed in ${change.label}`)

  return errors
}

export const breaksAgainstNotes = ({ file, changelog, version, highest }) => {
  if (file === undefined) return { errors: [], warnings: [] }

  if (!validBreaksFile(file)) return { errors: [`${breaksFile} must be { "since": "<version>", "breaks": [ { "key": "...", "note": "..." } ] }`], warnings: [] }

  if (file.since !== highest) return { errors: [], warnings: [`${breaksFile} is for the release after ${file.since} and the highest version on npm is ${highest}: it is ignored, and it can be deleted`] }

  const notes = notesOf(changelog, version)

  if (!notes) return { errors: [`CHANGELOG.md has no section for v${version}, and ${breaksFile} lists ${file.breaks.length} break${file.breaks.length === 1 ? '' : 's'} that the Notes have to cite`], warnings: [] }

  return { errors: checkNotes({ notes, declared: [...file.breaks, ...(file.behavior ?? [])] }), warnings: [] }
}
