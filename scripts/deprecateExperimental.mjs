import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

import { exportsOf, wrapperOf } from './hookDeclarations.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const declarations = join(root, 'dist-lib', 'types', 'lib')

const genericTypes = (file, names) => {
  const program = ts.createProgram([file], { noEmit: true, skipLibCheck: true, strict: true, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, types: [] })
  const checker = program.getTypeChecker()
  const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(file)))

  return names.filter((name) => {
    const symbol = exported.find((item) => item.getName() === name)
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol

    return (target.declarations ?? []).some((declaration) => (declaration.typeParameters?.length ?? 0) > 0)
  })
}

const names = readdirSync(join(declarations, 'experimental'))
  .filter((file) => file.endsWith('.d.ts'))
  .map((file) => file.slice(0, -'.d.ts'.length))
  .sort()

if (names.length === 0) throw new Error('the package declares no experimental entry to deprecate')

for (const name of names) {
  const headless = join(declarations, 'headless', `${name}.d.ts`)
  const exported = exportsOf(readFileSync(headless, 'utf8'))
  const generic = genericTypes(headless, exported.types)

  if (generic.length > 0) throw new Error(`enchase/headless/${name} exports ${generic.join(', ')} with type parameters, which the deprecated entry cannot repeat as an alias: write the wrapper by hand in scripts/hookDeclarations.mjs`)

  writeFileSync(join(declarations, 'experimental', `${name}.d.ts`), wrapperOf(name, exported))
}

console.log(`deprecated declarations written: ${names.length} experimental entries now alias the headless ones with @deprecated`)
