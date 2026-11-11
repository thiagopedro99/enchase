export type BandCandidate = {
  module: string
  base: string
  state: string
  tie: boolean
  shared: string[]
}

export function bandCandidates(dir: string, options?: { loose?: boolean }): BandCandidate[]
