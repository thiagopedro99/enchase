declare module '*/dist-lib/index.js' {
  export * from 'enchase'
}

declare module '*.css?inline' {
  const css: string
  export default css
}
