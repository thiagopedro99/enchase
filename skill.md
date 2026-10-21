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
- Sem `console.log`, `console.debug` nem `console.info`: a regra `no-console` do ESLint só libera `console.warn` e `console.error`. No build, `console.log` e `console.debug` também são removidos (`treeshake.manualPureFunctions` no `vite.config.ts`), e `warn` e `error` ficam.
- Proibido `import React from 'react'` (JSX transform é padrão); importe só o que usa (`{ useState }` etc).

## Estilos (CSS Modules)

- CSS Modules é o único mecanismo de estilo: cada componente tem um `styles.module.css` ao lado do `index.tsx`, importado como `import styles from './styles.module.css'`. Sem CSS-in-JS e sem biblioteca de UI.
- Classes combinadas com `classNames` de `@utils/classNames.ts`: `className={classNames(styles.button, className)}`. O componente sempre aceita e mescla o `className` de quem usa.
- Variantes e tamanhos (valores de lista fixa) viram atributos `data-*` no elemento (`data-variant`, `data-size`; booleano por presença do atributo, como `data-full-width`), e o CSS usa seletor de atributo (`.button[data-variant='outline']`). A prop pública tem nome simples (`variant`, `size`, `fullWidth`), nunca com `$`, e não é repassada ao DOM.
- Valores livres (largura, número de colunas, tamanho calculado) passam por variável CSS inline (`style={{ '--grid-template-columns': value }}`), declarada e usada no `.module.css`. Fora isso, só valores do `motion` ficam em `style`.
- Estados por pseudo-classe e atributo ARIA (`:hover`, `:focus-visible`, `:disabled`, `[aria-invalid='true']`), não por prop espelhada.
- Valores do tema só por variáveis CSS `--enchase-*`: cores (`--enchase-color-*`, aninhadas em kebab: `text.primary` vira `--enchase-color-text-primary`), `--enchase-shadow-*`, fontes (`--enchase-font-primary`, `--enchase-font-size-*`, `--enchase-font-weight-*`), `--enchase-space-*`, `--enchase-radius-*`, `--enchase-transition-*`, `--enchase-state-*` e `--enchase-z-*`. Nunca hex, `rgba` nem espaçamento de tema soltos. Medidas próprias do componente (altura de um botão, por exemplo) podem ser literais.
- Breakpoints não têm variável (media query não aceita `var()`): use o valor literal no CSS, igual ao de `breakpoints` em `src/styles/tokens/base.ts`. Em JS, importe `breakpoints` de `@styles/tokens/index.ts`.
- O tema mora em `src/styles/`, dividido em `tokens/` (dados), `theme/` (construção e validação: `createTheme`, `validateTheme`, validadores) e `css/` (geração das variáveis e do CSS global), mais `react.tsx` (`GlobalStyles` e `ThemeVariables`). `tokens` não importa nada; `theme` e `css` só importam de `tokens`; só `react.tsx` usa React. `styles/index.ts` reexporta tudo menos o React. O ESLint trava essas dependências (`no-restricted-imports` em `eslint.config.js`), e dentro de `src/styles/` os imports são relativos, nunca pelo alias `@styles/*`. Mudar um token é mudar `tokens/`: as variáveis saem sozinhas.
- Tema do usuário entra por `<ColorModeProvider theme={...}>` no formato de `createTheme`. Todo valor de cor, família, tamanho e peso passa por validador (`isValidColor`, `isValidFontFamily`, `isValidFontSize`, `isValidFontWeight`) antes de virar CSS; nunca interpolar valor de tema sem validar.
- O modo de cor (`light`, `dark` ou `system`) vem do `ColorModeProvider`; leia e troque com `useColorMode()` e nunca guarde o tema em um store. O `data-theme` do `<html>` troca os valores das variáveis, então os componentes não conhecem o modo.
- Nome da classe reflete o elemento semântico (`.container`, `.header`), não o estilo (`.blueBox`).

## Componente pronto (checklist)

- Pasta com `index.tsx`, `styles.module.css`, `types.ts` e, se houver valor padrão, `defaultData.ts`.
- Props públicas sem `$`, aceitando e mesclando `className`.
- Variantes por `data-*` e valores do tema por `var(--enchase-*)`.
- Animação por CSS com `usePresence` e a prop `animation`; textos de acessibilidade por `useUIConfig().labels`.
- Teste de comportamento e `axe` espelhado em `src/tests/`.
- Story com Playground em `src/docs/stories/`, com as descrições das props em `argTypes`.
- Conferido no navegador nos dois temas.

