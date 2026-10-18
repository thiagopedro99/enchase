# API

Referência das props e dos hooks exportados por `enchase`, gerada por `npm run docs:api` a partir dos tipos do pacote e das stories do Storybook. Não edite este arquivo à mão: mude o tipo ou o `argTypes` da story e gere de novo.

Exemplos de uso estão no [README](README.md) e no [Storybook](https://enchase.othiagosilva.com.br/docs/).

## Componentes

[Breadcrumbs](#breadcrumbs) · [Button](#button) · [ButtonLink](#buttonlink) · [Card](#card) · [Checkbox](#checkbox) · [ColorModeProvider](#colormodeprovider) · [ColorModeScript](#colormodescript) · [ConfirmModal](#confirmmodal) · [Container](#container) · [Flex](#flex) · [Footer](#footer) · [GlobalStyles](#globalstyles) · [Grid](#grid) · [Icon](#icon) · [InlineLoading](#inlineloading) · [Input](#input) · [Layout](#layout) · [Link](#link) · [Loading](#loading) · [Modal](#modal) · [Navbar](#navbar) · [Popover](#popover) · [Select](#select) · [Sidebar](#sidebar) · [Skeleton](#skeleton) · [ThemeToggle](#themetoggle) · [ThemeVariables](#themevariables) · [ToastProvider](#toastprovider) · [Tooltip](#tooltip) · [UIProvider](#uiprovider) · [VisuallyHidden](#visuallyhidden)

### Breadcrumbs

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | *obrigatória* | Trilha em ordem. O último item é a página atual; os demais viram links quando têm href. |
| `maxItems` | `number` | — | Acima desse número, o miolo vira um botão de reticências que mostra o caminho completo. |
| `ariaLabel` | `string` | — |  |

Aceita também os demais atributos HTML do elemento raiz.

### Button

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `primary` | Estilo visual do botão. |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | Tamanho do botão. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `animation` | `false \| { recipe, from, tuning }` | `press` | Receita de motion do botão, feita só com CSS. Use false para desligar a animação, ou { recipe, tuning } com press (escala ao pressionar) ou lift (sobe ao passar o mouse); outras receitas são ignoradas. A duração, a escala e a distância viram as variáveis --enchase-button-duration, --enchase-button-scale e --enchase-button-distance. Use os controles do grupo Motion para experimentar. O elemento raiz aceita className e style, e expõe data-slot="button". |

Aceita também os demais atributos de `<button>`, repassados ao elemento.

### ButtonLink

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `href` | `string` | *obrigatória* | Destino do link, com as mesmas regras do `Link`: uma rota do app vai para o `navigate` do `UIProvider`; âncoras, o hash da página atual e URLs externas ficam com o navegador. |
| `native` | `boolean` | `false` | Deixa o clique com o navegador mesmo em uma rota do app. |
| `animation` | `false \| { recipe, from, tuning }` | `press` | Receita de motion do `Button`. Use false para desligar, ou { recipe, tuning } com press ou lift. |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `primary` | Estilo visual, o mesmo do `Button`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | Tamanho, o mesmo do `Button`. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |

Aceita também os demais atributos de `<a>`, repassados ao elemento.

### Card

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `default` | Aparência do cartão. Só o elevated sobe ao passar o ponteiro. |
| `padding` | `string` | — | Espaçamento interno (qualquer valor CSS). Sem ele vale o espaçamento padrão, que a classe de quem usa sempre vence. |
| `animation` | `false \| { recipe, tuning }` | `lift` | false desliga o movimento. { tuning: { duration, distance } } ajusta o lift (segundos e pixels). O lift só roda com ponteiro fino e sem preferência de movimento reduzido. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Checkbox

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Texto do rótulo. Clicar nele também marca a caixa. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="checkbox"). className continua no input nativo (data-slot="checkbox-input"). |
| `wrapperStyle` | `CSSProperties` | — |  |
| `animation` | `MotionOverride` | — |  |

Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.

### ColorModeProvider

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* |  |
| `theme` | `ThemeInput` | — |  |
| `mode` | `'light' \| 'dark' \| 'system'` | — |  |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | — |  |
| `onModeChange` | `(mode: ColorMode) => void` | — |  |
| `storage` | `ColorModeStorage \| null` | — |  |
| `storageKey` | `string` | — |  |
| `cssLayer` | `string` | — |  |

### ColorModeScript

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `storageKey` | `string` | — |  |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | — |  |
| `nonce` | `string` | — |  |

### ConfirmModal

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | *obrigatória* |  |
| `onClose` | `() => void` | *obrigatória* |  |
| `onConfirm` | `() => void` | *obrigatória* |  |
| `title` | `string` | — |  |
| `message` | `string` | *obrigatória* |  |
| `confirmText` | `string` | — |  |
| `cancelText` | `string` | — |  |
| `confirmVariant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | — |  |
| `animation` | `MotionOverride` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

### Container

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| '2xl' \| 'full'` | `lg` | Largura máxima, tirada dos breakpoints do UIProvider (sm 576, md 768, lg 992, xl 1200, xxl 1400 px por padrão). full não limita. 2xl continua aceito como alias de xxl. |
| `padding` | `boolean \| string` | `true` | true usa o espaçamento padrão nas laterais, false remove, e um texto CSS define o valor (variável --enchase-container-padding). |
| `center` | `boolean` | `true` | Centraliza o container. Com false ele fica no início, e em RTL no lado direito. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Flex

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `direction` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | — | Eixo principal. Em RTL, row começa pelo lado direito. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | — | Alinhamento no eixo cruzado. |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | — | Distribuição no eixo principal. |
| `gap` | `string` | — | Espaço entre os filhos, passado por variável CSS. O padrão vem do token de espaçamento. |
| `wrap` | `boolean` | `false` | Permite quebrar linha. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Footer

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `companyName` | `string` | — | Nome exibido depois do ano. Sem valor padrão. |
| `notice` | `string` | — | Aviso depois do nome, como a licença. Sem valor padrão. |
| `year` | `number` | — | Ano exibido. O padrão é o ano atual. |
| `links` | `FooterLink[]` | — | Links exibidos antes do aviso, como [{ label, href }]. |

Aceita também os demais atributos HTML do elemento raiz.

### GlobalStyles

Sem props próprias.

### Grid

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `columns` | `number` | `1` | Número de colunas em telas largas. Quando não cabem, o grid reduz as colunas sozinho, sem media query. |
| `gap` | `string` | — | Espaço entre as células, por variável CSS. O padrão vem do token de espaçamento. |
| `minColumnWidth` | `string` | — | Largura mínima de cada coluna (qualquer valor CSS). Quando definida, vale no lugar de columns e o grid usa auto-fit. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Icon

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | Formas SVG (path, circle, rect, line) desenhadas em um viewBox de 24x24. |
| `size` | `number` | `24` | Lado do ícone em pixels. |
| `title` | `string` | — | Nome acessível. Sem ele o ícone é decorativo (aria-hidden="true"); com ele vira role="img" e ganha um elemento title dentro do SVG. |
| `name` | `string` | — | Identificador opcional. Vira o atributo data-icon, útil para estilizar de fora ou nos testes. |
| `directional` | `boolean` | `false` | Espelha o ícone em RTL. Use em setas e chevrons. |

Aceita também os demais atributos de `<svg>`, repassados ao elemento.

### InlineLoading

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md'` | — |  |
| `color` | `string` | — |  |
| `label` | `string` | — |  |
| `animation` | `MotionOverride` | — |  |

Aceita também os demais atributos de `<span>`, repassados ao elemento.

### Input

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Rótulo do campo, associado ao input para leitores de tela. |
| `error` | `string` | — | Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta. |
| `helperText` | `string` | — | Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `passwordToggle` | `boolean` | `true` | Mostra o botão para revelar ou ocultar a senha. Só vale quando type é password. Os textos do botão vêm do UIProvider. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="input"). className e style continuam no input nativo (data-slot="input-field"). |
| `wrapperStyle` | `CSSProperties` | — |  |

Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.

