import type { SyntheticEvent } from 'react'

type Props = Record<string, unknown>

type Handler = (event: SyntheticEvent) => void

const isHandler = (key: string, value: unknown): value is Handler => /^on[A-Z]/.test(key) && typeof value === 'function'

export const composeProps = <Own extends Props, User extends object>(own: Own, user: User | undefined) => {
  const given = (user ?? {}) as Props
  const merged: Props = { ...own, ...given }

  Object.keys(given).forEach((key) => {
    const ownValue = own[key]
    const givenValue = given[key]

    if (!isHandler(key, ownValue) || !isHandler(key, givenValue)) return

    merged[key] = (event: SyntheticEvent) => {
      givenValue(event)
      ownValue(event)
    }
  })

  return merged as Own & User
}
