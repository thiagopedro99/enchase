import { enchase, shadcn } from 'enchase/styles'

export const storyStyles = { enchase, shadcn }

export type StoryStyleName = keyof typeof storyStyles

export const storyStyleNames = Object.keys(storyStyles) as StoryStyleName[]

export const storyStyleTitles: Record<StoryStyleName, string> = { enchase: 'Enchase', shadcn: 'shadcn/ui' }