### Layout

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* |  |
| `pageTitle` | `string` | — |  |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| '2xl' \| 'full'` | — | Largura máxima do conteúdo, tirada dos breakpoints. |
| `padding` | `boolean \| string` | — |  |
| `hideNavbar` | `boolean` | — | Esconde a navegação. |
| `hideFooter` | `boolean` | — | Esconde o rodapé. |
| `centered` | `boolean` | — | Centraliza o conteúdo na vertical. |
| `navigation` | `'sidebar' \| 'navbar'` | `sidebar` | sidebar mostra a barra superior com o botão de menu e o menu lateral. navbar mostra a barra de navegação clássica no topo. |
| `breakpoint` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `md` | Breakpoint em que a sidebar deixa de ser um drawer e passa a ser permanente. Os valores vêm do UIProvider. |
| `brand` | `string` | — |  |
| `brandLogo` | `string` | — |  |
| `footerProps` | `FooterProps` | — | companyName, notice, year e links do rodapé. |
| `sidebarFooter` | `SidebarSlot` | — |  |
| `navigationSections` | `SidebarSection[]` | — |  |
| `pageSections` | `SidebarSection[]` | — | Seções de âncora acrescentadas ao menu. |
| `activePageSectionId` | `string` | — |  |
| `breadcrumbs` | `BreadcrumbItem[]` | — | Trilha explícita. Sem ela o Layout deriva a trilha do menu e da página atual. |
| `collapsed` | `boolean` | — |  |
| `defaultCollapsed` | `boolean` | — | Estado inicial da sidebar recolhida. collapsed e onCollapsedChange controlam de fora. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — |  |
| `storageKey` | `string` | — | Guarda o estado recolhido no localStorage com esse nome, lido só depois de montar. |
| `open` | `boolean` | — |  |
| `defaultOpen` | `boolean` | — |  |
| `onOpenChange` | `(open: boolean) => void` | — |  |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Link

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `href` | `string` | *obrigatória* | Destino do link. Uma rota do app (`/sobre`, `/sobre#equipe`) vai para o `navigate` do `UIProvider` quando ele existe. Âncoras (`#id`), o hash da página atual, URLs externas, `mailto:` e `tel:` ficam com o navegador, assim como Ctrl, Cmd, Shift e o botão do meio. |
| `native` | `boolean` | `false` | Deixa o clique com o navegador mesmo em uma rota do app. Use em rotas que pertencem a outro app, como a documentação publicada no mesmo domínio. |

