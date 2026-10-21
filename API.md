# API

Referência das props, dos hooks e dos ícones exportados por `enchase` e `enchase/icons`, gerada por `npm run docs:api` a partir dos tipos do pacote e das stories do Storybook. Não edite este arquivo à mão: mude o tipo ou o `argTypes` da story e gere de novo.

Exemplos de uso estão no [README](README.md) e no [Storybook](https://enchase.othiagosilva.com.br/docs/).

## Componentes

[Accordion](#accordion) · [Alert](#alert) · [Badge](#badge) · [Breadcrumbs](#breadcrumbs) · [Button](#button) · [ButtonLink](#buttonlink) · [Card](#card) · [Checkbox](#checkbox) · [ColorModeProvider](#colormodeprovider) · [ColorModeScript](#colormodescript) · [ConfirmModal](#confirmmodal) · [Container](#container) · [Flex](#flex) · [Footer](#footer) · [GlobalStyles](#globalstyles) · [Grid](#grid) · [Icon](#icon) · [InlineLoading](#inlineloading) · [Input](#input) · [Layout](#layout) · [Link](#link) · [Loading](#loading) · [Modal](#modal) · [Navbar](#navbar) · [NumberInput](#numberinput) · [Pagination](#pagination) · [Popover](#popover) · [RadioGroup](#radiogroup) · [Select](#select) · [Sidebar](#sidebar) · [Skeleton](#skeleton) · [Switch](#switch) · [Table](#table) · [Tabs](#tabs) · [Textarea](#textarea) · [ThemeToggle](#themetoggle) · [ThemeVariables](#themevariables) · [ToastProvider](#toastprovider) · [Tooltip](#tooltip) · [UIProvider](#uiprovider) · [VisuallyHidden](#visuallyhidden)

### Accordion

Lista de itens que abrem e fecham para mostrar um conteúdo por vez, ou vários com `multiple`, como em perguntas frequentes. Segue o padrão ARIA de acordeão: cada item é um botão com `aria-expanded` dentro de um título (`<h3>` por padrão), e o painel é uma região ligada ao botão. Tab percorre os botões, Enter e Espaço abrem e fecham, e as setas, Home e End movem o foco. Os painéis fechados ficam no documento, então o estado do conteúdo se mantém. Aceita `ref`, que vai para a raiz, e os atributos do `<div>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` | `AccordionItem[]` | *obrigatória* | Itens do acordeão, na ordem da tela. Cada item tem `value` (único), `title` (texto do botão), `content` (conteúdo do painel) e, se quiser, `disabled`. Os painéis fechados ficam no documento, então o estado do conteúdo se mantém. |
| `multiple` | `boolean` | `false` | Deixa vários itens abertos ao mesmo tempo. Sem ela, abrir um item fecha o que estava aberto, e o item aberto ainda pode ser fechado de novo. |
| `value` | `string[]` | — | Valores dos itens abertos quando o componente é controlado, em uma lista. Exige também onValueChange. Veja a story Controlled. |
| `defaultValue` | `string[]` | — | Valores dos itens abertos no início, em uma lista, para uso sem controle externo. Sem multiple, vale só o primeiro. |
| `onValueChange` | `(value: string[]) => void` | — | Chamada com a lista dos itens abertos depois de cada clique. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Nível do título, de h2 a h6, que envolve o botão de cada item. Escolha o nível que continua a hierarquia de títulos da página. |
| `animation` | `false \| { recipe, tuning }` | `pop` | Animação do painel, que aparece com um fade e um pequeno deslize, e da seta, que gira. A altura não anima. false desliga; { tuning: { duration, distance } } ajusta a duração em segundos e o deslize em pixels. |

Aceita também os demais atributos de `<div>`, repassados ao elemento. Encaminha o `ref` para `<div>`.

### Alert

Mensagem de status dentro da página, em quatro tipos (`info`, `success`, `warning` e `error`), com título, ícone e botão de fechar opcionais. Para avisos temporários que somem sozinhos, use as notificações (`useToast`). É um `<div>` e aceita os atributos dele.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Tipo da mensagem: define a cor, o ícone e o papel ARIA. Só error usa role="alert" e é anunciado na hora; os outros usam role="status", que leitores de tela costumam não anunciar quando o alerta já aparece com o texto. Para um aviso inserido depois do carregamento da página e que precise ser lido, passe role="alert". |
| `title` | `string` | — | Título em destaque, acima da mensagem. |
| `icon` | `ReactNode` | — | Ícone no lugar do padrão de cada tipo. Com null ou false, não mostra ícone. O ícone é decorativo (aria-hidden), então o texto precisa dizer tudo. |
| `onClose` | `() => void` | — | Mostra o botão de fechar e é chamado ao clicar nele. O Alert não some sozinho: quem usa o remove. O nome do botão vem de labels.closeToast do UIProvider. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Badge

Etiqueta pequena para um estado ou uma contagem, como "Novo", "Pago" ou "3". A cor vem de pares de papéis do tema, com o contraste conferido, e o texto sempre carrega o significado: nunca dependa só da cor. É um `<span>` e aceita os atributos dele.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'error' \| 'info'` | `'neutral'` | Cor da etiqueta, por papel do tema: neutral é cinza, primary usa a cor principal e success, warning, error e info seguem os estados. |
| `size` | `'sm' \| 'md'` | `'md'` | Tamanho da etiqueta: sm tem 20 px de altura e md, 24 px. |

Aceita também os demais atributos de `<span>`, repassados ao elemento.

### Breadcrumbs

Trilha de navegação: um `<nav>` com lista ordenada, em que o último item é a página atual. Trilhas longas escondem o miolo atrás de um botão de reticências que mostra o caminho completo.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` | `BreadcrumbItem[]` | *obrigatória* | Trilha em ordem. O último item é a página atual; os demais viram links quando têm href. |
| `maxItems` | `number` | `4` | Acima desse número, o miolo vira um botão de reticências que mostra o caminho completo. |
| `ariaLabel` | `string` | — | Nome acessível da navegação. O padrão vem do UIProvider (labels.breadcrumb). |

Aceita também os demais atributos HTML do elemento raiz.

### Button

Botão com quatro variantes e três tamanhos, e feedback de toque feito só com CSS. É um `<button>` de verdade e aceita os atributos dele.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Estilo visual do botão. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do botão. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `animation` | `false \| { recipe, from, tuning }` | `press` | Receita de motion do botão, feita só com CSS. Use false para desligar a animação, ou { recipe, tuning } com press (escala ao pressionar) ou lift (sobe ao passar o mouse); outras receitas são ignoradas. A duração, a escala e a distância viram as variáveis --enchase-button-duration, --enchase-button-scale e --enchase-button-distance. Use os controles do grupo Motion para experimentar. O elemento raiz aceita className e style, e expõe data-slot="button". |

Aceita também os demais atributos de `<button>`, repassados ao elemento.

### ButtonLink

Link com a aparência de um `Button`. É um `<a href>` de verdade, e passa pelo `navigate` do `UIProvider` nas rotas do app, como o `Link`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `href` | `string` | *obrigatória* | Destino do link, com as mesmas regras do `Link`: uma rota do app vai para o `navigate` do `UIProvider`; âncoras, o hash da página atual e URLs externas ficam com o navegador. |
| `native` | `boolean` | `false` | Deixa o clique com o navegador mesmo em uma rota do app. |
| `externalIcon` | `boolean` | `true` | Com `target="_blank"`, mostra o ícone de link externo depois do conteúdo. `false` tira só o ícone (útil em um botão só de ícone) e mantém o texto "abre em nova aba" para leitores de tela; em um link só de ícone com `aria-label`, ponha o aviso no próprio rótulo. |
| `animation` | `false \| { recipe, from, tuning }` | `press` | Receita de motion do `Button`. Use false para desligar, ou { recipe, tuning } com press ou lift. |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Estilo visual, o mesmo do `Button`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho, o mesmo do `Button`. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |

Aceita também os demais atributos de `<a>`, repassados ao elemento.

### Card

Superfície para agrupar conteúdo, nas variantes `default`, `elevated` e `outlined`. Só a `elevated` sobe ao passar o ponteiro.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'elevated' \| 'outlined'` | `'default'` | Aparência do cartão. Só o elevated sobe ao passar o ponteiro. |
| `padding` | `string` | — | Espaçamento interno (qualquer valor CSS). Sem ele vale o espaçamento padrão, que a classe de quem usa sempre vence. |
| `animation` | `false \| { recipe, tuning }` | `lift` | false desliga o movimento. { tuning: { duration, distance } } ajusta o lift (segundos e pixels). O lift só roda com ponteiro fino e sem preferência de movimento reduzido. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Checkbox

Caixa de seleção nativa estilizada, com rótulo clicável e traço animado. Aceita `ref` e os atributos do `<input>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Texto do rótulo. Clicar nele também marca a caixa. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="checkbox"). className continua no input nativo (data-slot="checkbox-input"). |
| `wrapperStyle` | `CSSProperties` | — | Estilo da raiz (data-slot="checkbox"). style continua no input nativo. |
| `animation` | `false \| { recipe, tuning }` | `pop` | Animação do traço de marcado, que cresce com um pop curto. false desliga; { tuning: { duration, scale } } ajusta a duração em segundos e a escala inicial. |

Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.

### ColorModeProvider

Aplica o tema: injeta as variáveis `--enchase-*`, define `data-theme` e `color-scheme` no `<html>` e guarda o modo (`light`, `dark` ou `system`). Os componentes leem as variáveis, e `useColorMode` devolve `{ mode, resolvedMode, setMode, toggleMode }`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | A aplicação. |
| `theme` | `ThemeInput` | — | Tema personalizado, como { brand, fonts, motion, shape, radius, light, dark }, o mesmo que createTheme aceita: a cor da marca gera a paleta, shape escolhe a forma dos cantos (pill, soft ou square) e radius ajusta um raio, e light e dark ajustam cores por modo. Todo valor é validado, e em desenvolvimento o provedor avisa no console sobre contraste e duração. Sem ele vale o tema padrão. |
| `mode` | `'light' \| 'dark' \| 'system'` | — | Modo controlado: light, dark ou system. Com ele o provedor não guarda a escolha, e quem usa muda o valor em onModeChange. |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | `'system'` | Modo usado enquanto não há escolha guardada nem a prop mode. system segue a preferência do sistema. |
| `onModeChange` | `(mode: ColorMode) => void` | — | Chamado com o novo modo quando setMode ou toggleMode são usados, inclusive com mode controlado. |
| `storage` | `{ getItem, setItem } \| null` | `localStorage` | Onde guardar a escolha, com getItem e setItem. O padrão é o localStorage, lido só depois de montar. null desliga a persistência. |
| `storageKey` | `string` | `'enchase-color-mode'` | Chave da escolha no storage. Use a mesma no ColorModeScript. |
| `cssLayer` | `string` | — | Nome de uma @layer para as variáveis do tema. Use com enchase/styles.layer.css, como cssLayer="enchase-theme". |

### ColorModeScript

Script inline que aplica `data-theme` e `color-scheme` no `<html>` antes da primeira pintura, para a página renderizada no servidor não mostrar o tema errado por um instante. Renderize-o no começo do `<body>` ou no `<head>`, com `suppressHydrationWarning` no `<html>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `storageKey` | `string` | `'enchase-color-mode'` | Chave lida no `localStorage`. Use a mesma do `ColorModeProvider`. |
| `defaultMode` | `'light' \| 'dark' \| 'system'` | `'system'` | Modo usado quando não há escolha guardada. `system` segue a preferência do sistema. |
| `nonce` | `string` | — | `nonce` da Content-Security-Policy, para o script inline ser aceito. |

### ConfirmModal

Modal de confirmação pronto: um alertdialog com a pergunta e os botões de cancelar e confirmar. Use o Modal quando precisar de conteúdo próprio.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | *obrigatória* | Abre e fecha a confirmação. Como o Modal, ela é sempre controlada: quem usa guarda o estado e o muda em onClose. |
| `onClose` | `() => void` | *obrigatória* | Chamado ao cancelar, ao fechar por Esc, pelo botão de fechar ou pelo fundo, e logo depois de onConfirm. |
| `onConfirm` | `() => void` | *obrigatória* | Chamado ao clicar no botão de confirmar. O modal chama onClose em seguida, então não é preciso fechar aqui. |
| `title` | `string` | — | Título da confirmação. Sem ele, usa o texto labels.confirmAction do UIProvider. |
| `message` | `string` | *obrigatória* | Texto da pergunta, no corpo do modal. O diálogo é um alertdialog e o corpo vira a descrição acessível. |
| `confirmText` | `string` | — | Texto do botão de confirmar. Sem ele, usa labels.confirm do UIProvider. |
| `cancelText` | `string` | — | Texto do botão de cancelar, que recebe o foco inicial. Sem ele, usa labels.cancel do UIProvider. |
| `confirmVariant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Estilo do botão de confirmar, o mesmo do Button. |
| `animation` | `MotionOverride` | — | false desliga o movimento; { recipe, tuning } ajusta a duração, a distância e a escala, como no Modal. |
| `className` | `string` | — | Classe do painel. Vence a da biblioteca sem !important. |
| `style` | `CSSProperties` | — | Estilo do painel, mesclado com o da biblioteca (o seu vence). |

### Container

Limita a largura do conteúdo pelos breakpoints do `UIProvider`, com espaçamento lateral e centralização opcionais.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| '2xl' \| 'full'` | `'lg'` | Largura máxima, tirada dos breakpoints do UIProvider (sm 576, md 768, lg 992, xl 1200, xxl 1400 px por padrão). full não limita. 2xl continua aceito como alias de xxl. |
| `padding` | `boolean \| string` | `true` | true usa o espaçamento padrão nas laterais, false remove, e um texto CSS define o valor (variável --enchase-container-padding). |
| `center` | `boolean` | `true` | Centraliza o container. Com false ele fica no início, e em RTL no lado direito. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Flex

Contêiner flexbox configurado por props: direção, alinhamento, distribuição, espaço entre os filhos e quebra de linha. Em RTL, `row` começa pelo lado direito.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `direction` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | `'row'` | Eixo principal. Em RTL, row começa pelo lado direito. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | `'stretch'` | Alinhamento no eixo cruzado. |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `'start'` | Distribuição no eixo principal. |
| `gap` | `string` | — | Espaço entre os filhos, passado por variável CSS. O padrão vem do token de espaçamento. |
| `wrap` | `boolean` | `false` | Permite quebrar linha. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Footer

Rodapé com o ano, o nome da empresa, um aviso e links. O ano padrão é o atual.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `companyName` | `string` | — | Nome exibido depois do ano. Sem valor padrão. |
| `notice` | `string` | — | Aviso depois do nome, como a licença. Sem valor padrão. |
| `year` | `number` | — | Ano exibido. O padrão é o ano atual. |
| `links` | `FooterLink[]` | `[]` | Links exibidos antes do aviso, como [{ label, href }]. |

Aceita também os demais atributos HTML do elemento raiz.

### GlobalStyles

Reset e base tipográfica da biblioteca em um `<style>`: `box-sizing`, margens zeradas, fonte, cor e fundo do `body` a partir do tema, tamanho dos títulos e imagens responsivas. O CSS fica na camada `enchase-base`. Renderize uma vez, na raiz do app.

Sem props próprias.

### Grid

Grade CSS que reduz as colunas sozinha quando elas não cabem, sem media query. Com `columns` em objeto, o número de colunas muda nos breakpoints do `UIProvider`, em CSS puro e sem quadro errado antes da hidratação. Com `centerLastRow`, a última linha incompleta fica centralizada.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `columns` | `number \| { xs?: number, sm?: number, md?: number, lg?: number, xl?: number, xxl?: number }` | `1` | Um número, que é o máximo de colunas em telas largas: quando elas não cabem, o grid reduz sozinho, sem media query. Ou um objeto com o número de colunas a partir de cada breakpoint (`{ xs: 1, md: 2, lg: 4 }`): é mobile first, um breakpoint sem valor repete o menor que veio antes, e os valores dos breakpoints são os do `UIProvider`. Números vão para inteiros de pelo menos 1. |
| `gap` | `string` | — | Espaço entre as células, por variável CSS. O padrão vem do token de espaçamento. |
| `minColumnWidth` | `string` | — | Largura mínima de cada coluna (qualquer valor CSS). Quando definida, vale no lugar de columns e o grid usa auto-fit. |
| `centerLastRow` | `boolean` | `false` | Centraliza a última linha quando ela fica incompleta, como os dois últimos cards de cinco em três colunas. O grid passa a ser uma linha flexível que quebra: cada célula tem a largura de uma coluna e as linhas cheias continuam alinhadas nas colunas. Vale com `columns` (número ou objeto) e é ignorado com `minColumnWidth`, porque o número de colunas então depende da largura. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Icon

Contêiner SVG de 24x24, com traço de 2 px e a cor do texto (`currentColor`). Use-o para desenhar os seus ícones a partir de caminhos SVG.

Os ícones que os componentes usam por dentro (menu, fechar, setas, mais, menos, olho, sol e lua, entre outros) saem prontos de `enchase/icons`, um componente por ícone, na story Gallery. Não é uma biblioteca de ícones: só tem o que algum componente usa. Para os demais, use uma biblioteca de ícones direto, sem o `Icon`. Qualquer nó React serve onde há conteúdo ou uma prop `icon`:

```tsx
import { Rocket } from 'lucide-react'
import { Button } from 'enchase'
import { CheckIcon } from 'enchase/icons'

<Button variant="primary">
  <CheckIcon size={18} />
  Confirmar
</Button>

<Button variant="outline">
  <Rocket size={18} aria-hidden="true" />
  Começar
</Button>
```

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | Formas SVG (path, circle, rect, line) desenhadas em um viewBox de 24x24. |
| `size` | `number` | `24` | Lado do ícone em pixels. |
| `title` | `string` | — | Nome acessível. Sem ele o ícone é decorativo (aria-hidden="true"); com ele vira role="img" e ganha um elemento title dentro do SVG. |
| `name` | `string` | — | Identificador opcional. Vira o atributo data-icon, útil para estilizar de fora ou nos testes. |
| `directional` | `boolean` | `false` | Espelha o ícone em RTL. Use em setas e chevrons. |

Aceita também os demais atributos de `<svg>`, repassados ao elemento.

### InlineLoading

Indicador de carregamento em linha: um span com role="status" e o anel. Para cobrir um bloco ou a página inteira, use o Loading.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md'` | `'sm'` | Diâmetro do anel, para usar ao lado de um texto ou dentro de um botão. |
| `color` | `string` | — | Cor do trecho que gira (qualquer cor CSS). |
| `label` | `string` | — | Texto só para leitores de tela. Sem ele, anuncia labels.loading do UIProvider. |
| `animation` | `false \| { recipe, tuning }` | `spin` | false para de girar. { tuning: { duration } } muda a volta completa em segundos. Com movimento reduzido o giro vira um pulso de opacidade. |

Aceita também os demais atributos de `<span>`, repassados ao elemento.

### Input

Campo de texto com rótulo, mensagem de erro, texto de ajuda e botão para revelar a senha. Aceita `ref` e os atributos do `<input>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Rótulo do campo, associado ao input para leitores de tela. |
| `error` | `string` | — | Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta. |
| `helperText` | `string` | — | Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `passwordToggle` | `boolean` | `true` | Mostra o botão para revelar ou ocultar a senha. Só vale quando type é password. Os textos do botão vêm do UIProvider. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="input"). className e style continuam no input nativo (data-slot="input-field"). |
| `wrapperStyle` | `CSSProperties` | — | Estilo da raiz (data-slot="input"). style continua no input nativo. |

Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.

### Layout

Casca de página: barra superior com a trilha de navegação e o menu lateral (permanente ou drawer), ou uma `Navbar`; o conteúdo em `<main>` e o rodapé. Não traz navegação, marca nem rodapé próprios, e não altera `document.title`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | Conteúdo da página. Fica em `<main id="main-content">`, dentro de um `Container`, e é o destino do link para pular ao conteúdo. |
| `pageTitle` | `string` | — | Título da página. Entra na trilha de navegação quando nenhum item do menu corresponde à página atual. O Layout não altera document.title. |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl' \| '2xl' \| 'full'` | `'lg'` | Largura máxima do conteúdo, tirada dos breakpoints. |
| `padding` | `boolean \| string` | `true` | Espaçamento lateral do conteúdo, como no Container: true usa o padrão, false remove, e um texto CSS define o valor. |
| `hideNavbar` | `boolean` | `false` | Esconde a navegação (a barra superior, a sidebar e a navbar). |
| `hideFooter` | `boolean` | `false` | Esconde o rodapé. |
| `centered` | `boolean` | `false` | Centraliza o conteúdo na vertical. |
| `navigation` | `'sidebar' \| 'navbar'` | `'sidebar'` | sidebar mostra a barra superior com o botão de menu e o menu lateral. navbar mostra a barra de navegação clássica no topo. |
| `breakpoint` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | Breakpoint em que a sidebar deixa de ser um drawer e passa a ser permanente. Os valores vêm do UIProvider. |
| `translucent` | `boolean` | `false` | Deixa a barra do topo semitransparente, com desfoque do conteúdo que rola por baixo: a `AppBar` com a navegação sidebar, ou a `Navbar` com a navegação navbar. O fundo e o desfoque vêm de `--enchase-app-bar-background` e `--enchase-app-bar-blur` na AppBar (padrão: 80% da cor `surface` do tema e `12px`) e de `--enchase-navbar-background` e `--enchase-navbar-blur` na Navbar (80% da `surfaceContainer`). Com `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, cores forçadas ou sem `backdrop-filter`, o fundo é opaco. |
| `brand` | `string` | — | Nome da marca. No topo da sidebar é um link para a raiz, com a inicial do nome no lugar da imagem; com navigation="navbar" vira o logo da Navbar. |
| `brandLogo` | `string` | — | URL de uma imagem para a marca da sidebar, no lugar da inicial do nome. A imagem é decorativa, e o nome continua como texto. |
| `footerProps` | `FooterProps` | — | companyName, notice, year e links do rodapé. |
| `sidebarFooter` | `SidebarSlot` | — | Conteúdo fixo no rodapé da sidebar, acima do botão de recolher. Pode ser uma função que recebe { collapsed }. |
| `navigationSections` | `SidebarSection[]` | `[]` | Seções do menu principal, como em Sidebar: [{ id, title?, items: [{ id, label, href?, native?, icon?, badge?, onClick? }] }]. |
| `pageSections` | `SidebarSection[]` | `[]` | Seções de âncora acrescentadas ao menu. |
| `activePageSectionId` | `string` | — | Id do item de âncora que está na tela (use useScrollSpy): fica marcado no menu (aria-current="location") e vira o último item da trilha. |
| `breadcrumbs` | `BreadcrumbItem[]` | — | Trilha explícita. Sem ela o Layout deriva a trilha do menu e da página atual. |
| `collapsed` | `boolean` | — | Sidebar recolhida, controlada de fora junto com onCollapsedChange. Sem ela o estado é interno (defaultCollapsed) e pode ser guardado com storageKey. |
| `defaultCollapsed` | `boolean` | `false` | Estado inicial da sidebar recolhida. collapsed e onCollapsedChange controlam de fora. |
| `onCollapsedChange` | `(collapsed: boolean) => void` | — | Chamado com o novo valor quando a sidebar é recolhida ou expandida. |
| `storageKey` | `string` | — | Guarda o estado recolhido no localStorage com esse nome, lido só depois de montar. Ignorado quando collapsed é controlado. |
| `open` | `boolean` | — | Drawer do menu em telas estreitas (abaixo do breakpoint), controlado de fora junto com onOpenChange. Sem ele o estado é interno (defaultOpen). |
| `defaultOpen` | `boolean` | `false` | Estado inicial do drawer quando ele não é controlado. |
| `onOpenChange` | `(open: boolean) => void` | — | Chamado com o novo valor quando o drawer abre ou fecha. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Link

Link de texto que passa pelo `navigate` do `UIProvider` quando o destino é uma rota do app, sem depender de um roteador. Sem `navigate`, é um `<a href>` comum. A story "Quem trata cada href" mostra cada caso.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `href` | `string` | *obrigatória* | Destino do link. Uma rota do app (`/sobre`, `/sobre#equipe`) vai para o `navigate` do `UIProvider` quando ele existe. Âncoras (`#id`), o hash da página atual, URLs externas, `mailto:` e `tel:` ficam com o navegador, assim como Ctrl, Cmd, Shift e o botão do meio. |
| `native` | `boolean` | `false` | Deixa o clique com o navegador mesmo em uma rota do app. Use em rotas que pertencem a outro app, como a documentação publicada no mesmo domínio. |

Aceita também os demais atributos de `<a>`, repassados ao elemento.

### Loading

Indicador de carregamento em anel, com texto opcional. Com `overlay`, cobre a página, deixa o resto inerte e trava a rolagem.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Diâmetro do anel. |
| `overlay` | `boolean` | `false` | Cobre a página, deixa o resto inerte e trava a rolagem enquanto estiver montado. |
| `text` | `string` | — | Texto visível. Sem ele o leitor de tela anuncia labels.loading. |
| `color` | `string` | — | Cor do trecho que gira (qualquer cor CSS). |
| `animation` | `false \| { recipe, tuning }` | `spin` | false para de girar. { tuning: { duration } } muda a volta completa em segundos. Com movimento reduzido o giro vira um pulso de opacidade. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Modal

Diálogo modal renderizado em um portal: o foco fica preso no painel, a página atrás fica inerte, e Esc ou o clique no fundo fecham. Entra e sai com animação. É sempre controlado por `isOpen` e `onClose`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | *obrigatória* | Abre e fecha o modal. Ele é sempre controlado: quem usa guarda o estado e o muda em onClose. Renderiza em um portal no body, só depois de montar, e continua montado até a animação de saída terminar. |
| `onClose` | `() => void` | *obrigatória* | Chamado quando o usuário pede para fechar: botão de fechar, clique no fundo ou Esc, conforme showCloseButton, closeOnOverlayClick e closeOnEsc. O modal não se fecha sozinho. |
| `title` | `string` | — | Título do diálogo (h2), que dá o nome acessível. Sem ele, use ariaLabel. |
| `ariaLabel` | `string` | — | Nome acessível do diálogo quando não há title. |
| `role` | `'dialog' \| 'alertdialog'` | `'dialog'` | dialog é o padrão. alertdialog é para confirmações que exigem uma resposta: o corpo passa a ser a descrição acessível (aria-describedby). |
| `children` | `ReactNode` | *obrigatória* | Conteúdo do corpo do modal. |
| `footer` | `ReactNode` | — | Conteúdo fixo abaixo do corpo, como os botões de ação. |
| `showCloseButton` | `boolean` | `true` | Mostra o botão de fechar no cabeçalho. |
| `closeOnOverlayClick` | `boolean` | `true` | Fecha ao clicar no fundo. |
| `closeOnEsc` | `boolean` | `true` | Fecha com Esc. Com modais empilhados, só o de cima fecha. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Largura máxima do painel. |
| `animation` | `MotionOverride` | — | false desliga o movimento; { recipe, tuning } ajusta a duração, a distância e a escala. |
| `className` | `string` | — | Classe do painel. Vence a da biblioteca sem !important. |
| `style` | `CSSProperties` | — | Estilo do painel, mesclado com o da biblioteca (o seu vence). |

### Navbar

Barra de navegação no topo, com a marca, os links, ações e o botão de tema. Abaixo do breakpoint, os links vão para um drawer. Com `translucent`, o fundo fica semitransparente e desfoca o que rola por baixo, e volta ao fundo opaco quando o sistema pede menos transparência ou mais contraste, em cores forçadas e em navegadores sem `backdrop-filter`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `logo` | `ReactNode` | `'Logo'` | Marca exibida à esquerda (ou à direita em rtl). Aceita texto ou qualquer nó React, como uma imagem ou um SVG. É um link para logoHref (data-slot="navbar-logo"). |
| `logoHref` | `string` | `'/'` | Destino do link da marca. Aceita uma rota, uma âncora (#inicio) ou uma URL. |
| `breakpoint` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | `'md'` | Breakpoint a partir do qual os links aparecem na barra. Abaixo dele, a barra mostra o botão de menu e os links vão para o drawer. Os valores vêm do UIProvider. |
| `sections` | `SidebarSection[]` | — | Itens do menu, no mesmo formato da Sidebar: [{ id, items: [{ id, label, href }] }]. Só os itens com href aparecem, e os títulos das seções não são exibidos. |
| `activeSectionId` | `string` | — | Id do item de âncora (href #id, ou /pagina#id na página atual) marcado como localização atual (aria-current="location"). Use useScrollSpy para obtê-lo. |
| `actions` | `ReactNode` | — | Ações ao lado do menu, como um botão de chamada. Em telas largas ficam na barra, entre o menu e o botão de tema (data-slot="navbar-cta"). Em telas estreitas vão para o drawer, abaixo dos links (data-slot="navbar-drawer-cta"), e um clique em um link dentro delas fecha o drawer. O nó é renderizado em um lugar por vez. |
| `translucent` | `boolean` | `false` | Deixa o fundo da barra semitransparente, com desfoque do que passa por trás. O fundo vem de `--enchase-navbar-background` (padrão: 80% da cor `surfaceContainer` do tema) e o desfoque de `--enchase-navbar-blur` (padrão `12px`), que você muda no `style` ou no CSS. Com `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, cores forçadas ou sem `backdrop-filter`, o fundo é opaco. Com o tema padrão, o texto da marca e do menu mantém 4,5:1 mesmo sobre preto ou branco puro (3:1 na cor de destaque da marca ao passar o mouse); confira o contraste se mudar a cor ou o tema. |
| `className` | `string` | — | Classe do cabeçalho (`data-slot="navbar"`). As partes seguem `data-slot="navbar-*"`; o drawer mobile é `navbar-drawer`, com `data-state`. |
| `style` | `CSSProperties` | — | Estilo do cabeçalho. |

### NumberInput

Campo para digitar um número, com rótulo, mensagem de erro, texto de ajuda e botões para diminuir e aumentar. É um `<input type="text">` com `role="spinbutton"` e teclado numérico no celular, em vez de `type="number"`: o texto segue o idioma do `UIProvider` (vírgula decimal e ponto de milhar em pt-BR), aceita moeda e porcentagem por `formatOptions`, e o valor sai como `number`, ou `null` com o campo vazio. As setas mudam o valor por `step`; Shift com as setas e Page Up e Page Down, por `largeStep`; Home e End vão ao `min` e ao `max`. O valor é confirmado ao sair do campo ou com Enter, limitado ao intervalo e arredondado às casas do formato. Com `name`, o número vai para o formulário num campo oculto, sem a formatação da tela. Os botões ficam fora da ordem do Tab, porque o teclado já tem as setas, e seus nomes vêm de `labels.increaseValue` e `labels.decreaseValue` do `UIProvider`. Aceita `ref`, que vai para o `<input>`, e os atributos dele.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `value` | `number \| null` | — | Valor quando o componente é controlado; `null` é o campo vazio. Exige também onValueChange. Veja a story Controlled. |
| `defaultValue` | `number \| null` | `null` | Valor inicial, para uso sem controle externo. `null` começa com o campo vazio. |
| `onValueChange` | `(value: number \| null) => void` | — | Chamada com o número confirmado, ou `null` se o campo ficou vazio. Acontece ao sair do campo, com Enter, com as setas e com os botões, nunca a cada tecla digitada. |
| `min` | `number` | — | Menor valor aceito. O que for digitado abaixo dele volta ao mínimo ao sair do campo, o botão de diminuir se desativa nele e Home vai até ele. Com `min` de zero ou mais, o sinal de menos não é aceito. No iPhone o teclado numérico não tem o sinal de menos: para aceitar negativos, passe `inputMode="text"`. |
| `max` | `number` | — | Maior valor aceito. O que for digitado acima dele volta ao máximo ao sair do campo, o botão de aumentar se desativa nele e End vai até ele. |
| `step` | `number` | `1` | Quanto o valor muda com as setas e com os botões. Os passos contam a partir de `min` (ou de 0), e as casas decimais do passo entram no formato. Um valor que não seja positivo vale 1. |
| `largeStep` | `number` | — | Passo grande, de Shift com as setas e de Page Up e Page Down. Sem ele, vale dez vezes o `step`. |
| `formatOptions` | `NumberInputFormat` | — | Formato do número, como no `Intl.NumberFormat`: `style` (`decimal`, `currency` ou `percent`), `currency` (código como `BRL`), `currencyDisplay`, `minimumFractionDigits`, `maximumFractionDigits` e `useGrouping`. O idioma vem do `UIProvider`. Sem `maximumFractionDigits`, valem as casas do estilo (3 no decimal, 2 na moeda, 0 no percentual) ou as que o `step` pedir. No percentual o valor é a fração: 0,15 aparece como 15%, e o `step` costuma ser 0,01. |
| `label` | `string` | — | Rótulo do campo, associado ao input para leitores de tela. |
| `error` | `string` | — | Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta. |
| `helperText` | `string` | — | Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `steppers` | `boolean` | `true` | Mostra os botões de diminuir e aumentar, e o aviso por voz do novo valor quando um deles é usado. Sem eles, o teclado continua com as setas. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="number-input"). className e style continuam no input (data-slot="number-input-field"). |
| `wrapperStyle` | `CSSProperties` | — | Estilo da raiz (data-slot="number-input"). style continua no input. |

Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.

### Pagination

Navegação entre as páginas de uma lista ou tabela: botões numerados, anterior e próxima, com reticências quando a lista é longa. É uma `<nav>` com uma lista de botões, e a página atual leva `aria-current="page"`. Anterior e próxima ficam indisponíveis (`aria-disabled`) nas pontas, sem tirar o foco de quem acabou de clicar. Os textos para leitores de tela vêm de `labels.pagination`, `labels.previousPage` e `labels.nextPage` do `UIProvider`. Aceita `ref`, que vai para a `<nav>`, e os atributos dela.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `pageCount` | `number` | *obrigatória* | Total de páginas. Com menos de 1, o componente não mostra nada. |
| `page` | `number` | — | Página atual quando o componente é controlado; a primeira é 1. Exige também onPageChange. Fora do intervalo, vale a primeira ou a última. Veja a story Controlled. |
| `defaultPage` | `number` | `1` | Página inicial, para uso sem controle externo. |
| `onPageChange` | `(page: number) => void` | — | Chamada com o número da página que o usuário escolheu, pelos números ou por anterior e próxima. |
| `siblingCount` | `number` | `1` | Quantas páginas aparecem de cada lado da atual antes das reticências. |
| `boundaryCount` | `number` | `1` | Quantas páginas ficam sempre visíveis no começo e no fim da lista. |
| `size` | `'sm' \| 'md'` | `'md'` | Tamanho dos botões: sm tem 2 rem de lado e md, 2,5 rem. |
| `ariaLabel` | `string` | — | Nome da navegação para leitores de tela. Sem ele, vale labels.pagination do UIProvider. |
| `animation` | `false \| { recipe, tuning }` | `fade` | Animação do realce dos botões ao passar o mouse e ao pressionar. false desliga; { tuning: { duration } } ajusta a duração em segundos. |

Aceita também os demais atributos HTML do elemento raiz. Encaminha o `ref` para o elemento raiz.

### Popover

Painel flutuante ligado a um gatilho. A posição se ajusta sozinha perto da borda (inverte o lado, desliza e encolhe), o foco é gerenciado, e Esc ou um clique fora fecham.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | O gatilho: um clique nele abre e fecha o popover. Fica dentro de um span (data-slot="popover-trigger") e, sendo um elemento React, recebe aria-expanded, aria-controls e aria-haspopup. |
| `content` | `ReactNode` | *obrigatória* | Conteúdo do popover. Renderiza em um portal no body, só enquanto o popover está aberto e durante a saída. |
| `open` | `boolean` | — | Estado controlado. Sem ele, o componente guarda o próprio estado (defaultOpen e onOpenChange). |
| `defaultOpen` | `boolean` | `false` | Estado inicial quando o popover não é controlado. |
| `onOpenChange` | `(open: boolean) => void` | — | Chamado com o novo estado quando o usuário abre ou fecha: clique no gatilho, Esc ou clique fora. Combine com open para controlar de fora. |
| `placement` | `'start' \| 'end' \| 'top' \| 'right' \| 'bottom' \| 'left' \| 'top-start' \| 'top-end' \| 'right-start' \| 'right-end' \| 'bottom-start' \| 'bottom-end' \| 'left-start' \| 'left-end' \| 'start-start' \| 'start-end' \| 'end-start' \| 'end-end'` | `'bottom'` | Lado e alinhamento em relação ao gatilho. start e end seguem a direção do UIProvider. Perto da borda o popover inverte o lado, desliza para caber e encolhe até o espaço disponível. |
| `offset` | `number` | `8` | Distância em px entre o gatilho e o popover. |
| `padding` | `number` | `8` | Margem em px até a borda da janela. |
| `role` | `'dialog' \| 'listbox' \| 'tree' \| 'grid'` | `'dialog'` | Papel do conteúdo, que também vira aria-haspopup no gatilho. O padrão é dialog; menu não é suportado porque exige navegação própria por setas. |
| `label` | `string` | — | Nome acessível do conteúdo (aria-label). |
| `arrow` | `boolean` | `false` | Mostra uma seta apontando para o gatilho. |
| `closeOnEsc` | `boolean` | `true` | Esc fecha só a camada de cima e devolve o foco ao gatilho. |
| `closeOnOutsideClick` | `boolean` | `true` | Um clique fora fecha o popover sem tirar o foco de onde o clique caiu. |
| `animation` | `false \| { recipe, tuning }` | `pop` | false desliga a transição. { recipe: "fade" } troca o pop por um fade; { tuning: { duration, scale } } ajusta duração e escala. |
| `className` | `string` | — | Classe do elemento que envolve o gatilho (data-slot="popover-trigger"). |
| `style` | `CSSProperties` | — | Estilo do elemento que envolve o gatilho. |
| `contentClassName` | `string` | — | Classe do conteúdo (data-slot="popover-content"). Também dá para estilizar por data-state e data-placement. |
| `contentStyle` | `CSSProperties` | — | Estilo do conteúdo. |

### RadioGroup

Grupo de botões de opção para escolher uma entre poucas alternativas que cabem na tela de uma vez; para muitas, use o `Select`. Monta um `<fieldset>` com `role="radiogroup"`, título, texto de ajuda e mensagem de erro, como os outros campos. Cada opção é um `<input type="radio">` nativo de mesmo `name`, então o teclado já funciona: Tab entra no grupo e as setas movem e marcam a opção. Aceita `ref`, que vai para o `<fieldset>`, e os atributos dele; `className` e `style` também vão para ele.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `options` | `RadioGroupOption[]` | *obrigatória* | Opções do grupo, cada uma com `value`, `label` e, se quiser, `disabled`. A ordem do array é a ordem na tela. |
| `label` | `string` | — | Título do grupo, desenhado como a `<legend>` do `<fieldset>`. Sem título visível, passe aria-label ao grupo. |
| `name` | `string` | — | Nome do campo no formulário, igual para todas as opções. Sem ele, o grupo usa um nome gerado, que mantém as opções ligadas entre si e separa um grupo do outro. |
| `value` | `string` | — | Valor da opção marcada quando o grupo é controlado. Exige também onValueChange. Para controlar sem nenhuma marcada, passe uma string vazia. Veja a story Controlled. |
| `defaultValue` | `string` | — | Valor da opção marcada no início, para uso sem controle externo. Veja a story WithDefaultValue. |
| `onValueChange` | `(value: string) => void` | — | Chamada com o valor da opção que o usuário acabou de marcar, por clique ou pelas setas do teclado. |
| `required` | `boolean` | `false` | Exige uma opção marcada ao enviar o formulário e avisa leitores de tela com aria-required. |
| `error` | `string` | — | Mensagem de erro. Marca o grupo como inválido (aria-invalid), pinta o título e as opções de vermelho e é anunciada como alerta. Substitui o helperText. |
| `helperText` | `string` | — | Texto de ajuda sob o grupo. Fica ligado a ele por aria-describedby e some quando há erro. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Direção da lista: vertical empilha as opções e horizontal as põe lado a lado, quebrando a linha quando falta espaço. |
| `animation` | `false \| { recipe, tuning }` | `pop` | Animação do ponto de marcado, que cresce com um pop curto. false desliga; { tuning: { duration, scale } } ajusta a duração em segundos e a escala inicial. |

Aceita também os demais atributos de `<fieldset>`, repassados ao elemento. Encaminha o `ref` para `<fieldset>`.

### Select

Seleção nativa estilizada, com rótulo, mensagem de erro, texto de ajuda e `placeholder`. Aceita `ref` e os atributos do `<select>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Rótulo do campo, associado ao select para leitores de tela. |
| `error` | `string` | — | Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta. |
| `helperText` | `string` | — | Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro. |
| `options` | `SelectOption[]` | *obrigatória* | Lista de opções. Cada uma tem value, label e, se quiser, disabled. |
| `placeholder` | `string` | — | Texto da opção inicial, exibido enquanto nada foi escolhido. Para aparecer, o campo precisa começar com defaultValue vazio. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="select"). className e style continuam no select nativo (data-slot="select-field"). |
| `wrapperStyle` | `CSSProperties` | — | Estilo da raiz (data-slot="select"). style continua no select nativo. |

Aceita também os demais atributos de `<select>`, repassados ao elemento. Encaminha o `ref` para `<select>`.

### Sidebar

Menu lateral. `permanent` fica na página e recolhe para uma barra de ícones; `modal` vira um drawer com foco preso. Cada item é uma rota, uma âncora ou uma ação.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `sections` | `SidebarSection[]` | *obrigatória* | Seções do menu, como [{ id, title?, items: [{ id, label, icon?, href?, native?, badge?, onClick? }] }]. Um item com href é um link; sem href é um botão que chama onClick. Sem icon, o item mostra a inicial do rótulo. |
| `activeSectionId` | `string` | — | Id do item de âncora marcado como localização atual (aria-current="location"): um item com href #id, ou /pagina#id na própria página. Use useScrollSpy para obtê-lo. |
| `currentHref` | `string` | — | Caminho atual, que marca o item da página (aria-current="page") e vale também para o hash da página atual. Sem ele vale o currentHref do UIProvider. |
| `header` | `SidebarSlot` | — | Conteúdo fixo no topo, como a marca. Pode ser uma função que recebe { collapsed } para trocar o conteúdo na barra recolhida. |
| `footer` | `SidebarSlot` | — | Conteúdo fixo no rodapé, acima do botão de recolher. Pode ser uma função que recebe { collapsed }. |
| `variant` | `'permanent' \| 'modal'` | `'permanent'` | permanent fica na página; modal vira um drawer com foco preso, página inerte e Esc para fechar, que só fecha a camada de cima. |
| `collapsed` | `boolean` | `false` | Barra só de ícones (80px) em vez da completa. A largura anima por data-state (expanded, collapsing, collapsed e expanding); com animation={false} muda de uma vez. Só vale em permanent. |
| `onToggleCollapsed` | `() => void` | — | Mostra o botão de recolher no rodapé e é chamado ao clicar nele. Sem esta prop o botão não aparece; quem usa guarda o estado de collapsed. |
| `open` | `boolean` | — | Só em modal: abre o drawer. Fechado, nada é renderizado. |
| `onClose` | `() => void` | — | Só em modal: chamado ao clicar no fundo, apertar Esc ou escolher um item. |
| `ariaLabel` | `string` | — | Nome acessível da navegação. O padrão vem do UIProvider: labels.mainNavigation em permanent e labels.mobileNavigation em modal. |
| `id` | `string` | — | id da raiz em permanent ou do painel em modal, útil para o aria-controls do botão que abre o menu. |
| `animation` | `false \| { recipe, from, tuning }` | — | false desliga o movimento. Em permanent ajusta o recolher ({ tuning: { duration } }); em modal, o deslize do drawer ({ tuning: { distance, duration } }). |
| `className` | `string` | — | Classe da raiz (data-slot="sidebar"); no drawer, do painel (data-slot="sidebar-panel"). Também dá para estilizar por data-slot, data-state e data-variant. |
| `style` | `CSSProperties` | — | Estilo da raiz em permanent ou do painel em modal. |

### Skeleton

Espaço reservado enquanto o conteúdo carrega, com brilho animado, nas formas texto, círculo e retângulo.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'text'` | Forma do espaço reservado. |
| `width` | `string` | — | Largura (qualquer valor CSS). No circular, width ou height define os dois lados. |
| `height` | `string` | — | Altura (qualquer valor CSS). |
| `animation` | `false \| { recipe, tuning }` | `shimmer` | false desliga o brilho. { tuning: { duration } } muda a duração em segundos. Com movimento reduzido o brilho vira um pulso de opacidade. |

Aceita também os demais atributos de `<div>`, repassados ao elemento.

### Switch

Interruptor de liga e desliga para uma configuração que vale na hora, com rótulo clicável. É um `<input type="checkbox">` com `role="switch"`, então leitores de tela o anunciam como interruptor e o formulário envia o valor só quando ligado. Aceita `ref` e os atributos do `<input>`. Para uma escolha que só vale ao enviar o formulário, prefira o `Checkbox`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Texto do rótulo. Clicar nele também liga e desliga. Sem rótulo visível, passe aria-label. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="switch"). className continua no input nativo (data-slot="switch-input"). |
| `wrapperStyle` | `CSSProperties` | — | Estilo da raiz (data-slot="switch"). style continua no input nativo. |
| `animation` | `false \| { recipe, tuning }` | `fade` | Animação da troca: a bolinha desliza e a trilha muda de cor. false desliga; { tuning: { duration } } ajusta a duração em segundos. |

Aceita também os demais atributos de `<input>`, repassados ao elemento. Encaminha o `ref` para `<input>`.

### Table

Tabela de dados semântica, montada a partir de `columns` e `rows`: uma `<table>` com legenda (`<caption>`), cabeçalhos de coluna (`scope="col"`), cabeçalhos de linha opcionais e células que aceitam qualquer conteúdo pela função `cell`. É genérica: o tipo da linha passa das `rows` para as colunas. Quando a tabela é mais larga que o espaço, o contêiner rola na horizontal e vira uma região focável com o nome da tabela, para quem usa só o teclado. Não ordena nem pagina: ordene os dados antes e use a `Pagination` ao lado. Aceita `ref`, que vai para o contêiner, e os atributos do `<div>`; `className` e `style` também vão para ele.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `columns` | `TableColumn<Row>[]` | *obrigatória* | Colunas da tabela, na ordem da tela. Cada uma tem `key` (o campo da linha que ela mostra), `header` (texto do cabeçalho) e, se quiser, `cell` (função que devolve o conteúdo da célula de uma linha), `align` (`start`, `center` ou `end`), `width` (largura CSS, como `8rem`) e `rowHeader` (as células dela viram cabeçalhos de linha). Sem `cell`, a coluna mostra `row[key]` como texto. |
| `rows` | `Row[]` | *obrigatória* | Linhas da tabela, um objeto por linha. O tipo das linhas liga as colunas a elas: `TableColumn<Pedido>[]` com `rows` de `Pedido`. |
| `getRowKey` | `(row: Row, index: number) => string \| number` | — | Devolve a chave estável de uma linha, como o id, para o React reaproveitar a linha quando a ordem muda. Sem ela, vale a posição. |
| `caption` | `string` | — | Título da tabela, escrito como `<caption>` acima dela, que também dá o nome acessível. Para um nome que não aparece, passe ariaLabel. |
| `ariaLabel` | `string` | — | Nome da tabela para leitores de tela, útil quando não há legenda. Com as duas, vale ariaLabel. |
| `empty` | `ReactNode` | — | Conteúdo mostrado em uma célula que ocupa todas as colunas quando não há linhas. Sem ele, só o cabeçalho aparece. |
| `size` | `'sm' \| 'md'` | `'md'` | Densidade das linhas: sm é compacta e md é a padrão. |
| `striped` | `boolean` | `false` | Alterna o fundo das linhas para ajudar a seguir uma linha comprida. |

Aceita também os demais atributos de `<div>`, repassados ao elemento. Encaminha o `ref` para `<div>`.

### Tabs

Abas para dividir um conteúdo em painéis e mostrar um por vez. Seguem o padrão ARIA de abas: `role="tablist"`, uma única parada do Tab na aba escolhida, setas, Home e End para navegar e cada painel ligado à sua aba. Um indicador desliza até a aba escolhida, e a lista rola na horizontal quando as abas não cabem. As abas são horizontais. Aceita `ref`, que vai para a raiz, e os atributos do `<div>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` | `TabsItem[]` | *obrigatória* | Abas da lista, na ordem da tela. Cada item tem `value` (único), `label` (texto da aba), `content` (conteúdo do painel) e, se quiser, `disabled`. Todos os painéis ficam no documento e só o da aba escolhida aparece, então o estado dos outros se mantém. |
| `value` | `string` | — | Valor da aba escolhida quando o componente é controlado. Exige também onValueChange. Veja a story Controlled. |
| `defaultValue` | `string` | — | Valor da aba escolhida no início, para uso sem controle externo. Sem ele, vale a primeira aba que não está desativada. |
| `onValueChange` | `(value: string) => void` | — | Chamada com o valor da aba que o usuário acabou de escolher, por clique ou pelo teclado. |
| `activation` | `'automatic' \| 'manual'` | `'automatic'` | Quando a aba focada pelas setas passa a valer: automatic escolhe a aba ao focá-la e manual só move o foco, e Enter ou Espaço escolhe. Prefira manual quando o painel demora a carregar. |
| `ariaLabel` | `string` | — | Nome da lista de abas para leitores de tela. Não aparece na tela: descreva o que as abas organizam, como Seções da conta. |
| `animation` | `false \| { recipe, tuning }` | `fade` | Animação do indicador, que desliza até a aba escolhida, e do painel, que aparece com um fade. false desliga; { tuning: { duration } } ajusta a duração em segundos. |

Aceita também os demais atributos de `<div>`, repassados ao elemento. Encaminha o `ref` para `<div>`.

### Textarea

Campo de texto de várias linhas, com rótulo, mensagem de erro e texto de ajuda, como o `Input`. Aceita `ref` e os atributos do `<textarea>`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `label` | `string` | — | Rótulo do campo, associado ao textarea para leitores de tela. |
| `error` | `string` | — | Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta. |
| `helperText` | `string` | — | Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro. |
| `fullWidth` | `boolean` | `false` | Ocupa toda a largura disponível. |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Como o usuário redimensiona o campo pela alça do canto: none não deixa, vertical muda só a altura, horizontal só a largura e both as duas. |
| `rows` | `number` | `3` | Número de linhas visíveis. O campo rola quando o texto passa disso. |
| `wrapperClassName` | `string` | — | Classe da raiz (data-slot="textarea"). className e style continuam no textarea nativo (data-slot="textarea-field"). |
| `wrapperStyle` | `CSSProperties` | — | Estilo da raiz (data-slot="textarea"). style continua no textarea nativo. |

Aceita também os demais atributos de `<textarea>`, repassados ao elemento. Encaminha o `ref` para `<textarea>`.

### ThemeToggle

Botão que alterna entre o modo claro e o escuro, com o ícone trocando por crossfade. Precisa de um `ColorModeProvider`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `animation` | `MotionOverride` | — | false desliga o feedback de toque; { recipe } ajusta. O ícone troca por crossfade de CSS em até 150 ms. |

Aceita também os demais atributos de `<button>`, repassados ao elemento.

### ThemeVariables

Um `<style>` com as variáveis CSS `--enchase-*` do tema. O `ColorModeProvider` já faz isso; use `ThemeVariables` só para renderizar um CSS de tema seu, como o resultado de `themeCss`, de `enchase/theme`.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `css` | `string` | *obrigatória* | O CSS das variáveis do tema, usado como conteúdo do `<style>`. |

### ToastProvider

Guarda a fila de notificações e a região onde elas aparecem (role="region", com aria-live). Os métodos success, error, warning e info de useToast abrem as notificações.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | A aplicação. Os componentes dentro dela usam useToast para abrir notificações. |
| `animation` | `false \| { recipe, from, tuning }` | `slide` | Movimento de entrada e saída das notificações, que deslizam da direita com uma mola curta. false desliga; { recipe, from, tuning } ajusta a receita, o lado e a duração. |
| `className` | `string` | — | Classe da região de notificações (data-slot="toast-viewport"), que vence a da biblioteca. |
| `style` | `CSSProperties` | — | Estilo da região de notificações. |

### Tooltip

Dica de texto para um gatilho, aberta por ponteiro e por foco. Dá uma descrição acessível ao gatilho e ajusta a posição perto da borda da tela.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `text` | `string` | *obrigatória* | Texto da dica. Com describe ligado, ele também vira a descrição acessível do gatilho. |
| `children` | `ReactNode` | *obrigatória* | O gatilho. Fica dentro de um div (data-slot="tooltip-trigger") e, com describe ligado, recebe aria-describedby. |
| `position` | `'start' \| 'end' \| 'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Lado do gatilho onde a dica aparece. start e end seguem a direção do UIProvider (esquerda e direita em ltr, o inverso em rtl). Perto da borda da tela a dica inverte o lado e se desloca para caber. |
| `describe` | `boolean` | `true` | Liga a descrição acessível do gatilho. Desligue quando o gatilho já tem o mesmo texto como nome, como um botão só com ícone. |
| `animation` | `false \| { recipe, tuning }` | `fade` | false desliga a transição. { recipe: "pop" } acrescenta uma escala leve; { tuning: { duration } } muda a duração em segundos. |
| `openDelay` | `number` | `100` | Milissegundos entre entrar no gatilho e mostrar a dica. 0 mostra na hora. Com outra dica aberta, ou fechada há menos de 300 ms, a próxima abre sem esperar e sem animação. |
| `closeDelay` | `number` | `120` | Milissegundos entre sair do gatilho e esconder a dica. Mover o ponteiro para a própria dica mantém ela aberta. |
| `className` | `string` | — | Classe do elemento que envolve o gatilho (data-slot="tooltip-trigger"). |
| `style` | `CSSProperties` | — | Estilo do elemento que envolve o gatilho. |
| `bubbleClassName` | `string` | — | Classe da dica (data-slot="tooltip-bubble"). Também dá para estilizar por data-slot, data-position e data-state. |
| `bubbleStyle` | `CSSProperties` | — | Estilo da dica. |

### UIProvider

Configuração compartilhada por todos os componentes: idioma e textos, breakpoints, movimento e navegação (navigate e currentHref). É opcional: sem ele, os componentes usam inglês, os breakpoints do Bootstrap 5, movimento automático e links que recarregam a página.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *obrigatória* | A aplicação. Os componentes leem a configuração do UIProvider mais próximo; sem nenhum, valem os padrões. |
| `motion` | `{ mode?, preset?, recipes? }` | `{ mode: 'auto', preset: 'standard' }` | Movimento de todos os componentes: { mode, preset, recipes }. mode "auto" respeita prefers-reduced-motion e "never" desliga todo o movimento. preset escala a duração e a distância: "off", "subtle", "standard" ou "expressive". recipes ajusta fade, pop, slide, press, lift, resize, spin e shimmer, como { slide: { distance: 48 } }. |
| `locale` | `Locale` | `en` | Idioma, no formato { locale, dir, messages }, como o ptBR e o en de enchase/locales. Define os textos de acessibilidade dos componentes e a direção (ltr ou rtl) que eles usam. O `dir` do `<html>` continua sendo do app. |
| `labels` | `Partial<UILabels>` | — | Troca textos avulsos, como { closeModal: "Dispensar" }, sobre os do locale. |
| `breakpoints` | `Partial<Breakpoints>` | `{ xs: '0px', sm: '576px', md: '768px', lg: '992px', xl: '1200px', xxl: '1400px' }` | Largura de cada breakpoint (xs, sm, md, lg, xl e xxl) em qualquer valor CSS de largura, como { md: "1000px" }. Valem para Container, Layout, Navbar, Sidebar e useBreakpoint. |
| `navigate` | `(href: string) => void` | — | Chamado com o href quando há um clique simples em uma rota do app (um href que começa com /). Ligue ao seu roteador, como (href) => router.push(href). Sem ele, os links recarregam a página. |
| `currentHref` | `string` | — | Caminho atual do app. Marca o item ativo dos menus (aria-current="page"), deriva os Breadcrumbs do Layout e faz um link com hash para a própria página (/docs#props) rolar sem passar pelo navigate. Sem ele, o hash é comparado com a URL do navegador. |

### VisuallyHidden

Esconde o texto da tela mas o mantém na árvore de acessibilidade. Serve para dar nome a controles que só têm ícone.

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

Devolve o `id` da seção que está na faixa de leitura, de `topOffset` px (padrão 96) do topo até 45% da altura da tela, ou `undefined` enquanto nenhuma chegou. Acompanha as seções que montam depois, remontam ou saem da página, e só o conteúdo do array de `ids` conta, não a identidade dele.

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

Configuração do `UIProvider` mais próximo: motion, rótulos, direção do texto, código do idioma (`locale`, como `pt-BR`) e breakpoints. Sem provedor, devolve os valores padrão.

Retorno:

| Membro | Tipo |
| --- | --- |
| `motion` | `MotionSettings` |
| `labels` | `UILabels` |
| `dir` | `Direction` |
| `locale` | `string` |
| `breakpoints` | `Breakpoints` |

## Ícones

Exportados por `enchase/icons`, um componente por ícone, e só os que algum componente usa por dentro. Funcionam em Server Components. Todos têm as mesmas props. Sem `title` o ícone é decorativo (`aria-hidden`); com `title` vira uma imagem com nome acessível. O atributo `data-icon` leva o nome em kebab case, para estilizar de fora ou nos testes, e os que apontam para um lado espelham em RTL sozinhos. Mudar o desenho de um ícone não é uma quebra; renomear ou remover é.

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `size` | `number` | `24` | Lado do ícone em pixels. |
| `title` | `string` | — | Nome acessível. Sem ele o ícone é decorativo (aria-hidden="true"); com ele vira role="img" e ganha um elemento title dentro do SVG. |

Aceita também os demais atributos de `<svg>`, repassados ao elemento.

| Ícone | `data-icon` | Espelha em RTL |
| --- | --- | --- |
| `AlertTriangleIcon` | `alert-triangle` | — |
| `CheckIcon` | `check` | — |
| `ChevronDownIcon` | `chevron-down` | — |
| `ChevronLeftIcon` | `chevron-left` | sim |
| `ChevronRightIcon` | `chevron-right` | sim |
| `ChevronsLeftIcon` | `chevrons-left` | sim |
| `ChevronsRightIcon` | `chevrons-right` | sim |
| `CloseIcon` | `close` | — |
| `ExternalLinkIcon` | `external-link` | sim |
| `EyeIcon` | `eye` | — |
| `EyeOffIcon` | `eye-off` | — |
| `InfoIcon` | `info` | — |
| `LogOutIcon` | `log-out` | sim |
| `MenuIcon` | `menu` | — |
| `MenuOpenIcon` | `menu-open` | sim |
| `MinusIcon` | `minus` | — |
| `MoonIcon` | `moon` | — |
| `PlusIcon` | `plus` | — |
| `SunIcon` | `sun` | — |

## Ganchos de CSS

Variáveis CSS opcionais que cada componente lê para mudar uma medida, uma fonte, um canto ou um tempo sem escrever CSS por cima. O tema não as declara: sem valor, o componente usa o padrão da tabela, e um padrão que aponta para um token do tema continua seguindo uma sobrescrita desse token. O nome é `--enchase-<data-slot>-<propriedade>`, com o nome do `data-slot` da parte e, quando há mais de um tamanho ou variante, o sufixo dela (`--enchase-switch-thumb-size`, `--enchase-button-padding-inline-md`). Experimentais até a versão 1.0: um nome pode mudar numa versão menor.

### Accordion

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-accordion-distance` | `6px` | `transform` |
| `--enchase-accordion-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-accordion-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-accordion-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |
| `--enchase-accordion-trigger-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-accordion-trigger-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-accordion-trigger-line-height` | `1.4` (`--enchase-line-height-snug`) | `line-height` |

### Alert

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-alert-close-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-alert-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-alert-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-alert-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-alert-line-height` | `1.5` (`--enchase-line-height-normal`) | `line-height` |
| `--enchase-alert-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |
| `--enchase-alert-title-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |

### AppBar

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-app-bar-background` | `color-mix(in srgb, var(--enchase-color-surface) 80%, transparent)` | `background-color` |
| `--enchase-app-bar-blur` | `12px` | `-webkit-backdrop-filter`, `backdrop-filter` |
| `--enchase-app-bar-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-app-bar-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-layout-header-menu-button-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |

### Badge

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-badge-font-size-md` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-badge-font-size-sm` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-badge-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-badge-line-height` | `1` (`--enchase-line-height-none`) | `line-height` |
| `--enchase-badge-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |

### Brand

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-brand-font-size` | `1.375rem` (`--enchase-font-size-xl`) | `font-size` |
| `--enchase-brand-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-brand-letter-spacing` | `-0.01em` (`--enchase-letter-spacing-tight`) | `letter-spacing` |
| `--enchase-brand-mark-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-brand-mark-font-weight` | `700` (`--enchase-font-weight-bold`) | `font-weight` |
| `--enchase-brand-mark-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |

### Breadcrumbs

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-breadcrumbs-current-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-breadcrumbs-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-breadcrumbs-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-breadcrumbs-ellipsis-font-weight` | `700` (`--enchase-font-weight-bold`) | `font-weight` |
| `--enchase-breadcrumbs-ellipsis-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-breadcrumbs-item-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-breadcrumbs-link-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-breadcrumbs-link-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-breadcrumbs-text-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |

### Button

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-button-distance` | `2px` (`--enchase-motion-distance-xs`) | `transform` |
| `--enchase-button-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` (também em ThemeToggle) |
| `--enchase-button-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-button-font-size-lg` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-button-font-size-md` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-button-font-size-sm` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-button-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-button-gap` | `0.5rem` (`--enchase-space-sm`) | `gap` |
| `--enchase-button-letter-spacing` | `0.01em` (`--enchase-letter-spacing-control`) | `letter-spacing` |
| `--enchase-button-line-height` | `1.2` (`--enchase-line-height-tight`) | `line-height` |
| `--enchase-button-padding-block-lg` | `0.25rem` (`--enchase-space-xs`) | `padding-block` |
| `--enchase-button-padding-block-md` | `0.25rem` (`--enchase-space-xs`) | `padding-block` |
| `--enchase-button-padding-block-sm` | `0.25rem` (`--enchase-space-xs`) | `padding-block` |
| `--enchase-button-padding-inline-ghost` | `1rem` (`--enchase-space-md`) | `padding-inline` |
| `--enchase-button-padding-inline-lg` | `2rem` (`--enchase-space-xl`) | `padding-inline` |
| `--enchase-button-padding-inline-md` | `1.5rem` (`--enchase-space-lg`) | `padding-inline` |
| `--enchase-button-padding-inline-sm` | `1rem` (`--enchase-space-md`) | `padding-inline` |
| `--enchase-button-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-button-scale` | `0.97` | `transform` (também em ThemeToggle) |

### Card

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-card-distance` | `2px` (`--enchase-motion-distance-xs`) | `transform` |
| `--enchase-card-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-card-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-card-radius` | `1.5rem` (`--enchase-radius-xl`) | `border-radius` |

### Checkbox

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-checkbox-box-check-width` | `2px` | `border-width` |
| `--enchase-checkbox-box-radius` | `2px` | `border-radius` |
| `--enchase-checkbox-box-size` | `18px` | `inline-size`, `block-size`, `margin-block-start` |
| `--enchase-checkbox-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-checkbox-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-checkbox-label-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-checkbox-scale` | `0.6` | `transform` |

### Container

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-container-max` | `100%` | `max-inline-size` |
| `--enchase-container-padding` | `1rem` (`--enchase-space-md`) | `padding-inline` |

### Flex

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-flex-gap` | `1rem` (`--enchase-space-md`) | `gap` |

### footer

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-footer-copyright-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-footer-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-footer-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-footer-link-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-footer-link-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |

### Grid

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-grid-columns` | `repeat(1, 1fr)` | `grid-template-columns` |
| `--enchase-grid-gap` | `1rem` (`--enchase-space-md`) | `gap`, `flex`, `flex-basis` |
| `--enchase-grid-min-column` | `14rem` | `flex` |
| `--enchase-grid-n` | `1` | `grid-template-columns`, `flex`, `flex-basis` |
| `--enchase-grid-n-lg` | `1` | `--enchase-grid-n` |
| `--enchase-grid-n-md` | `1` | `--enchase-grid-n` |
| `--enchase-grid-n-sm` | `1` | `--enchase-grid-n` |
| `--enchase-grid-n-xl` | `1` | `--enchase-grid-n` |
| `--enchase-grid-n-xs` | `1` | `--enchase-grid-n` |
| `--enchase-grid-n-xxl` | `1` | `--enchase-grid-n` |

### Icon

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-icon-swap-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-icon-swap-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-icon-swap-rotate` | `0deg` | `transform` |

### Input

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-input-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-input-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-input-error-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-input-error-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-input-field-radius` | `0.5rem` (`--enchase-radius-control`) | `border-radius` |
| `--enchase-input-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` (também em NumberInput, Select, Textarea) |
| `--enchase-input-height` | `3.5rem` | `block-size`, `transform` (também em NumberInput, Select) |
| `--enchase-input-helper-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-input-min-width` | `200px` | `min-inline-size` (também em NumberInput, Select, Textarea) |
| `--enchase-input-padding-inline` | `1rem` (`--enchase-space-md`) | `padding-inline`, `inset-inline-start`, `max-inline-size` (também em NumberInput, Select, Textarea) |
| `--enchase-input-toggle-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |

### layout

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-layout-skip-link-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-layout-skip-link-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |

### Link

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-link-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-link-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-link-radius` | `0.5rem` (`--enchase-radius-sm`) | `border-radius` |
| `--enchase-link-underline-offset` | `0.2em` | `text-underline-offset` |

### Loading

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-loading-duration` | `250ms` (`--enchase-motion-duration-base`) | `transition`, `animation` |
| `--enchase-loading-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition`, `animation` |
| `--enchase-loading-text-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-loading-text-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |

### Modal

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-modal-body-line-height` | `1.6` (`--enchase-line-height-relaxed`) | `line-height` |
| `--enchase-modal-close-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-modal-distance` | `0px` | `transform` |
| `--enchase-modal-duration` | `250ms` (`--enchase-motion-duration-base`) | `transition` |
| `--enchase-modal-dx` | `0` | `transform` |
| `--enchase-modal-dy` | `0` | `transform` |
| `--enchase-modal-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-modal-exit-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition-duration` |
| `--enchase-modal-exit-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition-timing-function` |
| `--enchase-modal-fade-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-modal-panel-radius` | `1.75rem` (`--enchase-radius-2xl`) | `border-radius` |
| `--enchase-modal-scale` | `1` | `transform` |
| `--enchase-modal-title-font-size` | `1.75rem` (`--enchase-font-size-2xl`) | `font-size` |
| `--enchase-modal-title-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |

### navbar

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-navbar-background` | `color-mix(in srgb, var(--enchase-color-surface-container) 80%, transparent)` | `background-color` |
| `--enchase-navbar-blur` | `12px` | `-webkit-backdrop-filter`, `backdrop-filter` |
| `--enchase-navbar-distance` | `0px` | `transform` |
| `--enchase-navbar-drawer-radius-end-start` | `1.75rem` (`--enchase-radius-2xl`) | `border-end-start-radius` |
| `--enchase-navbar-drawer-radius-start-start` | `1.75rem` (`--enchase-radius-2xl`) | `border-start-start-radius` |
| `--enchase-navbar-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-navbar-dx` | `0` | `transform`, `translate` |
| `--enchase-navbar-dy` | `0` | `transform` |
| `--enchase-navbar-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-navbar-enter-delay` | `0ms` | `transition` |
| `--enchase-navbar-exit-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition-duration` |
| `--enchase-navbar-index` | `0` | `--enchase-navbar-enter-delay` |
| `--enchase-navbar-item-offset` | `12px` | `translate` |
| `--enchase-navbar-logo-font-size` | `1.375rem` (`--enchase-font-size-xl`) | `font-size` |
| `--enchase-navbar-logo-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-navbar-logo-letter-spacing` | `-0.01em` (`--enchase-letter-spacing-tight`) | `letter-spacing` |
| `--enchase-navbar-menu-button-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-navbar-menu-link-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-navbar-menu-link-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-navbar-menu-link-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-navbar-stagger` | `30ms` | `--enchase-navbar-enter-delay` |

### NumberInput

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-number-input-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-number-input-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-number-input-error-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-number-input-error-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-number-input-field-radius` | `0.5rem` (`--enchase-radius-control`) | `border-radius` |
| `--enchase-number-input-helper-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-number-input-stepper-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |

### Pagination

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-pagination-control-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-pagination-control-font-size-sm` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-pagination-control-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-pagination-control-line-height` | `1` (`--enchase-line-height-none`) | `line-height` |
| `--enchase-pagination-control-radius` | `0.5rem` (`--enchase-radius-control`) | `border-radius` |
| `--enchase-pagination-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-pagination-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-pagination-ellipsis-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-pagination-ellipsis-font-size-sm` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |

### Popover

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-popover-content-radius` | `1rem` (`--enchase-radius-lg`) | `border-radius` |
| `--enchase-popover-duration` | `300ms` (`--enchase-motion-spring-snappy-duration`) | `transition-duration` |
| `--enchase-popover-ease` | `linear(0, 0.016, 0.056, 0.114, 0.182, 0.257, 0.333, 0.408, 0.48, 0.549, 0.612, 0.669, 0.721, 0.767, 0.807, 0.842, 0.873, 0.898, 0.92, 0.939, 0.954, 0.966, 0.976, 0.984, 0.99, 0.995, 0.999, 1.002, 1.004, 1.005, 1.006, 1.006, 1.006, 1.006, 1.006, 1.006, 1.005, 1.005, 1.004, 1.004, 1.003, 1.003, 1.002, 1.002, 1.002, 1.001, 1.001, 1)` (`--enchase-motion-spring-snappy`) | `transition-timing-function` |
| `--enchase-popover-exit-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition-duration` |
| `--enchase-popover-max-height` | `100vh` | `max-block-size` |
| `--enchase-popover-max-width` | `100vw` | `max-inline-size` |
| `--enchase-popover-scale` | `1` | `transform` |

### RadioGroup

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-radio-group-control-dot-size` | `calc(var(--enchase-radio-group-control-size, 1.25rem) / 2)` | `--radio-dot-size` |
| `--enchase-radio-group-control-radius` | `9999px` (`--enchase-radius-full`) | `border-radius` |
| `--enchase-radio-group-control-size` | `1.25rem` | `--radio-dot-size`, `inline-size`, `block-size` |
| `--enchase-radio-group-dot-radius` | `9999px` (`--enchase-radius-full`) | `border-radius` |
| `--enchase-radio-group-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-radio-group-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-radio-group-error-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-radio-group-error-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-radio-group-helper-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-radio-group-label-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-radio-group-legend-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-radio-group-legend-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-radio-group-scale` | `0.6` | `transform` |

### Select

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-select-distance` | `2px` (`--enchase-motion-distance-xs`) | `transform` |
| `--enchase-select-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-select-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-select-error-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-select-error-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-select-field-radius` | `0.5rem` (`--enchase-radius-control`) | `border-radius` |
| `--enchase-select-helper-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-select-option-font-weight-checked` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-select-option-radius` | `0.5rem` (`--enchase-radius-control`) | `border-radius` |
| `--enchase-select-picker-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |

### Sidebar

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-sidebar-collapse-button-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-sidebar-distance` | `0px` | `transform` |
| `--enchase-sidebar-duration` | `250ms` (`--enchase-motion-duration-base`) | `transition` |
| `--enchase-sidebar-dx` | `0` | `transform`, `translate` |
| `--enchase-sidebar-dy` | `0` | `transform` |
| `--enchase-sidebar-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-sidebar-exit-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition-duration` |
| `--enchase-sidebar-index` | `0` | `transition-delay` |
| `--enchase-sidebar-indicator-duration` | `var(--enchase-sidebar-duration, var(--enchase-motion-duration-base))` | `transition` |
| `--enchase-sidebar-indicator-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-sidebar-item-badge-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-sidebar-item-badge-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-sidebar-item-badge-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-sidebar-item-control-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-sidebar-item-control-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-sidebar-item-control-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-sidebar-item-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-sidebar-item-icon-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-sidebar-item-icon-font-weight` | `700` (`--enchase-font-weight-bold`) | `font-weight` |
| `--enchase-sidebar-item-offset` | `12px` | `translate` |
| `--enchase-sidebar-item-scale` | `0.98` | `transform` |
| `--enchase-sidebar-label-duration` | `calc(var(--enchase-sidebar-duration, var(--enchase-motion-duration-base)) * 0.4)` | `transition` |
| `--enchase-sidebar-panel-radius-end-end` | `1.75rem` (`--enchase-radius-2xl`) | `border-end-end-radius` |
| `--enchase-sidebar-panel-radius-start-end` | `1.75rem` (`--enchase-radius-2xl`) | `border-start-end-radius` |
| `--enchase-sidebar-radius-end-end` | `1rem` (`--enchase-radius-lg`) | `border-end-end-radius` |
| `--enchase-sidebar-radius-start-end` | `1rem` (`--enchase-radius-lg`) | `border-start-end-radius` |
| `--enchase-sidebar-section-title-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-sidebar-section-title-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-sidebar-stagger` | `30ms` | `transition-delay` |
| `--enchase-sidebar-width` | `280px` | `inline-size` |
| `--enchase-sidebar-width-collapsed` | `80px` | `inline-size` |

### SidebarUser

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-sidebar-user-avatar-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-sidebar-user-avatar-font-weight` | `700` (`--enchase-font-weight-bold`) | `font-weight` |
| `--enchase-sidebar-user-avatar-radius` | `9999px` (`--enchase-radius-full`) | `border-radius` |
| `--enchase-sidebar-user-logout-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-sidebar-user-name-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-sidebar-user-name-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |

### Skeleton

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-skeleton-duration` | `1.5s` | `animation` |
| `--enchase-skeleton-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` (`--enchase-motion-ease-in-out`) | `animation` |
| `--enchase-skeleton-radius-rectangular` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |
| `--enchase-skeleton-radius-text` | `0.5rem` (`--enchase-radius-sm`) | `border-radius` |

### Switch

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-switch-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-switch-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-switch-label-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-switch-thumb-inset` | `0.125rem` | `--switch-travel`, `inset-inline-start` |
| `--enchase-switch-thumb-radius` | `9999px` (`--enchase-radius-full`) | `border-radius` |
| `--enchase-switch-thumb-scale-off` | `0.667` | `transform` |
| `--enchase-switch-thumb-size` | `1.5rem` | `--switch-travel`, `inline-size`, `block-size` |
| `--enchase-switch-track-height` | `2rem` | `block-size` |
| `--enchase-switch-track-radius` | `9999px` (`--enchase-radius-full`) | `border-radius` |
| `--enchase-switch-track-width` | `3.25rem` | `--switch-travel`, `inline-size` |

### Table

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-table-caption-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-table-element-font-size-md` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-table-element-font-size-sm` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-table-header-font-weight` | `600` (`--enchase-font-weight-semibold`) | `font-weight` |
| `--enchase-table-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |
| `--enchase-table-row-header-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |

### Tabs

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-tabs-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-tabs-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-tabs-tab-font-size` | `1rem` (`--enchase-font-size-base`) | `font-size` |
| `--enchase-tabs-tab-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-tabs-tab-line-height` | `1.2` (`--enchase-line-height-tight`) | `line-height` |

### Textarea

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-textarea-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-textarea-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-textarea-error-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-textarea-error-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-textarea-field-line-height` | `1.5` (`--enchase-line-height-normal`) | `line-height` |
| `--enchase-textarea-field-radius` | `0.5rem` (`--enchase-radius-control`) | `border-radius` |
| `--enchase-textarea-helper-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-textarea-min-height` | `3.5rem` | `min-block-size` |
| `--enchase-textarea-padding-block` | `1rem` (`--enchase-space-md`) | `padding-block`, `transform` |

### ThemeToggle

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-theme-toggle-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition` |
| `--enchase-theme-toggle-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-theme-toggle-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |

### toast

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-toast-close-radius` | `9999px` (`--enchase-radius-button`) | `border-radius` |
| `--enchase-toast-distance` | `0px` | `transform` |
| `--enchase-toast-duration` | `300ms` (`--enchase-motion-spring-snappy-duration`) | `transition` |
| `--enchase-toast-dx` | `0` | `transform` |
| `--enchase-toast-dy` | `0` | `transform` |
| `--enchase-toast-ease` | `linear(0, 0.016, 0.056, 0.114, 0.182, 0.257, 0.333, 0.408, 0.48, 0.549, 0.612, 0.669, 0.721, 0.767, 0.807, 0.842, 0.873, 0.898, 0.92, 0.939, 0.954, 0.966, 0.976, 0.984, 0.99, 0.995, 0.999, 1.002, 1.004, 1.005, 1.006, 1.006, 1.006, 1.006, 1.006, 1.006, 1.005, 1.005, 1.004, 1.004, 1.003, 1.003, 1.002, 1.002, 1.002, 1.001, 1.001, 1)` (`--enchase-motion-spring-snappy`) | `transition` |
| `--enchase-toast-exit-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition-duration` |
| `--enchase-toast-exit-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition-timing-function` |
| `--enchase-toast-fade-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition` |
| `--enchase-toast-lifetime` | `3000ms` | `animation` |
| `--enchase-toast-radius` | `0.75rem` (`--enchase-radius-md`) | `border-radius` |
| `--enchase-toast-title-font-size` | `0.875rem` (`--enchase-font-size-sm`) | `font-size` |
| `--enchase-toast-title-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-toast-title-line-height` | `1.5` (`--enchase-line-height-normal`) | `line-height` |

### Tooltip

| Gancho | Padrão | Propriedade |
| --- | --- | --- |
| `--enchase-tooltip-bubble-font-size` | `0.75rem` (`--enchase-font-size-xs`) | `font-size` |
| `--enchase-tooltip-bubble-font-weight` | `500` (`--enchase-font-weight-medium`) | `font-weight` |
| `--enchase-tooltip-bubble-radius` | `0.25rem` (`--enchase-radius-xs`) | `border-radius` |
| `--enchase-tooltip-duration` | `150ms` (`--enchase-motion-duration-fast`) | `transition-duration` |
| `--enchase-tooltip-ease` | `cubic-bezier(0.2, 0, 0, 1)` (`--enchase-motion-ease-out`) | `transition-timing-function` |
| `--enchase-tooltip-scale` | `1` | `transform` |
