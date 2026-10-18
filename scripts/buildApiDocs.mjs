import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { createServer } from 'vite'

import { hookNotes, renderApiDocs } from './apiDocs.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const posixRoot = root.replaceAll('\\', '/')
const outputPath = join(root, 'API.md')
const storiesRoot = join(root, 'src', 'docs', 'stories', 'components')
const check = process.argv.includes('--check')

const elementTags = {
  HTMLAnchorElement: 'a',
  HTMLButtonElement: 'button',
  HTMLDivElement: 'div',
  HTMLInputElement: 'input',
  HTMLSelectElement: 'select',
  HTMLSpanElement: 'span',
  SVGSVGElement: 'svg'
}

const typeFlags = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType

const createProgram = () => {
  const config = ts.readConfigFile(join(root, 'tsconfig.app.json'), ts.sys.readFile)
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const program = ts.createProgram({ rootNames: [join(root, 'lib', 'index.ts')], options: parsed.options })

  return { program, checker: program.getTypeChecker() }
}

const isOwn = (declaration) => declaration.getSourceFile().fileName.startsWith(`${posixRoot}/src/`)

const valueExports = (program, checker) => {
  const entry = program.getSourceFile(join(root, 'lib', 'index.ts'))

  return checker
    .getExportsOfModule(checker.getSymbolAtLocation(entry))
    .map((symbol) => ({ name: symbol.getName(), symbol: symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol }))
    .filter(({ symbol }) => symbol.flags & ts.SymbolFlags.Value)
}

const callSignatureOf = (checker, symbol) => checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration ?? symbol.declarations[0]).getCallSignatures()[0]

const stringLiteralNodes = (node) => {
  const members = ts.isUnionTypeNode(node) ? node.types : [node]

  return members.every((member) => ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) ? members : undefined
}

const expandedUnion = (checker, node) => {
  if (!ts.isTypeReferenceNode(node) || node.typeArguments) return undefined

  const symbol = checker.getSymbolAtLocation(node.typeName)
  const alias = symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
  const declaration = alias?.declarations?.find(ts.isTypeAliasDeclaration)
  const literals = declaration && stringLiteralNodes(declaration.type)

  if (literals) return literals.map((literal) => literal.getText()).join(' | ')

  const type = checker.getTypeFromTypeNode(node)

  return type.isUnion() && type.types.every((member) => member.isStringLiteral()) ? type.types.map((member) => `'${member.value}'`).join(' | ') : undefined
}

const typeOf = (checker, property) => {
  const declaration = property.declarations.find(isOwn)
  const node = declaration?.type

  if (!node) return checker.typeToString(checker.getTypeOfSymbolAtLocation(property, property.declarations[0]), undefined, typeFlags)

  return (expandedUnion(checker, node) ?? node.getText()).replace(/\s+/g, ' ')
}

const elementOf = (checker, propsType) => {
  const handler = propsType.getProperty('onClick')

  if (!handler) return undefined

  const type = checker.getTypeOfSymbolAtLocation(handler, handler.declarations[0])
  const members = type.isUnion() ? type.types : [type]
  const argument = members.map((member) => member.aliasTypeArguments?.[0]).find(Boolean)

  return argument ? (elementTags[argument.symbol?.name] ?? 'root') : undefined
}

const refElementOf = (checker, symbol) => {
  const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration ?? symbol.declarations[0])

  return /RefAttributes<(\w+)>/.exec(checker.typeToString(type, undefined, typeFlags))?.[1]
}

const componentDoc = (checker, name, symbol, argTypes) => {
  const signature = callSignatureOf(checker, symbol)
  const parameter = signature.parameters[0]
  const propsType = parameter ? checker.getTypeOfSymbolAtLocation(parameter, parameter.declarations[0]) : undefined
  const properties = propsType ? propsType.getProperties() : []
  const own = properties.filter((property) => property.declarations?.some(isOwn))
  const inherited = properties.some((property) => !property.declarations?.some(isOwn))
  const refTag = refElementOf(checker, symbol)

  return {
    name,
    element: inherited ? elementOf(checker, propsType) : undefined,
    refElement: refTag ? (elementTags[refTag] ?? 'root') : undefined,
    props: own.map((property) => {
      const argType = argTypes[property.getName()] ?? {}

      return {
        name: property.getName(),
        type: argType.table?.type?.summary ?? typeOf(checker, property),
        required: !(property.flags & ts.SymbolFlags.Optional),
        default: argType.table?.defaultValue?.summary,
        description: argType.description
      }
    })
  }
}