Aceita também os demais atributos de `<a>`, repassados ao elemento.

### Loading

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `md` | Diâmetro do anel. |
| `overlay` | `boolean` | `false` | Cobre a página, deixa o resto inerte e trava a rolagem enquanto estiver montado. |
| `text` | `string` | — | Texto visível. Sem ele o leitor de tela anuncia labels.loading. |
| `color` | `string` | — | Cor do trecho que gira (qualquer cor CSS). |
| `animation` | `false \| { recipe, tuning }` | `spin` | false para de girar. { tuning: { duration } } muda a volta completa em segundos. Com movimento reduzido o giro vira um pulso de opacidade. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Modal

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | *obrigatória* |  |
| `onClose` | `() => void` | *obrigatória* |  |
| `title` | `string` | — | Título do diálogo. Sem ele, use ariaLabel. |
| `ariaLabel` | `string` | — |  |
| `role` | `'dialog' \| 'alertdialog'` | — |  |
| `children` | `ReactNode` | *obrigatória* |  |
| `footer` | `ReactNode` | — |  |
| `showCloseButton` | `boolean` | `true` | Mostra o botão de fechar no cabeçalho. |
| `closeOnOverlayClick` | `boolean` | `true` | Fecha ao clicar no fundo. |
| `closeOnEsc` | `boolean` | `true` | Fecha com Esc. Com modais empilhados, só o de cima fecha. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `md` | Largura máxima do painel. |
| `animation` | `MotionOverride` | — | false desliga o movimento; { recipe, tuning } ajusta a duração, a distância e a escala. |
| `className` | `string` | — | Classe do painel. Vence a da biblioteca sem !important. |
| `style` | `CSSProperties` | — |  |

