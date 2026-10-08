import { defaultTheme } from '../tokens/index.ts'
import { cssVar } from './names.ts'

import type { VariableGroup } from './names.ts'

type Vars<Tokens> = { [Key in keyof Tokens]: Tokens[Key] extends object ? Vars<Tokens[Key]> : string }

const build = <Tokens extends object>(group: VariableGroup, tokens: Tokens, path: string[] = []): Vars<Tokens> =>
  Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [key, typeof value === 'object' && value !== null ? build(group, value, [...path, key]) : cssVar(group, ...path, key)])
  ) as Vars<Tokens>

const { base, light } = defaultTheme

export const vars = {
  color: build('color', light.colors),
  shadow: build('shadow', light.shadows),
  font: {
    primary: cssVar('font', 'primary'),
    mono: cssVar('font', 'mono'),
    size: build('font-size', base.fonts.sizes),
    weight: build('font-weight', base.fonts.weights)
  },
  space: build('space', base.spacing),
  radius: build('radius', base.borderRadius),
  transition: build('transition', base.transitions),
  state: build('state', base.state),
  z: build('z', base.zIndex)
}
