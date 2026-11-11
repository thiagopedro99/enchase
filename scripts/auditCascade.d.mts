export type Shot = { count: number; hashes: string[]; labels: string[] }

export type Direction = 'lib-wins' | 'page-wins' | 'other'

export type Directions = {
  counts: Record<Direction, number>
  directions: { label: string; direction: Direction }[]
}

export type Verdict = {
  status: 'ok' | 'flicker' | 'fail' | 'noisy-fail' | 'error'
  noisy: boolean
  labels?: string[]
  differing?: number[]
  treatment?: Shot
}

export function verdict(options: {
  control: Shot | null
  controlAgain: Shot | null
  loadTreatment: () => Promise<Shot | null>
  retries?: number
}): Promise<Verdict>

export function directionOf(control: string | undefined, treatment: string | undefined, reference: string | undefined): Direction

export function directionsOf(options: { control: Shot; treatment: Shot; reference: Shot | null | undefined; differing: number[] }): Directions

export function gateFailures<T extends { status: string }>(results: T[]): T[]

export function acceptedFlip<T extends { directions?: Directions }>(result: T): boolean

export function pageGateFailures<T extends { status: string; directions?: Directions }>(results: T[]): T[]

export function compareFlips(actual: string[], expected: string[]): { missing: string[]; unexpected: string[] }
