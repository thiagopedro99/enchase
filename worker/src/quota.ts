import type { Account } from './types.ts'

const day = 24 * 60 * 60

export const recent = async ({ SESSIONS }: Account, key: string): Promise<number[]> => {
  try {
    const stored: unknown = JSON.parse((await SESSIONS.get(key)) ?? '[]')
    const since = Date.now() - day * 1000

    return Array.isArray(stored) ? stored.filter((time): time is number => typeof time === 'number' && time > since) : []
  } catch {
    return []
  }
}

export const keep = ({ SESSIONS }: Account, key: string, times: number[]) => SESSIONS.put(key, JSON.stringify(times), { expirationTtl: day })

export const waitOf = (times: number[]) => String(Math.max(1, Math.ceil(((times[0] ?? Date.now()) + day * 1000 - Date.now()) / 1000)))