const memberTypeOf = (checker, member) => {
  const declaration = member.declarations?.[0]

  return declaration?.type ? declaration.type.getText().replace(/\s+/g, ' ') : checker.typeToString(checker.getTypeOfSymbolAtLocation(member, declaration), undefined, typeFlags)
}

const parameterText = (checker, parameter) => {
  const declaration = parameter.valueDeclaration
  const optional = Boolean(declaration.questionToken || declaration.initializer)
  const type = declaration.type ? declaration.type.getText() : checker.typeToString(checker.getTypeOfSymbolAtLocation(parameter, declaration), undefined, typeFlags)

  return `${parameter.getName()}${optional ? '?' : ''}: ${type.replace(/\s+/g, ' ')}`
}

const hookDoc = (checker, name, symbol) => {
  const signature = callSignatureOf(checker, symbol)
  const returned = signature.getReturnType()
  const parameters = signature.parameters.map((parameter) => parameterText(checker, parameter)).join(', ')
  const members = returned.flags & ts.TypeFlags.Object && returned.getProperties().length > 0 ? returned.getProperties().map((member) => ({ name: member.getName(), type: memberTypeOf(checker, member) })) : []

  return { name, signature: `${name}(${parameters}): ${checker.typeToString(returned, undefined, typeFlags | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope)}`, note: hookNotes[name], members }
}

const storyFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => (entry.isDirectory() ? storyFiles(join(directory, entry.name)) : entry.name === 'index.stories.tsx' ? [join(directory, entry.name)] : []))
    .sort()

const loadStoryDocs = async (server) => {
  const library = await server.ssrLoadModule('/lib/index.ts')
  const names = new Map(Object.entries(library).map(([name, value]) => [value, name]))
  const docs = new Map()

  for (const file of storyFiles(storiesRoot)) {
    const { default: meta } = await server.ssrLoadModule(`/${relative(root, file).replaceAll('\\', '/')}`)
    const name = names.get(meta.component)

    if (name && !docs.has(name)) docs.set(name, meta.argTypes ?? {})
  }

  return docs
}

const buildModel = async () => {
  const { program, checker } = createProgram()
  const server = await createServer({ root, configFile: join(root, 'vite.config.ts'), appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, watch: null } })

  try {
    const docs = await loadStoryDocs(server)
    const exported = valueExports(program, checker)

    return {
      components: exported.filter(({ name, symbol }) => /^[A-Z]/.test(name) && callSignatureOf(checker, symbol)).map(({ name, symbol }) => componentDoc(checker, name, symbol, docs.get(name) ?? {})),
      hooks: exported.filter(({ name }) => /^use[A-Z]/.test(name)).map(({ name, symbol }) => hookDoc(checker, name, symbol))
    }
  } finally {
    await server.close()
  }
}

const model = await buildModel()
const markdown = renderApiDocs(model)
const undocumented = model.components.flatMap(({ name, props }) => props.filter((prop) => !prop.description).map((prop) => `${name}.${prop.name}`))
const normalize = (text) => text.replace(/\r\n/g, '\n')

if (check) {
  const current = existsSync(outputPath) ? normalize(readFileSync(outputPath, 'utf8')) : ''

  if (current !== markdown) {
    console.error('API.md is out of date: run "npm run docs:api" and commit the result')
    process.exit(1)
  }

  console.log(`API.md is up to date: ${model.components.length} components, ${model.hooks.length} hooks`)
} else {
  writeFileSync(outputPath, markdown)
  console.log(`API.md written: ${model.components.length} components, ${model.hooks.length} hooks, ${undocumented.length} props without a description`)
  if (undocumented.length > 0) console.log(undocumented.map((entry) => `  - ${entry}`).join('\n'))
}

process.exit(0)
