import type { StoryStyleName } from '../../../shared/styles.ts'
import type { ShapePreset } from 'enchase/theme'

export type PlacementChoice = '' | 'floating' | 'stacked'

export type ShapeChoice = '' | ShapePreset

export type StyleStoryArgs = {
  style: StoryStyleName
  brand: string
  shape: ShapeChoice
  labelPlacement: PlacementChoice
}

export type PreviewProps = StyleStoryArgs
