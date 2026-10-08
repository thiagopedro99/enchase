# skill.md — enchase code conventions

Convenções de código do template. Prioridade absoluta: consistência com o padrão já existente no projeto — evite reinventar a roda ou introduzir abstrações não pedidas explicitamente.

## Estilo de código

- Sem ponto e vírgula no fim das instruções.
- Aspas simples em strings e imports.
- Imports locais com a extensão do arquivo (`'./types.ts'`, `'../Button/index.tsx'`).
- Linha vazia antes do `return` quando a função tem mais de uma instrução.
- **Nunca comentar código** — sem `//`, `/* */`, `{/* */}` nem comentário dentro dos arquivos `.module.css`. Nem cabeçalho com o caminho do arquivo. O nome claro do componente/função/variável é a documentação. Exceção: diretivas funcionais (`/// <reference ... />`) e texto de exemplo exibido ao usuário (strings de código nas páginas de documentação).

## Formatação e indentação

Linha única **apenas** para:
- Importações: `import { A, B, C } from 'x'`
- Desestruturação de hooks: `const [value, setValue] = useState(false)`
- Declaração de componentes/funções simples: `const MyComponent = () => {label}`
- `if` de retorno antecipado sem bloco: `if (!value) return null`

Sempre indentado (nunca em linha única):
- Blocos de JSX com mais de um elemento filho
- Objetos e arrays com mais de uma propriedade/item
- Funções com corpo `{}` contendo mais de uma instrução
- Ternários com expressões longas (3 linhas: condição, `?` valor, `:` valor)
- Chamadas encadeadas (`.map`, `.filter`, `.reduce`) com callbacks multilinhas
- `if/else` com blocos `{}`
- `return` de JSX com mais de um nível de aninhamento

Regra geral: se o conteúdo não cabe legível em ~100 caracteres, indente. Compacto significa sem linhas vazias desnecessárias, não significa ausência de indentação.

## Imports

- Sempre em linha única — proibido quebrar linha dentro de `import { A, B }`; deixe a linha longa se necessário.
- 3 blocos separados por 1 linha vazia: bibliotecas externas > módulos internos > `import type`.
- Dentro de cada bloco, ordene do import mais longo (mais caracteres) para o mais curto.
- Remova imports não usados; o código não deve compilar com imports sobrando.

## Componentização (obrigatório)

- `index.tsx` de uma página é só orquestrador de estado e layout — não contém blocos complexos de JSX.
- Divida a UI em seções lógicas (Header, Filters, List, Footer...), cada uma em pasta própria sob `/subcomponentes`, seguindo o padrão de 3 arquivos: `index`/`styles`, `types` (obrigatório em TS), `defaultData` (se necessário).
- Todo valor padrão de prop mora no `defaultData.ts` do componente como `defaultNome` (ex.: `defaultVariant`, `defaultSize`), e o componente e os estilos usam essa constante em vez de escrever o valor no código. A story do componente importa a mesma constante para `args` e para a coluna de padrão da tabela de props. Prop sem padrão não ganha constante.
- Nunca entregue uma página monolítica: se o JSX passar de ~100 linhas, extraia.
- `/components` é só para itens reutilizados em múltiplas páginas.
- Sem estilos inline — sempre em `styles.module.css` (ver seção Estilos). Exceções: valores dinâmicos passados como variável CSS (ver seção Estilos) e valores dinâmicos de `motion` (ver seção Animação).
- Proibido `import React from 'react'` (JSX transform é padrão); importe só o que usa (`{ useState }` etc).

## Estilos (CSS Modules)

