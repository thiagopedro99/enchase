export const hookNotes = {
  useBreakpoint: 'Faixa de tela atual, de `xs` a `xxl`, segundo os breakpoints do `UIProvider`. `up(nome)` vale quando a tela tem pelo menos `nome` e `down(nome)` quando é menor que `nome`. No servidor e na hidratação vale o argumento `server` (padrão `xs`); depois de montar, vale a largura real.',
  useColorMode: 'Modo de cor escolhido (`light`, `dark` ou `system`), o modo resolvido (`light` ou `dark`) e as funções para trocá-lo. Lança um erro fora do `ColorModeProvider`.',
  useScrollSpy: 'Devolve o `id` da seção que está na faixa de leitura, de `topOffset` px (padrão 96) do topo até 45% da altura da tela, ou `undefined` enquanto nenhuma chegou. Mantenha o array de `ids` estável.',
  useToast: 'Abre notificações pelos métodos `success`, `error`, `warning` e `info`, por exemplo `success("Salvo", 3000)`. `duration` está em milissegundos e 0 mantém a notificação aberta. Lança um erro fora do `ToastProvider`.',
  useUIConfig: 'Configuração do `UIProvider` mais próximo: motion, rótulos, direção do texto e breakpoints. Sem provedor, devolve os valores padrão.'
}

const collator = (first, second) => (first.name < second.name ? -1 : first.name > second.name ? 1 : 0)

export const escapeCell = (text) => text.replace(/\s*\r?\n\s*/g, ' ').replace(/\|/g, '\\|').trim()

const code = (text) => `\`${escapeCell(text)}\``

const defaultCell = ({ required, default: fallback }) => (required ? '*obrigatória*' : fallback ? code(fallback) : '—')

const propRow = (prop) => `| ${code(prop.name)} | ${code(prop.type)} | ${defaultCell(prop)} | ${escapeCell(prop.description ?? '')} |`

const attributeNote = (element) => (element === 'root' ? 'Aceita também os demais atributos HTML do elemento raiz.' : `Aceita também os demais atributos de ${code(`<${element}>`)}, repassados ao elemento.`)

const refNote = (element) => (element === 'root' ? 'Encaminha o `ref` para o elemento raiz.' : `Encaminha o \`ref\` para ${code(`<${element}>`)}.`)

const componentSection = ({ name, description, props, element, refElement }) => {
  const notes = [element && attributeNote(element), refElement && refNote(refElement)].filter(Boolean)
  const table = props.length > 0 ? ['| Prop | Tipo | Padrão | Descrição |', '| --- | --- | --- | --- |', ...props.map(propRow)] : ['Sem props próprias.']

  return [`### ${name}`, '', ...(description ? [description, ''] : []), ...table, ...(notes.length > 0 ? ['', notes.join(' ')] : [])].join('\n')
}

const hookSection = ({ name, signature, note, members }) => {
  const returned = members.length > 0 ? ['', 'Retorno:', '', '| Membro | Tipo |', '| --- | --- |', ...members.map((member) => `| ${code(member.name)} | ${code(member.type)} |`)] : []

  return [`### ${name}`, '', '```ts', signature, '```', ...(note ? ['', note] : []), ...returned].join('\n')
}

export const renderApiDocs = ({ components, hooks }) => {
  const sortedComponents = [...components].sort(collator)
  const sortedHooks = [...hooks].sort(collator)
  const index = sortedComponents.map(({ name }) => `[${name}](#${name.toLowerCase()})`).join(' · ')

  return (
    [
      '# API',
      '',
      'Referência das props e dos hooks exportados por `enchase`, gerada por `npm run docs:api` a partir dos tipos do pacote e das stories do Storybook. Não edite este arquivo à mão: mude o tipo ou o `argTypes` da story e gere de novo.',
      '',
      'Exemplos de uso estão no [README](README.md) e no [Storybook](https://enchase.othiagosilva.com.br/docs/).',
      '',
      '## Componentes',
      '',
      index,
      '',
      sortedComponents.map(componentSection).join('\n\n'),
      '',
      '## Hooks',
      '',
      sortedHooks.map(({ name }) => `[${name}](#${name.toLowerCase()})`).join(' · '),
      '',
      sortedHooks.map(hookSection).join('\n\n')
    ].join('\n') + '\n'
  )
}
