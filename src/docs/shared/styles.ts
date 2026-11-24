import { enchase } from 'enchase/styles/enchase'
import { material2 } from 'enchase/styles/material2'
import { material3 } from 'enchase/styles/material3'
import { shadcn } from 'enchase/styles/shadcn'
import { workbench } from 'enchase/styles/workbench'

export const storyStyles = { enchase, material2, material3, shadcn, workbench }

export type StoryStyleName = keyof typeof storyStyles

export const storyStyleNames = Object.keys(storyStyles) as StoryStyleName[]

export const storyStyleTitles: Record<StoryStyleName, string> = { enchase: 'Enchase', material2: 'Material 2', material3: 'Material 3', shadcn: 'shadcn/ui', workbench: 'Workbench' }
