export interface Comment {
  id: number
  url: string
  author: string
  avatarUrl: string
  text: string
  createdAt: string
  maintainer: boolean
}

export interface Thread {
  id: number
  title: string
  url: string
  text: string
  locked: boolean
  total: number
  comments: Comment[]
}

export type CommentProblem = 'missing' | 'short' | 'long'

export type CommentCheck = { ok: true; text: string } | { ok: false; problem: CommentProblem }

export const commentLimits = { min: 2, max: 2000 }

export const dailyComments = 30

export const shownComments = 50

const tab = 9

const lineFeed = 10

const lastControl = 31

const deleteCode = 127

const printable = (char: string) => {
  const code = char.charCodeAt(0)

  return code === tab || code === lineFeed || (code > lastControl && code !== deleteCode)
}

export const checkComment = (value: unknown): CommentCheck => {
  const { text } = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  const clean =
    typeof text === 'string'
      ? Array.from(text.replace(/\r\n?/g, '\n'))
          .filter(printable)
          .join('')
          .trim()
      : ''

  if (clean === '') return { ok: false, problem: 'missing' }
  if (clean.length < commentLimits.min) return { ok: false, problem: 'short' }

  return clean.length > commentLimits.max ? { ok: false, problem: 'long' } : { ok: true, text: clean }
}

export const fullText = (body: string | null) =>
  (body ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !/^\*\*.*\*\*$/.test(line) && !line.startsWith('<!--'))
    .join('\n')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