## Linguagem visual (Material Design 3)

- O visual segue o Material Design 3 implementado só com CSS Modules e variáveis CSS. Nunca usar a biblioteca MUI.
- Cor sempre por papel do tema (`primary`, `primaryContainer`, `surfaceContainer*`, `on*`, `inverse*`, `error`...); proibido hex ou `rgba` solto em `.module.css`; use `var(--enchase-color-*)`. Texto sobre um papel usa o `on*` dele.
- Camadas de superfície: página em `surface`/`background`; cards, barras e diálogos em `surfaceContainerLow`, `surfaceContainer` ou `surfaceContainerHigh`. Elevação por `shadows` só em elementos que flutuam (elevated card, menus, diálogos).
- Hover, foco e pressionado por camada de estado: pseudo-elemento `::after` com `currentColor` e opacidade `var(--enchase-state-hover)` ou `var(--enchase-state-pressed)`, ou `color-mix(in srgb, <cor> calc(var(--enchase-state-hover, 0.08) * 100%), transparent)` com o token do estado (`hover`, `pressed`, `row-hover`, `disabled-container` ou `disabled-content`); não trocar a cor para escurecer, e nenhuma porcentagem de estado escrita no componente.
- Variantes de botão: `primary` (preenchido), `secondary` (tonal), `outline` e `ghost` (texto). Formas por `--enchase-radius-*`: botões, itens de menu e badges `button` (o papel que um preset de forma troca, por padrão a pílula `full`), campos `control`, cards `xl`, diálogos `2xl`. `full` fica só para o que precisa ser redondo em qualquer preset (chave, bolinha do radio, avatar); o teste `radiusRoles` lista onde ele ainda aparece.
- Tipografia: fonte `var(--enchase-font-primary)` (Figtree, importada em `demo/main.tsx`); títulos com peso `medium`.

## Layout e navegação

- Páginas sempre dentro de `Layout` (`@components/layout`). A navegação padrão é `navigation="sidebar"`; `navigation="navbar"` usa a barra superior. Nunca montar `Sidebar` ou `Navbar` direto em uma página.
- Itens de menu vêm de `SidebarSection[]`: rota com `href` (`/caminho`), âncora com `href` (`#id`) e ação com `onClick`. Seções específicas da página entram por `pageSections`, com `activePageSectionId` vindo de `useScrollSpy`.
- O `Sidebar` é um componente reutilizável com duas variantes (`permanent` e `modal`) e estado recolhido controlado por quem o usa. No `Layout`, o estado recolhido (`collapsed`, `defaultCollapsed`, `onCollapsedChange`, `storageKey` opcional) e a abertura do drawer (`open`, `defaultOpen`, `onOpenChange`) são controlados ou não; o botão que recolhe e abre o menu mora na `AppBar` do `Layout`, não no rodapé da sidebar.
- A `AppBar` do `Layout` reúne botão de menu, `Breadcrumbs` e ações (tema). O botão de menu usa `MenuToggleIcon` (ícone de menu aberto quando expandido, hambúrguer quando fechado, com troca animada) e um `Tooltip` com `describe={false}` repetindo o rótulo da ação atual. A trilha vem da prop `breadcrumbs` ou é derivada do menu e da rota (`deriveBreadcrumbs`); o último item é sempre a página atual, sem link.
- `header` e `footer` do `Sidebar` aceitam um nó ou uma função `({ collapsed }) => nó`, para o conteúdo se adaptar ao modo recolhido (marca compacta, avatar sem nome).
- A ordem do DOM do `Layout` é skip link, `AppBar`, sidebar, `main`, rodapé (posicionados por CSS grid), para o botão de menu vir antes da sidebar no foco.
- Tooltip renderiza a bolha em portal com posição fixa, por isso funciona dentro de containers com scroll; item de menu recolhido usa `Tooltip` com `describe={false}`.
- Dentro de um componente, estilo de layout com CSS explícito no `.module.css` (`display: flex`); `Flex`, `Grid` e `Container` servem para compor páginas.

## Contrato de componente (especificação para a passada por componente)

Especificação, não descrição: os componentes atuais ainda não cumprem tudo. Cada componente passa por ela uma vez, começando por `Button`, `Modal`, `Popover`, `Icon`, `Link` e `Tooltip`; um componente só conta como pronto quando cumpre todos os itens.

