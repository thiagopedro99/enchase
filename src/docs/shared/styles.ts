import { enchase } from 'enchase/styles/enchase'
import { shadcn } from 'enchase/styles/shadcn'

export const storyStyles = { enchase, shadcn }

export type StoryStyleName = keyof typeof storyStyles

export const storyStyleNames = Object.keys(storyStyles) as StoryStyleName[]

export const storyStyleTitles: Record<StoryStyleName, string> = { enchase: 'Enchase', shadcn: 'shadcn/ui' }
