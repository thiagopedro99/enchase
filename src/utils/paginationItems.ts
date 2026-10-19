export type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis'

const range = (start: number, end: number) => Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index)

export const paginationItems = (page: number, pageCount: number, siblingCount: number, boundaryCount: number): PaginationItem[] => {
  if (pageCount < 1) return []

  const startPages = range(1, Math.min(boundaryCount, pageCount))
  const endPages = range(Math.max(pageCount - boundaryCount + 1, boundaryCount + 1), pageCount)
  const siblingsStart = Math.max(Math.min(page - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1), boundaryCount + 2)
  const siblingsEnd = Math.min(Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2), endPages.length > 0 ? endPages[0] - 2 : pageCount - 1)
  const before = siblingsStart > boundaryCount + 2 ? ['start-ellipsis' as const] : boundaryCount + 1 < pageCount - boundaryCount ? [boundaryCount + 1] : []
  const after = siblingsEnd < pageCount - boundaryCount - 1 ? ['end-ellipsis' as const] : pageCount - boundaryCount > boundaryCount ? [pageCount - boundaryCount] : []

  return [...startPages, ...before, ...range(siblingsStart, siblingsEnd), ...after, ...endPages]
}
