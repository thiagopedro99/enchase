import { storyStyleNames } from '../../../shared/styles.ts'

import type { StoryStyleName } from '../../../shared/styles.ts'
import type { PlacementChoice, ShapeChoice } from './types.ts'

export const defaultStyle: StoryStyleName = 'enchase'

export const styles = storyStyleNames

export const shapes: ShapeChoice[] = ['', 'pill', 'soft', 'square']

export const placements: PlacementChoice[] = ['', 'floating', 'stacked']

export const placementLabels: Record<PlacementChoice, string> = { '': 'do estilo', floating: 'floating', stacked: 'stacked' }

export const shapeLabels: Record<ShapeChoice, string> = { '': 'do estilo', pill: 'pill', soft: 'soft', square: 'square' }
