export type PropDoc = { name: string; type: string; required: boolean; default?: string; description?: string }

export type ComponentDoc = { name: string; description?: string; props: PropDoc[]; element?: string; refElement?: string }

export type MemberDoc = { name: string; type: string }

export type HookDoc = { name: string; signature: string; note?: string; members: MemberDoc[] }

export type IconDoc = { name: string; dataIcon: string; directional: boolean }

export type IconsDoc = { props: PropDoc[]; element?: string; items: IconDoc[] }

export const hookNotes: Record<string, string>

export const escapeCell: (text: string) => string

export type CssHookDoc = { name: string; owner: string; default: string; token?: string; properties: string[]; components: string[] }

export type CssHooksGroup = { component: string; hooks: CssHookDoc[] }

export const renderApiDocs: (model: { components: ComponentDoc[]; hooks: HookDoc[]; icons: IconsDoc; cssHooks?: CssHooksGroup[] }) => string
