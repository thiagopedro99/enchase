export type Shot = { count: number; hashes: string[]; labels: string[] }

export type Verdict = {
  status: 'ok' | 'flicker' | 'fail' | 'noisy-fail' | 'error'
  noisy: boolean
  labels?: string[]
}

export function verdict(options: {
  control: Shot | null
  controlAgain: Shot | null
  loadTreatment: () => Promise<Shot | null>
  retries?: number
}): Promise<Verdict>

export function gateFailures<T extends { status: string }>(results: T[]): T[]

export function compareFlips(actual: string[], expected: string[]): { missing: string[]; unexpected: string[] }