**Customização**
- A raiz aceita `className` e `style` e os espalha por último, com `mergeProps(own, user)` de `@utils/mergeProps.ts`: classes unidas (a de quem usa por último), `style` mesclado (quem usa vence), handlers dos dois (quem usa primeiro; o da lib não roda após `preventDefault`) e `data-slot` da lib preservado. A classe de quem usa vence a da lib sem `!important`.
- Cada parte relevante recebe `data-slot="<componente>-<parte>"` pelo helper `slot('modal', 'panel')` (`modal-panel`, `sidebar-item`). Quem estiliza de fora usa `data-slot` e `data-state`, nunca o nome da classe do CSS Module.
- Seletores internos que dependem de contexto usam `:where()` para manter a especificidade em zero e deixar a customização ganhar.
- Variantes e estados por atributo (`data-variant`, `data-size`, `data-state`), além das classes.
- Reset próprio em cada componente (botão, lista, link): nenhum componente depende de um reset global.

**Camadas de CSS**
- O CSS-fonte dos componentes não usa camada. O build gera `enchase/styles.css` (normal), `enchase/styles.layer.css` (o mesmo CSS dentro de `@layer enchase`, com a ordem `enchase-theme, enchase-base, enchase`) e `enchase/theme.css` (tema padrão claro e escuro estático). Na variante em camada, qualquer CSS do usuário sem camada vence em qualquer ordem de carregamento; na normal, o layout vence por `:where()` e as cores só vencem se o CSS do usuário vier depois. O reset global do pacote fica em `@layer enchase-base`.

**Direção (RTL)**
- Só propriedades lógicas (`margin-inline-start`, `inset-inline-end`, `padding-block`, `text-align: start`, `border-start-start-radius`). Exceções (centralização com `translate`, `transform-origin`) documentadas no CSS do componente.
- Deslocamentos de movimento usam `start` e `end`, não `left` e `right`. O sentido vem de `dir` do `UIProvider`.
- Ícones direcionais (setas, chevrons) espelham em RTL por atributo, não por cópia.

**Movimento**
- Só `transform` e `opacity`; nunca `width`, `height`, `margin`, `top`, `left` nem `transition: all`. Única exceção: o recolher da `Sidebar` permanente anima `inline-size` (e a coluna do conteúdo acompanha), porque o custo medido é de cerca de 1,5 ms de layout por quadro e um teste mantém o limite de um quadro; não crie outra exceção sem medir.
- Uma curva e durações por token, nunca valor solto no componente: `--enchase-motion-duration-fast|base|slow` (150, 250, 300 ms), `--enchase-motion-ease-out` (`cubic-bezier(0.2, 0, 0, 1)`, a única curva de entrada e saída) e `--enchase-motion-ease-in-out` (`cubic-bezier(0.4, 0, 0.2, 1)`, só para o que já está na tela e se move), mais `--enchase-motion-distance-xs|sm|md` (2, 12 e 32 px: `lift`, `pop` e `slide`). Entrada com `ease-out`; saída mais curta que a entrada.
- Presença (montar e desmontar com saída animada): `usePresence(open, { exitMs })` de `@hooks/usePresence.ts` devolve `{ mounted, state, ref }`, com `state` em `entering | open | exiting | closed`. O CSS anima por `data-state`; o hook mantém o elemento montado até o `transitionend` ou `animationend` do próprio elemento (ou `exitMs`, padrão 300 ms) e aceita reabrir no meio da saída. Não usa `window` na renderização.
- Hover só dentro de `@media (hover: hover) and (pointer: fine)` escrito por extenso (custom media não entrou: precisaria do transformador Lightning CSS em todas as configs); o toque ganha feedback por `:active`. O teste `hoverGating` tem uma lista dos componentes que ainda têm `:hover` fora da media query: nenhum entra nela, e quem for corrigido sai dela.
- `prefers-reduced-motion`: movimento espacial some e o fade continua; nada depende de movimento para ser entendido.
- Interrompível: reverter no meio do caminho parte do estado atual.
- Mola: use os tokens `--enchase-motion-spring-gentle|snappy|bouncy` (função `spring()` gera a curva `linear()`), só em entradas ocasionais (`Modal`, `toast`, `Popover`, `Tooltip`); nada que o usuário vê dezenas de vezes por dia. Tooltip: o segundo tooltip aberto em até 300 ms entra sem animação.
- Posicionamento flutuante: use `src/positioning/` (`computePosition`, `autoUpdate`); nunca recalcule posição à mão em componente novo.
- Arrastar exige alternativa por clique ou teclado e anúncio em `aria-live` (WCAG 2.5.7).

