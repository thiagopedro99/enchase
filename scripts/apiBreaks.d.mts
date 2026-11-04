export type Notes = { text: string; first: string }

export type Declared = { key: string; names?: string[] }

export type Changed = { label: string; hook: string; kind: 'added' | 'removed' | 'changed'; items: string[] }

export const breaksFile: string

export const namesOfKey: (key: string) => string[]

export const validBreaksFile: (file: unknown) => boolean

export const notesOf: (markdown: string, version: string) => Notes | undefined

export const checkNotes: (input: { notes: Notes; declared: Declared[]; experimental?: Changed[] }) => string[]

export const breaksAgainstNotes: (input: { file: unknown; changelog: string; version: string; highest: string | undefined }) => { errors: string[]; warnings: string[] }
