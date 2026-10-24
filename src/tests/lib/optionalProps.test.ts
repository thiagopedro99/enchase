import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const root = path.resolve(__dirname, '../..')

const skipped = ['tests', 'tests-browser', 'docs']

const sourcesIn = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name)

    if (entry.isDirectory()) return skipped.includes(path.relative(root, full).split(path.sep)[0]) ? [] : sourcesIn(full)

    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts') ? [full] : []
  })

const allowsUndefined = (type: ts.TypeNode): boolean => {
  if (type.kind === ts.SyntaxKind.UndefinedKeyword || type.kind === ts.SyntaxKind.NeverKeyword) return true
  if (ts.isUnionTypeNode(type)) return type.types.some(allowsUndefined)
  if (ts.isParenthesizedTypeNode(type)) return allowsUndefined(type.type)

  return false
}

const optionalsWithoutUndefined = (name: string, text: string) => {
  const source = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true)
  const found: string[] = []

  const visit = (node: ts.Node) => {
    const optional = (ts.isPropertySignature(node) || ts.isMethodSignature(node)) && node.questionToken !== undefined
    const accepted = ts.isPropertySignature(node) && node.type !== undefined && allowsUndefined(node.type)

    if (optional && !accepted) found.push(`${name}:${source.getLineAndCharacterOfPosition(node.getStart()).line + 1} ${node.name.getText(source)}`)

    ts.forEachChild(node, visit)
  }

  visit(source)

  return found
}

describe('the optional properties of the types of the library', () => {
  it('all say | undefined, so a project with exactOptionalPropertyTypes can pass a value that may be undefined', () => {
    const missing = sourcesIn(root).flatMap((file) => optionalsWithoutUndefined(path.relative(root, file), readFileSync(file, 'utf8')))

    expect(missing).toEqual([])
  })

  it('finds an optional property or method that does not accept undefined, and lets the others through', () => {
    const text = 'interface Probe { a?: string; b?: string | undefined; c?: never; d?: (() => void) | undefined; e?(): void; f?: (value: string) => void }\ntype Alias = { g?: number; h?: { i?: boolean; j?: boolean | undefined } | undefined }'

    expect(optionalsWithoutUndefined('probe.ts', text).map((entry) => entry.split(' ')[1])).toEqual(['a', 'e', 'f', 'g', 'i'])
  })
})