- CSS Modules é o único mecanismo de estilo: cada componente tem um `styles.module.css` ao lado do `index.tsx`, importado como `import styles from './styles.module.css'`. Sem CSS-in-JS e sem biblioteca de UI.
- Classes combinadas com `classNames` de `@utils/classNames.ts`: `className={classNames(styles.button, className)}`. O componente sempre aceita e mescla o `className` de quem usa.
- Variantes e tamanhos (valores de lista fixa) viram atributos `data-*` no elemento (`data-variant`, `data-size`; booleano por presença do atributo, como `data-full-width`), e o CSS usa seletor de atributo (`.button[data-variant='outline']`). A prop pública tem nome simples (`variant`, `size`, `fullWidth`), nunca com `$`, e não é repassada ao DOM.
- Valores livres (largura, número de colunas, tamanho calculado) passam por variável CSS inline (`style={{ '--grid-template-columns': value }}`), declarada e usada no `.module.css`. Fora isso, só valores do `motion` ficam em `style`.
- Estados por pseudo-classe e atributo ARIA (`:hover`, `:focus-visible`, `:disabled`, `[aria-invalid='true']`), não por prop espelhada.
- Valores do tema só por variáveis CSS `--enchase-*`: cores (`--enchase-color-*`, aninhadas em kebab: `text.primary` vira `--enchase-color-text-primary`), `--enchase-shadow-*`, fontes (`--enchase-font-primary`, `--enchase-font-size-*`, `--enchase-font-weight-*`), `--enchase-space-*`, `--enchase-radius-*`, `--enchase-transition-*`, `--enchase-state-*` e `--enchase-z-*`. Nunca hex, `rgba` nem espaçamento de tema soltos. Medidas próprias do componente (altura de um botão, por exemplo) podem ser literais.
- Breakpoints não têm variável (media query não aceita `var()`): use o valor literal no CSS, igual ao de `breakpoints` em `src/styles/tokens/base.ts`. Em JS, importe `breakpoints` de `@styles/tokens/index.ts`.
- O tema mora em `src/styles/`, dividido em `tokens/` (dados), `theme/` (construção e validação: `createTheme`, `validateTheme`, validadores) e `css/` (geração das variáveis e do CSS global), mais `react.tsx` (`GlobalStyles` e `ThemeVariables`). `tokens` não importa nada; `theme` e `css` só importam de `tokens`; só `react.tsx` usa React. `styles/index.ts` reexporta tudo menos o React. Mudar um token é mudar `tokens/`: as variáveis saem sozinhas.
- Tema do usuário entra por `<ColorModeProvider theme={...}>` no formato de `createTheme`. Todo valor de cor, família, tamanho e peso passa por validador (`isValidColor`, `isValidFontFamily`, `isValidFontSize`, `isValidFontWeight`) antes de virar CSS; nunca interpolar valor de tema sem validar.
- O modo de cor (`light`, `dark` ou `system`) vem do `ColorModeProvider`; leia e troque com `useColorMode()` e nunca guarde o tema em um store. O `data-theme` do `<html>` troca os valores das variáveis, então os componentes não conhecem o modo.
- Nome da classe reflete o elemento semântico (`.container`, `.header`), não o estilo (`.blueBox`).

## Componente pronto (checklist)

- Pasta com `index.tsx`, `styles.module.css`, `types.ts` e, se houver valor padrão, `defaultData.ts`.
- Props públicas sem `$`, aceitando e mesclando `className`.
- Variantes por `data-*` e valores do tema por `var(--enchase-*)`.
- Animação por `useMotionRecipe` e prop `animation`; textos de acessibilidade por `useUIConfig().labels`.
- Teste de comportamento e `axe` espelhado em `src/tests/`.
- Story com Playground em `src/docs/stories/`, com as descrições das props em `argTypes`.
- Conferido no navegador nos dois temas.

## Linguagem visual (Material Design 3)

- O visual segue o Material Design 3 implementado só com CSS Modules e variáveis CSS. Nunca usar a biblioteca MUI.
- Cor sempre por papel do tema (`primary`, `primaryContainer`, `surfaceContainer*`, `on*`, `inverse*`, `error`...); proibido hex ou `rgba` solto em `.module.css`; use `var(--enchase-color-*)`. Texto sobre um papel usa o `on*` dele.
- Camadas de superfície: página em `surface`/`background`; cards, barras e diálogos em `surfaceContainerLow`, `surfaceContainer` ou `surfaceContainerHigh`. Elevação por `shadows` só em elementos que flutuam (elevated card, menus, diálogos).
- Hover, foco e pressionado por camada de estado: pseudo-elemento `::after` com `currentColor` e opacidade `var(--enchase-state-hover)` ou `var(--enchase-state-pressed)`, ou `color-mix(in srgb, <cor> 12%, transparent)`; não trocar a cor para escurecer.
- Variantes de botão: `primary` (preenchido), `secondary` (tonal), `outline` e `ghost` (texto). Formas por `--enchase-radius-*`: botões e chips `full`, campos `sm`, cards `xl`, diálogos `2xl`.
- Tipografia: fonte `var(--enchase-font-primary)` (Figtree, importada em `main.tsx`); títulos com peso `medium`.

