export const structureTags = ['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'li'] as const

export type StructureTag = (typeof structureTags)[number]

export const defaultTag: StructureTag = 'div'

export const roleOf = (tag: StructureTag) => (tag === 'ul' || tag === 'ol' ? 'list' : undefined)
