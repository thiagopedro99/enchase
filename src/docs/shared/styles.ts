import { enchase } from 'enchase/styles/enchase'
import { material3 } from 'enchase/styles/material3'
import { shadcn } from 'enchase/styles/shadcn'
import { workbench } from 'enchase/styles/workbench'

export const storyStyles = { enchase, material3, shadcn, workbench }

export type StoryStyleName = keyof typeof storyStyles

export const storyStyleNames = Object.keys(storyStyles) as StoryStyleName[]

export const storyStyleTitles: Record<StoryStyleName, string> = { enchase: 'Enchase', material3: 'Material 3', shadcn: 'shadcn/ui', workbench: 'Workbench' }