## Layout e navegação

- Páginas sempre dentro de `Layout` (`@components/layout`). A navegação padrão é `navigation="sidebar"`; `navigation="navbar"` usa a barra superior. Nunca montar `Sidebar` ou `Navbar` direto em uma página.
- Itens de menu vêm de `SidebarSection[]`: rota com `to`, âncora com `href` e ação com `onClick`. Seções específicas da página entram por `pageSections`, com `activePageSectionId` vindo de `useScrollSpy`.
- O `Sidebar` é um componente reutilizável com duas variantes (`permanent` e `modal`) e estado recolhido controlado por quem o usa. No `Layout`, o estado recolhido fica em `useAppStore` (`sidebarCollapsed`) e a abertura do drawer em `sidebarOpen`; o botão que recolhe e abre o menu mora na `AppBar` do `Layout`, não no rodapé da sidebar.
- A `AppBar` do `Layout` reúne botão de menu, `Breadcrumbs` e ações (tema). O botão de menu usa `MenuToggleIcon` (ícone de menu aberto quando expandido, hambúrguer quando fechado, com troca animada) e um `Tooltip` com `describe={false}` repetindo o rótulo da ação atual. A trilha vem da prop `breadcrumbs` ou é derivada do menu e da rota (`deriveBreadcrumbs`); o último item é sempre a página atual, sem link.
- `header` e `footer` do `Sidebar` aceitam um nó ou uma função `({ collapsed }) => nó`, para o conteúdo se adaptar ao modo recolhido (marca compacta, avatar sem nome).
- A ordem do DOM do `Layout` é skip link, `AppBar`, sidebar, `main`, rodapé (posicionados por CSS grid), para o botão de menu vir antes da sidebar no foco.
- Tooltip renderiza a bolha em portal com posição fixa, por isso funciona dentro de containers com scroll; item de menu recolhido usa `Tooltip` com `describe={false}`.
- Dentro de um componente, estilo de layout com CSS explícito no `.module.css` (`display: flex`); `Flex`, `Grid` e `Container` servem para compor páginas.

## Estrutura por entidade (`actions/`, `stores/`, `types/`)

Padrão Actions: cada entidade (ex: `users`) tem sua própria subpasta em `actions/` e, quando tem estado de servidor, em `stores/`:

- `actions/api.ts` — a instância única do Axios (`baseURL` e, se o projeto precisar, interceptors).
- `actions/<entidade>/index.ts` — funções que chamam a API (`listUsers`, `createUser`...), usando a instância `api`. Arrow functions exportadas, sem classe wrapper, devolvendo dado já tipado:
  ```ts
  export const createUser = async (payload: CreateUserInput): Promise<User> => {
    const { data } = await api.post<User>('/users', payload)

    return data
  }
  ```
- `actions/<entidade>/types.ts` — **todos** os tipos daquela entidade: formato de domínio (`User`) e de request/response (`CreateUserInput`, `UpdateUserInput`...) juntos no mesmo arquivo.
- `stores/<entidade>/index.ts` — o store Zustand (`useUserStore`), que chama as actions. Se o nome da action conflitar com o da ação do store, importe com alias (`coverShift as coverShiftRequest`). O tipo do estado fica em `stores/<entidade>/types.ts`.
- `types/` — nunca tem subpasta por entidade (isso é exclusivo de `actions/`/`stores/`); fica só com arquivo solto pro que é genuinamente usado por **mais de uma entidade**. Tipo que só a própria entidade usa vai pro `actions/<entidade>/types.ts` dela, nunca pra `types/`.
- Se a API paginar, o helper genérico fica em `actions/pagination.ts` (ex: `fetchAllPages`), e o tipo da resposta paginada em `types/pagination.ts`.
- `services/` fica reservado pra integração com serviço de terceiro que não seja o próprio backend — só usar se/quando surgir.

