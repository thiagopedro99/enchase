export type PaginatedResponse<TItem> = {
  data: TItem[]
  page: number
  perPage: number
  total: number
  totalPages: number
}
