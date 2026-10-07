export interface CodeBlock {
    title: string
    code: string
}

export interface MultiCodeBlockProps {
    blocks: CodeBlock[]
    language?: string
}