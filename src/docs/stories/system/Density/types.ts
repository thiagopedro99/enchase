export type TokenRow = {
  name: string
  enchase: string
  shadcn: string
  compact: string
}

export type HookRow = TokenRow & {
  shadcnCompact: string
  follows: boolean
}

export type SizeRow = {
  part: string
  enchase: string
  shadcn: string
}

export type SizeGroup = {
  title: string
  rows: SizeRow[]
}
