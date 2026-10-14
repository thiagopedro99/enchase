export const layoutResponsiveCss = (name: string, min: string) => {
  const root = `[data-slot='layout'][data-layout='auto'][data-breakpoint='${name}']`

  return `@media not all and (min-width: ${min}) {\n  ${root} [data-slot='layout-sidebar'] {\n    display: none;\n  }\n\n  ${root}[data-sidebar] {\n    grid-template-columns: minmax(0, 1fr);\n    grid-template-areas: 'appbar' 'main' 'footer';\n  }\n}`
}