### Navbar

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `logo` | `ReactNode` | — | Marca exibida à esquerda (ou à direita em rtl). Aceita texto ou qualquer nó React, como uma imagem ou um SVG. É um link para logoHref (data-slot="navbar-logo"). |
| `logoHref` | `string` | `/` | Destino do link da marca. Aceita uma rota, uma âncora (#inicio) ou uma URL. |
| `breakpoint` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | — |  |
| `sections` | `SidebarSection[]` | — |  |
| `activeSectionId` | `string` | — | Id do item de âncora marcado como localização atual. |
| `actions` | `ReactNode` | — | Ações ao lado do menu, como um botão de chamada. Em telas largas ficam na barra, entre o menu e o botão de tema (data-slot="navbar-cta"). Em telas estreitas vão para o drawer, abaixo dos links (data-slot="navbar-drawer-cta"), e um clique em um link dentro delas fecha o drawer. O nó é renderizado em um lugar por vez. |
| `className` | `string` | — | Classe do cabeçalho (data-slot="navbar"). As partes seguem data-slot="navbar-*"; o drawer mobile é navbar-drawer, com data-state. |
| `style` | `CSSProperties` | — |  |

### Popover

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* |  |
| `content` | `ReactNode` | *obrigatória* |  |
| `open` | `boolean` | — | Estado controlado. Sem ele, o componente guarda o próprio estado (defaultOpen e onOpenChange). |
| `defaultOpen` | `boolean` | — |  |
| `onOpenChange` | `(open: boolean) => void` | — |  |
| `placement` | `'start' \| 'end' \| 'top' \| 'right' \| 'bottom' \| 'left' \| 'top-start' \| 'top-end' \| 'right-start' \| 'right-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'start-start' \| 'start-end' \| 'end-start' \| 'end-end'` | `bottom` | Lado e alinhamento em relação ao gatilho. start e end seguem a direção do UIProvider. Perto da borda o popover inverte o lado, desliza para caber e encolhe até o espaço disponível. |
| `offset` | `number` | `8` | Distância em px entre o gatilho e o popover. |
| `padding` | `number` | `8` | Margem em px até a borda da janela. |
| `role` | `'dialog' \| 'listbox' \| 'tree' \| 'grid'` | `dialog` | Papel do conteúdo, que também vira aria-haspopup no gatilho. O padrão é dialog; menu não é suportado porque exige navegação própria por setas. |
| `label` | `string` | — | Nome acessível do conteúdo (aria-label). |
| `arrow` | `boolean` | `false` | Mostra uma seta apontando para o gatilho. |
| `closeOnEsc` | `boolean` | `true` | Esc fecha só a camada de cima e devolve o foco ao gatilho. |
| `closeOnOutsideClick` | `boolean` | `true` | Um clique fora fecha o popover sem tirar o foco de onde o clique caiu. |
| `animation` | `false \| { recipe, tuning }` | `pop` | false desliga a transição. { recipe: "fade" } troca o pop por um fade; { tuning: { duration, scale } } ajusta duração e escala. |
| `className` | `string` | — | Classe do elemento que envolve o gatilho (data-slot="popover-trigger"). |
| `style` | `CSSProperties` | — |  |
| `contentClassName` | `string` | — | Classe do conteúdo (data-slot="popover-content"). Também dá para estilizar por data-state e data-placement. |
| `contentStyle` | `CSSProperties` | — |  |

### Select

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Rótulo do campo, associado ao select para leitores de tela. |
| `error` | `string` | — | Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta. |
| `helperText` | `string` | — | Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro. |
| `options` | `SelectOption[]` | *obrigatória* | Lista de opções. Cada uma tem value, label e, se quiser, disabled. |
| `placeholder` | `string` | — | Texto da opção inicial, exibido enquanto nada foi escolhido. Para aparecer, o campo precisa começar com defaultValue vazio. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="select"). className e style continuam no select nativo (data-slot="select-field"). |
| `wrapperStyle` | `CSSProperties` | — |  |

