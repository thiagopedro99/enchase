export const layerOrder = '@layer enchase-theme, enchase-base, enchase;'

export const layeredStyles = (css) => `${layerOrder}\n@layer enchase {\n${css.trim()}\n}\n`

export const themeStylesheet = (defaultThemeCss) => `${defaultThemeCss.trim()}\n`
