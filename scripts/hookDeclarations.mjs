const valueStatement = /export\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"];?/g
const typeStatement = /export\s+type\s*\{([^}]*)\}\s*from\s*['"][^'"]+['"];?/g
const wrapperStatement = /export (?:declare const|type) (\w+)\b/g
const taggedStatement = /\/\*\* @deprecated [^\n]*\*\/\nexport (?:declare const|type) (\w+)\b/g

const namesOf = (list) =>
  list
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.split(/\s+as\s+/).pop().trim())

export const exportsOf = (declaration) => {
  const rest = declaration.replace(typeStatement, '').replace(valueStatement, '')
  const stray = rest.split('\n').find((line) => /\bexport\b/.test(line))

  if (stray !== undefined) throw new Error(`the declaration of the hook has an export that is neither "export { value } from" nor "export type { Type } from": ${stray.trim()}`)

  return {
    values: [...declaration.matchAll(valueStatement)].flatMap((match) => namesOf(match[1])),
    types: [...declaration.matchAll(typeStatement)].flatMap((match) => namesOf(match[1]))
  }
}

const tag = (entry) => `/** @deprecated Import it from '${entry}'. */`

export const wrapperOf = (name, { values, types }) =>
  `${[
    `import * as headless from '../headless/${name}.js'`,
    ...values.map((value) => `${tag(`enchase/headless/${name}`)}\nexport declare const ${value}: typeof headless.${value}`),
    ...types.map((type) => `${tag(`enchase/headless/${name}`)}\nexport type ${type} = headless.${type}`)
  ].join('\n\n')}\n`

export const deprecationGaps = (headlessDeclaration, experimentalDeclaration) => {
  const { values, types } = exportsOf(headlessDeclaration)
  const expected = [...values, ...types]
  const tagged = [...experimentalDeclaration.matchAll(taggedStatement)].map((match) => match[1])
  const exported = [...experimentalDeclaration.matchAll(wrapperStatement)].map((match) => match[1])
  const stray = experimentalDeclaration.replace(wrapperStatement, '').split('\n').find((line) => /\bexport\b/.test(line))

  return [
    ...expected.filter((name) => !tagged.includes(name)).map((name) => `${name} is exported without @deprecated, or not exported`),
    ...exported.filter((name) => !expected.includes(name)).map((name) => `${name} is exported by the old entry and not by the new one`),
    ...(stray === undefined ? [] : [`the old entry has an export that is not a deprecated wrapper: ${stray.trim()}`])
  ]
}