Aceita também os demais atributos de `<select>`, repassados ao elemento. Encaminha o `ref` para `<select>`.

### Sidebar

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `sections` | `SidebarSection[]` | *obrigatória* |  |
| `activeSectionId` | `string` | — |  |
| `currentHref` | `string` | — |  |
| `header` | `SidebarSlot` | — |  |
| `footer` | `SidebarSlot` | — |  |
| `variant` | `'permanent' \| 'modal'` | `permanent` | permanent fica na página; modal vira um drawer com foco preso, página inerte e Esc para fechar, que só fecha a camada de cima. |
| `collapsed` | `boolean` | `false` | Barra de ícones (80px) em vez da barra completa. A largura muda de uma vez, sem animação. |
| `onToggleCollapsed` | `() => void` | — |  |
| `open` | `boolean` | — |  |
| `onClose` | `() => void` | — |  |
| `ariaLabel` | `string` | — |  |
| `id` | `string` | — |  |
| `animation` | `false \| { recipe, from, tuning }` | — | Só vale para o drawer. false desliga o deslize; { tuning: { distance, duration } } ajusta a distância e a duração. |
| `className` | `string` | — | Classe da raiz (data-slot="sidebar"); no drawer, do painel (data-slot="sidebar-panel"). Também dá para estilizar por data-slot, data-state e data-variant. |
| `style` | `CSSProperties` | — |  |

### Skeleton

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `text` | Forma do espaço reservado. |
| `width` | `string` | — | Largura (qualquer valor CSS). No circular, width ou height define os dois lados. |
| `height` | `string` | — | Altura (qualquer valor CSS). |
| `animation` | `false \| { recipe, tuning }` | `shimmer` | false desliga o brilho. { tuning: { duration } } muda a duração em segundos. Com movimento reduzido o brilho vira um pulso de opacidade. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### ThemeToggle

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `animation` | `MotionOverride` | — | false desliga o feedback de toque; { recipe } ajusta. O ícone troca por crossfade de CSS em até 150 ms. |

Aceita também os demais atributos de `<button>`, repassados ao elemento.

### ThemeVariables

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `css` | `string` | *obrigatória* |  |

### ToastProvider

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* |  |
| `animation` | `MotionOverride` | — |  |
| `className` | `string` | — |  |
| `style` | `CSSProperties` | — |  |

