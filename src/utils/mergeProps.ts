import { classNames } from './classNames.ts'

import type { CSSProperties, SyntheticEvent } from 'react'

type Props = Record<string, unknown> & {
  className?: string
  style?: CSSProperties
}

type Handler = (event: SyntheticEvent) => void

const isHandler = (key: string, value: unknown): value is Handler => /^on[A-Z]/.test(key) && typeof value === 'function'

export const slot = (component: string, part?: string) => ({ 'data-slot': part ? `${component}-${part}` : component })

export const mergeProps = <Own extends Props, User extends Props>(own: Own, user: User | undefined): Own & User & Props => {
  if (!user) return own as Own & User & Props

  const merged: Record<string, unknown> = { ...own, ...user }

  merged.className = classNames(own.className, user.className) || undefined
  merged.style = own.style || user.style ? { ...own.style, ...user.style } : undefined

  if (own['data-slot'] !== undefined) merged['data-slot'] = own['data-slot']

  for (const key of Object.keys(user)) {
    const ownValue = own[key]
    const userValue = user[key]

    if (isHandler(key, ownValue) && isHandler(key, userValue)) {
      merged[key] = (event: SyntheticEvent) => {
        userValue(event)
        if (!event.defaultPrevented) ownValue(event)
      }
    }
  }

  return merged as Own & User & Props
}
