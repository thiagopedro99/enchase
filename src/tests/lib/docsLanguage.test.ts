import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import path from 'node:path'
import ts from 'typescript'

interface Entry {
  file: string
  where: string
  text: string
}

const root = path.resolve(__dirname, '../../..')

const accents = /[àáâãçéêíóôõú]/i

const stopwords = new Set(['para', 'uma', 'das', 'dos', 'pelo', 'pela', 'quando', 'mais', 'sem', 'como', 'cada', 'isso', 'aqui', 'porque', 'onde', 'mas', 'seu', 'sua', 'seus', 'suas', 'esse', 'essa', 'esses', 'essas', 'este', 'esta', 'estes', 'estas', 'entre', 'sobre', 'depois', 'antes', 'apenas', 'ainda', 'sempre', 'nunca', 'mesmo', 'mesma', 'dentro', 'enquanto', 'quem', 'que', 'por', 'ou', 'se', 'ao', 'aos'])

const verbs = new Set(['usa', 'usam', 'vale', 'valem', 'mostra', 'mostram', 'ajusta', 'deixa', 'aparece', 'ocupa', 'sobe', 'troca', 'vem', 'fica', 'ficam', 'vira', 'viram', 'aceita', 'aceitam', 'exige', 'passa', 'muda', 'continua', 'devolve', 'lança', 'aplica', 'leva', 'levam', 'tem', 'faz'])

const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

const glossary = JSON.parse(read('scripts/docsGlossary.json')) as { terms: Record<string, string> }

const vocabulary = new Set(Object.keys(glossary.terms).filter((term) => /^[a-z]+$/.test(term)))

const withoutCode = (text: string) => text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ').replace(/https?:\/\/\S+/g, ' ').replace(/\]\([^)]*\)/g, ' ').replace(/<[^>]*>/g, ' ')

const portugueseIn = (text: string) => {
  const words = withoutCode(text).toLowerCase().match(/[a-zà-ú]+/g) ?? []

  return [...new Set(words.filter((word) => accents.test(word) || stopwords.has(word) || verbs.has(word) || vocabulary.has(word)))]
}

const filesIn = (directory: string): string[] =>
  readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(directory, entry.name)

    return entry.isDirectory() ? filesIn(relative) : [relative]
  })

const textOf = (node: ts.Node) => {
  if (ts.isStringLiteralLike(node)) return node.text
  if (ts.isTemplateExpression(node)) return [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join(' ')

  return undefined
}

const namesOf = (node: ts.Node) => {
  const names: string[] = []

  for (let current: ts.Node | undefined = node; current; current = current.parent) {
    if (ts.isPropertyAssignment(current) && (ts.isIdentifier(current.name) || ts.isStringLiteral(current.name))) names.unshift(current.name.text)
  }

  return names.join('.')
}

const isMeta = (node: ts.Node) => {
  let outer = node

  while (ts.isAsExpression(outer.parent) || ts.isSatisfiesExpression(outer.parent)) outer = outer.parent

  return ts.isVariableDeclaration(outer.parent) && outer.parent.name.getText() === 'meta'
}

const inStory = (names: string, node: ts.PropertyAssignment) => /(^|\.)argTypes\.[^.]+\.description$|(^|\.)parameters\.docs\.description\.(component|story)$/.test(names) || (names === 'title' && isMeta(node.parent))

const inShared = (names: string) => /(^|\.)(description|title)$/.test(names)

const propertyTexts = (file: string, accepts: (names: string, node: ts.PropertyAssignment) => boolean): Entry[] => {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  const found: Entry[] = []

  const visit = (node: ts.Node) => {
    if (ts.isPropertyAssignment(node)) {
      const text = textOf(node.initializer)
      const names = namesOf(node)

      if (text !== undefined && accepts(names, node)) found.push({ file, where: names, text })
    }

    ts.forEachChild(node, visit)
  }

  visit(source)

  return found
}

const literalTexts = (file: string): Entry[] => {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true)
  const found: Entry[] = []

  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isTemplateLiteralToken(node)) found.push({ file, where: `line ${source.getLineAndCharacterOfPosition(node.getStart()).line + 1}`, text: node.text })

    ts.forEachChild(node, visit)
  }

  visit(source)

  return found
}

const proseTexts = (file: string): Entry[] => {
  const text = read(file)
  const title = /<Meta\s+title="([^"]*)"/.exec(text)?.[1]
  const body = text.split(/\r?\n/).filter((line) => !/^(import|export)\s/.test(line)).join('\n')

  return [...(title === undefined ? [] : [{ file, where: 'Meta title', text: title }]), { file, where: 'prose', text: body }]
}

const entries: Entry[] = [
  ...filesIn('src/docs').filter((file) => file.endsWith('.stories.tsx')).flatMap((file) => propertyTexts(file, inStory)),
  ...filesIn('src/docs/shared').filter((file) => path.posix.dirname(file) === 'src/docs/shared' && file.endsWith('.ts')).flatMap((file) => propertyTexts(file, inShared)),
  ...literalTexts('scripts/apiDocs.mjs'),
  ...['README.md', 'CONTRIBUTING.md', 'public/llms.txt', ...filesIn('src/docs/pages').filter((file) => file.endsWith('.mdx'))].flatMap(proseTexts)
]

const scanned = [...new Set(entries.map((entry) => entry.file))]

describe('the language of the docs', () => {
  it('keeps the text of every doc free of Portuguese', () => {
    const found = entries.flatMap((entry) => {
      const words = portugueseIn(entry.text)

      return words.length > 0 ? [`${entry.file} (${entry.where}): ${words.join(', ')}`] : []
    })

    expect(found, 'write the docs in English, with the terms of scripts/docsGlossary.json').toEqual([])
  })

  it('scans the stories, the pages, the shared texts, the generator and the root docs', () => {
    expect(scanned).toEqual(expect.arrayContaining(['README.md', 'CONTRIBUTING.md', 'public/llms.txt', 'scripts/apiDocs.mjs', 'src/docs/pages/introduction.mdx', 'src/docs/pages/motion.mdx', 'src/docs/shared/apiNotes.ts', 'src/docs/shared/argTypes.ts']))
    expect(scanned.filter((file) => file.endsWith('.stories.tsx')).length).toBeGreaterThan(40)
  })

  it('has English on the right side of every term of the glossary', () => {
    expect(Object.values(glossary.terms).filter((english) => accents.test(english))).toEqual([])
  })
})

describe('the Portuguese detector', () => {
  it('finds accents, common words, verbs and the terms of the glossary', () => {
    expect(portugueseIn('Aceita a cor do botão.')).toEqual(['aceita', 'cor', 'botão'])
    expect(portugueseIn('Estilo para a barra lateral')).toEqual(['estilo', 'para', 'barra'])
    expect(portugueseIn('Nome do ícone')).toEqual(['nome', 'ícone'])
  })

  it('lets English through, including the words that look like Portuguese in code', () => {
    expect(portugueseIn('Visual style of the button, with a focus ring around the field.')).toEqual([])
    expect(portugueseIn('The `para` prop, [guide](https://example.com/padrão) and <b title="botão">bold</b>.')).toEqual([])
    expect(portugueseIn('```ts\nconst cor = "botão"\n```')).toEqual([])
  })
})