### Tooltip

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `text` | `string` | *obrigatória* | Texto da dica. Com describe ligado, ele também vira a descrição acessível do gatilho. |
| `children` | `ReactNode` | *obrigatória* |  |
| `position` | `'start' \| 'end' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `top` | Lado do gatilho onde a dica aparece. start e end seguem a direção do UIProvider (esquerda e direita em ltr, o inverso em rtl). Perto da borda da tela a dica inverte o lado e se desloca para caber. |
| `describe` | `boolean` | `true` | Liga a descrição acessível do gatilho. Desligue quando o gatilho já tem o mesmo texto como nome, como um botão só com ícone. |
| `animation` | `false \| { recipe, tuning }` | `fade` | false desliga a transição. { recipe: "pop" } acrescenta uma escala leve; { tuning: { duration } } muda a duração em segundos. |
| `openDelay` | `number` | `0` | Milissegundos entre entrar no gatilho e mostrar a dica. |
| `closeDelay` | `number` | `120` | Milissegundos entre sair do gatilho e esconder a dica. Mover o ponteiro para a própria dica mantém ela aberta. |
| `className` | `string` | — | Classe do elemento que envolve o gatilho (data-slot="tooltip-trigger"). |
| `style` | `CSSProperties` | — |  |
| `bubbleClassName` | `string` | — | Classe da dica (data-slot="tooltip-bubble"). Também dá para estilizar por data-slot, data-position e data-state. |
| `bubbleStyle` | `CSSProperties` | — |  |

### UIProvider

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* |  |
| `motion` | `Partial<MotionSettings>` | — |  |
| `locale` | `Locale` | — |  |
| `labels` | `Partial<UILabels>` | — |  |
| `breakpoints` | `Partial<Breakpoints>` | — |  |
| `navigate` | `(href: string) => void` | — |  |
| `currentHref` | `string` | — |  |

### VisuallyHidden

Sem props próprias.

Aceita também os demais atributos de `<span>`, repassados ao elemento.

## Hooks

[useBreakpoint](#usebreakpoint) · [useColorMode](#usecolormode) · [useScrollSpy](#usescrollspy) · [useToast](#usetoast) · [useUIConfig](#useuiconfig)

### useBreakpoint

```ts
useBreakpoint(server?: BreakpointKey): { current: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xs'; up: (name: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xs') => boolean; down: (name: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xs') => boolean; }
```

Faixa de tela atual, de `xs` a `xxl`, segundo os breakpoints do `UIProvider`. `up(nome)` vale quando a tela tem pelo menos `nome` e `down(nome)` quando é menor que `nome`. No servidor e na hidratação vale o argumento `server` (padrão `xs`); depois de montar, vale a largura real.

Retorno:

| Membro | Tipo |
| --- | --- |
| `current` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| 'xs'` |
| `up` | `(name: 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| 'xs') => boolean` |
| `down` | `(name: 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| 'xs') => boolean` |

### useColorMode

```ts
useColorMode(): ColorModeContextValue
```

Modo de cor escolhido (`light`, `dark` ou `system`), o modo resolvido (`light` ou `dark`) e as funções para trocá-lo. Lança um erro fora do `ColorModeProvider`.

Retorno:

| Membro | Tipo |
| --- | --- |
| `mode` | `ColorMode` |
| `resolvedMode` | `ResolvedColorMode` |
| `setMode` | `(mode: ColorMode) => void` |
| `toggleMode` | `() => void` |

### useScrollSpy

```ts
useScrollSpy(ids: string[], topOffset?: number): string | undefined
```

Devolve o `id` da seção que está na faixa de leitura, de `topOffset` px (padrão 96) do topo até 45% da altura da tela, ou `undefined` enquanto nenhuma chegou. Mantenha o array de `ids` estável.

### useToast

```ts
useToast(): ToastContextType
```

Abre notificações pelos métodos `success`, `error`, `warning` e `info`, por exemplo `success("Salvo", 3000)`. `duration` está em milissegundos e 0 mantém a notificação aberta. Lança um erro fora do `ToastProvider`.

Retorno:

| Membro | Tipo |
| --- | --- |
| `addToast` | `(message: string, type: ToastType, duration?: number, options?: ToastOptions) => void` |
| `removeToast` | `(id: string) => void` |
| `success` | `(message: string, duration?: number, options?: ToastOptions) => void` |
| `error` | `(message: string, duration?: number, options?: ToastOptions) => void` |
| `warning` | `(message: string, duration?: number, options?: ToastOptions) => void` |
| `info` | `(message: string, duration?: number, options?: ToastOptions) => void` |

### useUIConfig

```ts
useUIConfig(): UIConfig
```

Configuração do `UIProvider` mais próximo: motion, rótulos, direção do texto e breakpoints. Sem provedor, devolve os valores padrão.

Retorno:

| Membro | Tipo |
| --- | --- |
| `motion` | `MotionSettings` |
| `labels` | `UILabels` |
| `dir` | `Direction` |
| `breakpoints` | `Breakpoints` |