**Tokens para presets**
- Altura de controle (`--enchase-control-height-sm|md|lg`: 2, 2,5 e 3 rem), raio de controle (`--enchase-radius-control`, 0,5 rem), raio de botão (`--enchase-radius-button`), sombra (`--enchase-shadow-*`) e duração (`--enchase-motion-duration-*`) vêm de variáveis do tema, para um preset trocar a pele sem mexer na estrutura. Sem valor fixo desses cinco dentro do CSS do componente. Os presets de forma (`shape: 'pill' | 'soft' | 'square'` no `createTheme`) trocam só os raios, em `src/styles/theme/shape.ts`.
- O anel de foco (`--enchase-focus-width|offset|offset-inset|offset-selector`: 2, 2, -2 e 3 px) e a largura de borda (`--enchase-border-width` e `--enchase-border-width-strong`: 1 e 2 px) também vêm de variáveis do tema. A cor do anel é `--enchase-focus-color`, opcional: o componente lê `var(--enchase-focus-color, var(--enchase-color-primary))`, para o anel continuar seguindo o `primary` de um trecho da página. O componente lê cada token com o padrão dele como fallback (`var(--enchase-focus-width, 2px)`), para o anel e a borda sobreviverem a um tema escrito antes do token; o teste `focusAndBorder` confere que o fallback é igual ao padrão de `baseTokens` e lista as únicas larguras fixas (glifos desenhados com borda e o spinner).
- As camadas de estado (`--enchase-state-hover|pressed|row-hover|disabled-container|disabled-content`: 0,08, 0,1, 0,06, 0,12 e 0,38) e o halo dos controles de seleção (`--enchase-halo-size`, 10 px, e `--enchase-halo-size-switch`, 0,5 rem) também vêm de variáveis do tema, lidas com o padrão como fallback. O teste `stateTokens` confere o fallback, que cada seletor (`:hover`, `:active`, `:disabled`) usa o token do seu estado e que só a translucidez da `Navbar` e da `AppBar` (80%) ainda escreve uma porcentagem.
- A área de toque (`--enchase-hit-size`, 40 px, e `--enchase-hit-size-lg`, 44 px, para os botões que abrem, fecham ou recolhem uma navegação) também vem de variável do tema. O componente lê `max(24px, var(--enchase-hit-size, 40px))`: o piso de 24 px (WCAG 2.5.8) fica fixo dentro da expressão, e o fallback é o padrão do token. O teste `hitSizes` confere o piso, o fallback e lista os únicos tamanhos de 40 px que ainda são fixos (avatar do `SidebarUser` e spinner do `Loading`).
- Ganchos do componente (`--enchase-<componente>-<propriedade>[-<tamanho>]`, como `--enchase-switch-thumb-size`): o tema não os declara, o componente lê `var(--enchase-switch-thumb-size, 1.5rem)` e o fallback é o único lugar onde o padrão mora, igual em todo uso do gancho. Medida que depende de outra se deriva por `calc()` (o traço do checkbox, o ponto do radio, o curso da chave), nunca por um segundo número fixo, e um valor intermediário vai numa variável privada sem o prefixo `enchase` (`--switch-travel`, `--radio-dot-size`). Quando o padrão já é um token de escala, o gancho cai nele (`var(--enchase-button-padding-inline-md, var(--enchase-space-lg))`), para o componente continuar seguindo uma sobrescrita da escala. O teste `selectorGeometry` confere que nenhuma medida do checkbox, do radio e da chave fica escrita fora de um gancho, o `buttonGeometry` confere o mesmo para o padding, a fonte, o peso e o espaço do `Button`, e os `.spec` de mesmo nome conferem no navegador que cada gancho muda o computed.
- Variável que só aponta para outra (um alias) é resolvida no `:root`, e uma sobrescrita só num trecho da página não a alcança. Para um papel que deve seguir a cascata, o componente lê um override opcional com fallback (`var(--enchase-x, <padrão>)`) em vez de um alias emitido pelo tema.

**Acessibilidade e testes**
- Alvo mínimo de 24x24 px (WCAG 2.5.8); foco visível; nome acessível vem de `labels`, nunca de texto fixo.
- Para cada componente: teste de comportamento (jsdom), axe, hidratação sem erro e, quando mexer em foco, `inert`, layout ou movimento, teste em navegador real.
- Nenhum texto visível ou acessível fixo em um idioma: o que o componente mostra vem de `labels` ou de props.

