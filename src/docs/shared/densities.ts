export const storyDensityNames = ['default', 'compact'] as const

export type StoryDensityName = (typeof storyDensityNames)[number]

export const storyDensityTitles: Record<StoryDensityName, string> = { default: 'Default', compact: 'Compact' }
