export interface Env {
  GITHUB_APP_ID: string
  GITHUB_APP_PRIVATE_KEY: string
}

export interface Context {
  waitUntil: (promise: Promise<unknown>) => void
}

export interface Held {
  token: string
  expires: number
}
