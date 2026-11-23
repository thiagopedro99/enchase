import type { ReactNode } from 'react'

export const rich = (text: string): ReactNode[] => text.split('`').map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part))