## Estado (Zustand)

- Um store por domínio (ex: `useAppStore`, `useDataStore`), nunca um store global único.
- Store expõe estado + ações no mesmo objeto (`create<Store>((set, get) => ({ ... }))`); componentes nunca mutam estado fora de uma ação do store.
- Selecione só o slice necessário no componente (`useDataStore((state) => state.items)`), nunca desestruture o store inteiro — evita rerender desnecessário.
- Estado de servidor (dados vindos da API) fica no store; estado local de UI (aberto/fechado de modal, valor de input) fica em `useState` do próprio componente — não misture os dois num store.

## HTTP (Axios)

- Uma instância única (`actions/api.ts`) com `baseURL` e os interceptors que o projeto precisar — nunca `axios.get`/`axios.post` direto nos componentes.
- Um módulo de action por entidade, cada um exportando funções que chamam a instância única e devolvem dados já tipados (ver seção Estrutura por entidade).
- Chamada HTTP nunca dentro de componente/JSX direto — sempre via hook ou store action que chama a action.
- Erros de resposta tratados no interceptor e/ou na action — componente só lida com estado de loading/erro, nunca com o objeto de erro do Axios cru.

## Animação (`motion`, catálogo de receitas)

- Importar sempre de `motion/react`.
- **Toda animação vem do catálogo em `src/motion/`** (`fade`, `pop`, `slide`, `press`, `lift`, `spin`, `shimmer`), consumido pelo hook `useMotionRecipe(nome, override?, from?)`. Nunca declarar `keyframes`, `animation:` nem `transition: all` em componente; precisando de um movimento novo, adicione uma receita ao catálogo.
- Componente animado: `motion.div`, `motion.button` etc. com o `className` do CSS Module, espalhando o resultado do hook no elemento: `<motion.div {...useMotionRecipe('fade')} className={styles.overlay} />`.
- Posicionamento com `translate` (propriedade individual), nunca `transform`, quando o elemento é animado pelo `motion` — o `motion` controla o `transform` inline.
- Saída animada com `AnimatePresence`; nunca `setTimeout` para esperar animação terminar.
- Todo componente animado aceita a prop `animation?: MotionOverride` (`false` desliga; `{ recipe, from, tuning }` ajusta) e usa o valor global do `UIProvider` (`mode`, `preset`, `recipes`).
- `prefers-reduced-motion` é tratado pelo catálogo (movimento espacial vira fade, `press`/`lift` somem, `spin`/`shimmer` viram pulso de opacidade). Não verificar `useReducedMotion()` dentro de componente.
- Props de handler que o `motion` redefine (`onDrag`, `onDragStart`, `onDragEnd`, `onAnimationStart`) são omitidas do tipo das props do componente.

## Nomenclatura e tipagem

- Inglês, camelCase, sem abreviações.
- Zero `any`. Use `import type` para tipos.

## Estrutura e limites

- Arquivos com mais de ~200 linhas devem ter lógica extraída para hooks/actions (Single Responsibility Principle).
- Faça somente o solicitado — escopo contido.

## Imutabilidade e performance

- Prefira `.map`/`.filter`/`.reduce`/spread; evite loops (`for`/`while`) e mutação direta de estado.
- Early return em vez de `if/else` aninhado.
- `Promise.all` para chamadas assíncronas independentes — nunca `await` sequencial sem necessidade.
- Substitua `switch/case` ou `if/else` longos por objetos literais ou `Map`.

## Acessibilidade (WCAG 2.2 AA) e segurança

