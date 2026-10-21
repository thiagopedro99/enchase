import type { ShapePreset, StyleName } from 'enchase/theme'

export type PlacementChoice = '' | 'floating' | 'stacked'

export type ShapeChoice = '' | ShapePreset

export type StyleStoryArgs = {
  style: StyleName
  brand: string
  shape: ShapeChoice
  labelPlacement: PlacementChoice
}

export type PreviewProps = StyleStoryArgs
