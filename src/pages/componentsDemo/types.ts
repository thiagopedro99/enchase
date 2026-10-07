export type CodeBlock = {
  title: string
  code: string
}

export type ShowCodeHandler = (blocks: CodeBlock[], title: string) => void

export type DemoSectionProps = {
  onShowCode: ShowCodeHandler
}
