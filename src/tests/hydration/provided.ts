declare module 'vitest' {
  export interface ProvidedContext {
    serverHtml: Record<string, string>
  }
}

export {}
