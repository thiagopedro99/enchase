export const hookNotes = {
  useBreakpoint: 'Faixa de tela atual, de `xs` a `xxl`, segundo os breakpoints do `UIProvider`. `up(nome)` vale quando a tela tem pelo menos `nome` e `down(nome)` quando é menor que `nome`. No servidor e na hidratação vale o argumento `server` (padrão `xs`); depois de montar, vale a largura real.',
  useColorMode: 'Modo de cor escolhido (`light`, `dark` ou `system`), o modo resolvido (`light` ou `dark`) e as funções para trocá-lo. Lança um erro fora do `ColorModeProvider`.',
  useScrollSpy: 'Devolve o `id` da seção que está na faixa de leitura, de `topOffset` px (padrão 96) do topo até 45% da altura da tela, ou `undefined` enquanto nenhuma chegou. Acompanha as seções que montam depois, remontam ou saem da página, e só o conteúdo do array de `ids` conta, não a identidade dele.',
  useToast: 'Abre notificações pelos métodos `success`, `error`, `warning` e `info`, por exemplo `success("Salvo", 3000)`, e cada um devolve o id da notificação, que `removeToast(id)` aceita para fechá-la. `duration` está em milissegundos e 0 mantém a notificação aberta até alguém fechá-la. Lança um erro fora do `ToastProvider`.',
  useUIConfig: 'Configuração do `UIProvider` mais próximo: motion, rótulos, direção do texto, código do idioma (`locale`, como `pt-BR`) e breakpoints. Sem provedor, devolve os valores padrão.'
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

const iconsIntro = 'Exportados por `enchase/icons`, um componente por ícone, e só os que algum componente usa por dentro. Funcionam em Server Components. Todos têm as mesmas props. Sem `title` o ícone é decorativo (`aria-hidden`); com `title` vira uma imagem com nome acessível. O atributo `data-icon` leva o nome em kebab case, para estilizar de fora ou nos testes, e os que apontam para um lado espelham em RTL sozinhos. Mudar o desenho de um ícone não é uma quebra; renomear ou remover é.'

const iconsSection = ({ props, element, items }) => {
  const table = ['| Prop | Tipo | Padrão | Descrição |', '| --- | --- | --- | --- |', ...props.map(propRow)]
  const rows = [...items].sort(collator).map(({ name, dataIcon, directional }) => `| ${code(name)} | ${code(dataIcon)} | ${directional ? 'sim' : '—'} |`)

  return ['## Ícones', '', iconsIntro, '', ...table, '', attributeNote(element), '', '| Ícone | `data-icon` | Espelha em RTL |', '| --- | --- | --- |', ...rows].join('\n')
}

const hookSection = ({ name, signature, note, members }) => {
  const returned = members.length > 0 ? ['', 'Retorno:', '', '| Membro | Tipo |', '| --- | --- |', ...members.map((member) => `| ${code(member.name)} | ${code(member.type)} |`)] : []

  return [`### ${name}`, '', '```ts', signature, '```', ...(note ? ['', note] : []), ...returned].join('\n')
}

const cssHooksIntro =
  'Variáveis CSS opcionais que cada componente lê para mudar uma medida, uma fonte, um canto ou um tempo sem escrever CSS por cima. O tema não as declara: sem valor, o componente usa o padrão da tabela, e um padrão que aponta para um token do tema continua seguindo uma sobrescrita desse token. O nome é `--enchase-<data-slot>-<propriedade>`, com o nome do `data-slot` da parte e, quando há mais de um tamanho ou variante, o sufixo dela (`--enchase-switch-thumb-size`, `--enchase-button-padding-inline-md`). Experimentais até a versão 1.0: um nome pode mudar numa versão menor.'

const cssHookDefault = ({ default: fallback, token }) => (token ? `${code(fallback)} (${code(token)})` : code(fallback))

const cssHookProperties = ({ properties, components, owner }) => {
  const others = components.filter((component) => component !== owner)

  return `${properties.map(code).join(', ')}${others.length > 0 ? ` (também em ${others.join(', ')})` : ''}`
}

const cssHooksSection = (cssHooks) =>
  [
    '## Ganchos de CSS',
    '',
    cssHooksIntro,
    '',
    cssHooks
      .map(({ component, hooks }) =>
        [`### ${component}`, '', '| Gancho | Padrão | Propriedade |', '| --- | --- | --- |', ...hooks.map((hook) => `| ${code(hook.name)} | ${cssHookDefault(hook)} | ${cssHookProperties(hook)} |`)].join('\n')
      )
      .join('\n\n')
  ].join('\n')

export const renderApiDocs = ({ components, hooks, icons, cssHooks = [] }) => {
  const sortedComponents = [...components].sort(collator)
  const sortedHooks = [...hooks].sort(collator)
  const index = sortedComponents.map(({ name }) => `[${name}](#${name.toLowerCase()})`).join(' · ')

  return (
    [
      '# API',
      '',
      'Referência das props, dos hooks e dos ícones exportados por `enchase` e `enchase/icons`, gerada por `npm run docs:api` a partir dos tipos do pacote e das stories do Storybook. Não edite este arquivo à mão: mude o tipo ou o `argTypes` da story e gere de novo.',
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
      sortedHooks.map(hookSection).join('\n\n'),
      '',
      iconsSection(icons),
      ...(cssHooks.length > 0 ? ['', cssHooksSection(cssHooks)] : [])
    ].join('\n') + '\n'
  )
}
