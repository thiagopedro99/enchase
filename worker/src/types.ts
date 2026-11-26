export interface KeyValue {
  get: (key: string) => Promise<string | null>
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>
  delete: (key: string) => Promise<void>
}

export interface RateLimit {
  limit: (options: { key: string }) => Promise<{ success: boolean }>
}

export interface Env {
  GITHUB_APP_ID: string
  GITHUB_APP_PRIVATE_KEY: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
  SESSIONS?: KeyValue
  LIMITER?: RateLimit
  SUGGEST_LIMITER?: RateLimit
}

export interface Account extends Env {
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  SESSIONS: KeyValue
  LIMITER: RateLimit
  SUGGEST_LIMITER: RateLimit
}

export interface Context {
  waitUntil: (promise: Promise<unknown>) => void
}

export type Access = 'read' | 'write'

export interface Held {
  token: string
  expires: number
}

export interface User {
  id: number
  login: string
  avatarUrl: string
}

export interface Session {
  id: string
  user: User
  token: string
}

export interface Call {
  request: Request
  env: Env
  context: Context
  url: URL
}

export type Handler = (call: Call, id: number) => Promise<Response>

export type AccountHandler = (call: Call & { env: Account }, id: number) => Promise<Response>
