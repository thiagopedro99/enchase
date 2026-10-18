import type { LinkProps } from 'enchase'

export type HrefCase = Pick<LinkProps, 'href' | 'native' | 'target' | 'download'> & { id: string; outcome: string }
