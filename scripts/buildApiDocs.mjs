import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'
import { createServer } from 'vite'

import { hookNotes, renderApiDocs } from './apiDocs.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const posixRoot = root.replaceAll('\\', '/')
const outputPath = join(root, 'API.md')
const storiesRoot = join(root, 'src', 'docs', 'stories')
const check = process.argv.includes('--check')

const elementTags = {
  HTMLAnchorElement: 'a',
  HTMLButtonElement: 'button',
  HTMLDivElement: 'div',
  HTMLFieldSetElement: 'fieldset',
  HTMLInputElement: 'input',
  HTMLSelectElement: 'select',
  HTMLSpanElement: 'span',
  HTMLTextAreaElement: 'textarea',
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

const resolved = (checker, symbol) => (symbol && symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol)

const literalText = (checker, expression, depth = 0) => {
  if (ts.isStringLiteralLike(expression)) return `'${expression.text}'`
  if (ts.isNumericLiteral(expression) || ts.isPrefixUnaryExpression(expression)) return expression.getText()
  if (expression.kind === ts.SyntaxKind.TrueKeyword || expression.kind === ts.SyntaxKind.FalseKeyword) return expression.getText()
  if (ts.isArrayLiteralExpression(expression) && expression.elements.length === 0) return '[]'
  if (ts.isIdentifier(expression) && depth < 4) {
    const declaration = resolved(checker, checker.getSymbolAtLocation(expression))?.valueDeclaration

    return declaration && ts.isVariableDeclaration(declaration) && declaration.initializer ? literalText(checker, declaration.initializer, depth + 1) : undefined
  }

  return undefined
}

const componentFunction = (declaration) => {
  const expression = declaration && ts.isVariableDeclaration(declaration) ? declaration.initializer : declaration

  if (!expression) return undefined
  if (ts.isArrowFunction(expression) || ts.isFunctionExpression(expression) || ts.isFunctionDeclaration(expression)) return expression
  if (ts.isAsExpression(expression) || ts.isParenthesizedExpression(expression)) return componentFunction(expression.expression)
  if (ts.isCallExpression(expression)) return expression.arguments.map(componentFunction).find(Boolean)

  return undefined
}

const codeDefaults = (checker, symbol) => {
  const pattern = componentFunction(symbol.valueDeclaration)?.parameters[0]?.name

  if (!pattern || !ts.isObjectBindingPattern(pattern)) return new Map()

  return new Map(
    pattern.elements
      .filter((element) => element.initializer)
      .map((element) => [(element.propertyName ?? element.name).getText(), literalText(checker, element.initializer)])
      .filter(([, value]) => value !== undefined && value !== "''")
  )
}

const componentDoc = (checker, name, symbol, { argTypes, description }) => {
  const signature = callSignatureOf(checker, symbol)
  const parameter = signature.parameters[0]
  const propsType = parameter ? checker.getTypeOfSymbolAtLocation(parameter, parameter.declarations[0]) : undefined
  const properties = propsType ? propsType.getProperties() : []
  const own = properties.filter((property) => property.declarations?.some(isOwn))
  const inherited = properties.some((property) => !property.declarations?.some(isOwn))
  const refTag = refElementOf(checker, symbol)
  const defaults = codeDefaults(checker, symbol)

  return {
    name,
    description,
    element: inherited ? elementOf(checker, propsType) : undefined,
    refElement: refTag ? (elementTags[refTag] ?? 'root') : undefined,
    props: own.map((property) => {
      const argType = argTypes[property.getName()] ?? {}

      return {
        name: property.getName(),
        type: argType.table?.type?.summary ?? typeOf(checker, property),
        required: !(property.flags & ts.SymbolFlags.Optional),
        default: defaults.get(property.getName()) ?? argType.table?.defaultValue?.summary,
        storyDefault: argType.table?.defaultValue?.summary,
        codeDefault: defaults.get(property.getName()),
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

    if (name && !docs.has(name)) docs.set(name, { argTypes: meta.argTypes ?? {}, description: meta.parameters?.docs?.description?.component })
  }

  const { apiNotes } = await server.ssrLoadModule('/src/docs/shared/apiNotes.ts')

  for (const [name, notes] of Object.entries(apiNotes)) {
    if (docs.has(name)) throw new Error(`apiNotes documents ${name}, which already has a story: keep one of them`)

    docs.set(name, { argTypes: notes.argTypes, description: notes.description })
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
      components: exported.filter(({ name, symbol }) => /^[A-Z]/.test(name) && callSignatureOf(checker, symbol)).map(({ name, symbol }) => componentDoc(checker, name, symbol, docs.get(name) ?? { argTypes: {} })),
      hooks: exported.filter(({ name }) => /^use[A-Z]/.test(name)).map(({ name, symbol }) => hookDoc(checker, name, symbol))
    }
  } finally {
    await server.close()
  }
}

const model = await buildModel()
const markdown = renderApiDocs(model)
const normalize = (text) => text.replace(/\r\n/g, '\n')
const list = (entries) => entries.map((entry) => `  - ${entry}`).join('\n')
const unquoted = (value) => String(value).replace(/['"]/g, '')

const divergentDefaults = model.components.flatMap(({ name, props }) =>
  props.filter((prop) => prop.codeDefault !== undefined && prop.storyDefault !== undefined && unquoted(prop.codeDefault) !== unquoted(prop.storyDefault)).map((prop) => `${name}.${prop.name}: the code uses ${prop.codeDefault} and the story says ${prop.storyDefault}`)
)
const undocumented = model.components.flatMap(({ name, props }) => props.filter((prop) => !prop.description).map((prop) => `${name}.${prop.name}`))
const withoutCode = (text) => text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
const unsafeMarkdown = model.components
  .flatMap(({ name, description, props }) => [[name, description], ...props.map((prop) => [`${name}.${prop.name}`, prop.description])])
  .filter(([, text]) => text && /<[a-zA-Z/!]|\*/.test(withoutCode(text)))
  .map(([where]) => where)
const undescribed = model.components.filter((component) => !component.description).map((component) => component.name)
const problems = [
  ...(divergentDefaults.length > 0 ? [`defaults that differ between the code and the story:\n${list(divergentDefaults)}`] : []),
  ...(undocumented.length > 0 ? [`props without a description in the story argTypes:\n${list(undocumented)}`] : []),
  ...(unsafeMarkdown.length > 0 ? [`descriptions with an HTML tag or an asterisk outside a code span (wrap it in backticks):\n${list(unsafeMarkdown)}`] : []),
  ...(undescribed.length > 0 ? [`components without a description (parameters.docs.description.component in the story):\n${list(undescribed)}`] : [])
]

if (check) {
  const current = existsSync(outputPath) ? normalize(readFileSync(outputPath, 'utf8')) : ''

  if (current !== markdown) problems.unshift('API.md is out of date: run "npm run docs:api" and commit the result')
  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exit(1)
  }

  console.log(`API.md is up to date: ${model.components.length} components, ${model.hooks.length} hooks`)
} else {
  writeFileSync(outputPath, markdown)
  console.log(`API.md written: ${model.components.length} components, ${model.hooks.length} hooks`)
  if (problems.length > 0) {
    console.error(problems.join('\n'))
    process.exit(1)
  }
}

process.exit(0)
