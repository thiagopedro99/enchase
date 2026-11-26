import { votable } from '../../defaultData.ts'

import type { Suggestion } from '../../types.ts'

const shortest = 4

const most = 3

const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const wordsOf = (text: string) =>
  fold(text)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= shortest)

export const similarTo = (title: string, items: Suggestion[]) => {
  const words = wordsOf(title)

  if (words.length === 0) return []

  return items
    .filter(({ status }) => votable.includes(status))
    .map((item) => ({ item, hits: words.filter((word) => fold(`${item.title} ${item.area ?? ''}`).includes(word)).length }))
    .filter(({ hits }) => hits > 0)
    .sort((first, second) => second.hits - first.hits || second.item.votes - first.item.votes)
    .slice(0, most)
    .map(({ item }) => item)
}
