declare module '*/dist-lib/index.js' {
  export * from 'enchase'
}

declare module '*.css?inline' {
  const css: string
  export default css
}

declare module 'virtual:enchase-consumer-css' {
  export const plain: string
  export const layered: string
}