- HTML semântico (`<header>`, `<nav>`, `<main>`, `<footer>`) em vez de `<div>` genéricas; cada `nav` com `aria-label`, sem `nav` aninhado.
- Todo texto lido por tecnologia assistiva (`aria-label`, mensagens, títulos padrão) vem de `useUIConfig().labels`, nunca fixo no componente, para ser configurável no `UIProvider`.
- Ids de associação (`label`/`aria-describedby`/`aria-labelledby`) gerados com `useId`, nunca strings fixas nem `props.id` indefinido.
- Estado exposto por atributo, não só por cor ou CSS: `aria-expanded`, `aria-invalid`, `aria-current`, `checked` nativo. Estilize via seletores de estado (`:checked`, `:disabled`, `:focus-visible`), não por prop espelhada.
- Foco sempre visível (`:focus-visible` com contraste ≥ 3:1), alvos interativos ≥ 24×24px e navegação completa por teclado.
- Diálogos e drawers usam `useModalBehavior` (focus trap, `inert` no restante da página, trava de scroll com restauração, ESC e devolução do foco). Conteúdo dinâmico usa regiões `aria-live`; erros usam `role="alert"`.
- Elementos decorativos (`svg` de ícone, spinner, skeleton) com `aria-hidden="true"`; spinner com texto alternativo oculto via `VisuallyHidden`.
- Paleta (`src/styles/tokens/`) nos dois temas: texto ≥ 4.5:1 (WCAG 1.4.3) e componentes de interface ≥ 3:1 (1.4.11). Borda de campo (`Input`, `Select`, `Checkbox`) usa `colors.borderStrong`; `colors.border` é só para divisor decorativo. Placeholder usa `colors.text.placeholder` (nunca `text.disabled`). Texto sobre um papel de cor usa o `on*` correspondente.
- Links no conteúdo são sublinhados por padrão (1.4.1); só links de navegação (logo, menus, rodapé) removem o sublinhado no próprio `.module.css`.
- Todo token de cor novo ou alterado entra na lista `contrastChecks` de `src/styles/theme/validateTheme.ts`. O teste `src/tests/styles/theme/contrast.test.ts` percorre essa lista com `contrastRatio` de `src/styles/theme/contrast.ts`, e o `validateTheme` usa a mesma lista para avisar sobre temas personalizados.
- Optional chaining (`?.`) e nullish coalescing (`??`) em vez de verificações verbosas.

## Testes

- Vitest + Testing Library + `vitest-axe` (`npm run test`). Componente novo vem com teste de comportamento por papel/nome acessível e um `axe` sem violações (use `axe` de `src/tests/axe.ts` e `renderWithProviders`).
- Testes ficam em `src/tests/`, espelhando `src` (`src/components/common/Button/index.tsx` → `src/tests/components/common/Button/index.test.tsx`). Alias `@tests/*`. Um arquivo de teste por componente; tipos próprios do teste em `types.ts` e dados em `defaultData.ts` na mesma pasta, só quando necessários.
- Infraestrutura na raiz de `src/tests/` (`setup.ts`, `axe.ts`, `renderWithProviders.tsx`, `viewport.ts`). Contratos e fixtures reutilizados por mais de um teste ficam em `src/tests/shared/` (singular): `contracts/` e `fixtures/`.
- Diálogos, modais e drawers usam `describeDialogContract(adapter)` de `@tests/shared/contracts/dialogContract.tsx` (foco, trap, Esc, `inert`, trava de scroll, axe) e mantêm no próprio arquivo só o que é específico do componente.
- `src/tests/structure.test.ts` falha se um componente com `index.tsx` não tiver teste espelho, se houver teste sem arquivo-fonte ou se uma isenção ficar obsoleta. Isenções ficam nesse arquivo, cada uma com o motivo.
- CSS Modules no Vitest viram um proxy (`css: false`): teste papéis, atributos (`data-variant`) e comportamento, não regras de CSS. O CSS do tema se testa pelas strings geradas (`themeCss`, `globalStylesCss`).
- Tudo que depende de `inert`, layout ou animação real deve ser conferido no navegador, pois o jsdom não simula esses recursos.

## Dependências

Verifique `package.json` e o que já está importado antes de instalar algo novo — priorize o que já existe ou uma solução nativa; só instale se não houver alternativa.