**API pública**
- Só o que está em `lib/` é público. Tipos de props exportados junto do componente. Exportar pouco.

## Animação (motor próprio, CSS primeiro)

- Sem biblioteca de animação: o movimento é CSS (transições, `@starting-style`, `@keyframes` só para loops, `linear()` para mola) mais o hook `usePresence` para montar e desmontar com saída. Nada de importar `motion`.
- Os tokens (`--enchase-motion-duration-*`, `-ease-*`, `-distance-*`, `-spring-*`) vêm do tema (`createTheme({ motion })`, validado: duração acima de 300 ms em UI gera aviso). Nunca valor solto no CSS do componente.
- Cada componente com animação lê as próprias variáveis `--enchase-<componente>-duration|exit-duration|distance|dx|dy|scale|ease` (tabela no README); o usuário muda por tema, pela prop `animation` ou pelo CSS dele.
- Os dados das receitas (`fade`, `pop`, `slide`, `press`, `lift`, `spin`, `shimmer`) ficam em `src/motion/`; `resolveCssMotion` e `resolveLoopMotion` os transformam em variáveis e atributos (`data-motion`).
- Todo componente animado aceita `animation?: MotionOverride` (`false` desliga; `{ recipe, from, tuning }` ajusta) e respeita o `UIProvider` (`mode`, `preset`, `recipes`). `mode='never'` desliga tudo.
- Saída animada com `usePresence`; ele lê a duração real do estilo calculado, então nunca `setTimeout` para esperar a animação.
- `prefers-reduced-motion`: o deslocamento e a escala viram `none` e a opacidade continua (fade curto); loops (`data-motion='on'`) viram pulso de opacidade. O CSS de cada componente decide isso; não há regra global que zere as transições.
- Gesto e velocidade (arrastar, inércia, rubber-band) ainda não existem: ficam para a camada 2 e entram só quando um componente pedir.

## Nomenclatura e tipagem

- Inglês, camelCase, sem abreviações.
- Zero `any`. Use `import type` para tipos.

## Estrutura e limites

- Arquivos com mais de ~200 linhas devem ter lógica extraída para hooks (Single Responsibility Principle).
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
- Hidratação: `src/tests/hydration/` renderiza cada caso no servidor (Node, sem `window`, por um `globalSetup`) e hidrata no jsdom, em várias variantes de navegador (largura, tema salvo, tema do sistema; movimento reduzido num arquivo à parte, porque o `motion` guarda esse estado no módulo). As falhas conhecidas ficam em `knownFailures.ts` com `it.fails` e a causa no título. Ao corrigir uma causa, a entrada sai da lista no mesmo commit: o teste falha se um caso listado passar ou se um caso fora da lista falhar. Componente novo que lê `window`, `localStorage` ou `matchMedia` no estado inicial, ou que usa portal, entra nos casos de `cases.tsx`.
- Diálogos, modais e drawers usam `describeDialogContract(adapter)` de `@tests/shared/contracts/dialogContract.tsx` (foco, trap, Esc, `inert`, trava de scroll, axe) e mantêm no próprio arquivo só o que é específico do componente.
- `src/tests/structure.test.ts` falha se um componente com `index.tsx` não tiver teste espelho, se houver teste sem arquivo-fonte ou se uma isenção ficar obsoleta. Isenções ficam nesse arquivo, cada uma com o motivo.
- CSS Modules no Vitest viram um proxy (`css: false`): teste papéis, atributos (`data-variant`) e comportamento, não regras de CSS. O CSS do tema se testa pelas strings geradas (`themeCss`, `globalStylesCss`).
- Tudo que depende de `inert`, layout ou animação real deve ser conferido no navegador, pois o jsdom não simula esses recursos.

## Dependências

O build usa Vite 8 (Rolldown) e `@vitejs/plugin-react` 6. No `vite.config.ts`, `moduleSideEffects: false` vale só para o `src/` (regra por caminho), para descartar componentes que ninguém usa; as dependências respeitam o `sideEffects` de cada pacote. Um `package-lock.json` gerado com npm 11 precisa ser conferido com `npm ci` do npm 10 (o do `node:22` do Dockerfile) antes do commit.

Verifique `package.json` e o que já está importado antes de instalar algo novo — priorize o que já existe ou uma solução nativa; só instale se não houver alternativa.
