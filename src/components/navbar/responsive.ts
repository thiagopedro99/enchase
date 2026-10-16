export const navbarResponsiveCss = (name: string, min: string) => {
  const root = `[data-slot='navbar'][data-layout='auto'][data-breakpoint='${name}']`

  return `@media (min-width: ${min}) {\n  ${root} [data-slot='navbar-menu'],\n  ${root} [data-slot='navbar-cta'] {\n    display: flex;\n  }\n\n  ${root} [data-slot='navbar-menu-button'] {\n    display: none;\n  }\n}`
}
