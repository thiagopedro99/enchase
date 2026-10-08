import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export const renderButton = async (dist, props = {}) => {
  const lib = await import(`./${dist}/index.js`)
  return renderToStaticMarkup(h(lib.Button, { id: 'b', ...props }, 'Save'))
}
