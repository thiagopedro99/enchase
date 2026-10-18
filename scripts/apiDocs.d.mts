export type PropDoc = { name: string; type: string; required: boolean; default?: string; description?: string }

export type ComponentDoc = { name: string; description?: string; props: PropDoc[]; element?: string; refElement?: string }

export type MemberDoc = { name: string; type: string }

export type HookDoc = { name: string; signature: string; note?: string; members: MemberDoc[] }

export const hookNotes: Record<string, string>

export const escapeCell: (text: string) => string

export const renderApiDocs: (model: { components: ComponentDoc[]; hooks: HookDoc[] }) => string
