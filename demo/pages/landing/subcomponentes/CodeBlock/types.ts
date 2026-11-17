export type CodeLanguage = 'tsx' | 'css' | 'bash'

export interface CodeToken {
  text: string
  kind?: string | undefined
}

export interface CodeBlockProps {
  code: string
  label: string
  language: CodeLanguage
  copy?: boolean
}
