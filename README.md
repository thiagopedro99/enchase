<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo-branco.svg">
    <img src="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo.svg" alt="Enchase" width="360">
  </picture>
</p>

# Enchase

Componentes React acessíveis por contrato: tema com contraste validado, CSS primeiro, movimento próprio, SSR e RTL, e nenhuma dependência de runtime além do React.

> Versão `0.x`: a API ainda pode mudar entre versões menores.

[Documentação no Storybook](https://enchase.othiagosilva.com.br/docs/) · [Demonstração](https://enchase.othiagosilva.com.br/)

## O que a biblioteca garante (e o que não garante)

**Verificado por testes automatizados:**
- Todo componente passa no axe (vitest-axe) em jsdom, e os fluxos de foco, `inert`, scroll lock, Esc empilhado e restauração de foco rodam em Chromium, Firefox e WebKit reais.
- Os pares de cor da paleta padrão (claro e escuro) atingem 4,5:1 para texto e 3:1 para bordas de campos e anel de foco. O `createTheme` lança erro em valor de cor inválido, e `validateTheme` lista os pares abaixo do mínimo.
- Alvos interativos têm pelo menos 24 x 24 px, e os componentes respeitam `prefers-reduced-motion` (o deslocamento some, o fade continua).
- Renderização no servidor e hidratação sem erro em 6 variantes de ambiente (largura, tema salvo, sistema escuro e movimento reduzido), mais um app Next 15 mínimo (`npm run test:next`) importando os componentes num Server Component.
- O `className` de quem usa vence o da biblioteca (provado em navegador, na variante em camada em qualquer ordem de carregamento).

**Não garantido:**
- Conformidade total com WCAG: a lib verifica o que os tokens e os testes cobrem, e não substitui auditoria nem teste com leitores de tela (nada foi testado com NVDA, JAWS ou VoiceOver).
- Firefox e WebKit rodam a mesma suíte de navegador do Chromium, um arquivo por vez. No Linux ficam pulados 9 testes no Firefox e 5 no WebKit, todos porque dependem de chamadas só do Chromium (emulação de toque, mouse cru e métricas de layout; lista central com o motivo em `src/tests-browser/browserSkips.ts`), e os testes que dependem de um recurso que o navegador não tem são pulados só onde ele falta. Os testes de toque rodam no WebKit com o perfil de um iPhone (toque nativo), o mais perto do Safari que dá para automatizar. Os três navegadores passam no CI em Linux (Ubuntu 24.04) e bloqueiam o workflow. A devolução do foco ao gatilho e a armadilha de Tab funcionam também no Safari, onde clicar num botão não o focaliza: a biblioteca guarda o gatilho a partir do último ponteiro ou tecla. Revisão manual em Safari de verdade e com leitores de tela continua necessária.
- Contraste de temas personalizados em `hsl()`, `oklch()` ou `oklab()`: esses formatos não são medidos, e o aviso diz quantos pares ficaram sem checar.
- Gestos com velocidade (arrastar para dispensar, inércia) e presets de design alternativos: ainda não existem.

## Instalação

```bash
npm install enchase
```

`react` e `react-dom` (versão 19) são peer dependencies. O pacote é ESM e traz os tipos.

## Início rápido

### Next.js (App Router)

```tsx
import { ColorModeProvider, ColorModeScript, GlobalStyles, UIProvider } from 'enchase'
import 'enchase/styles.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <ColorModeScript />
      </head>
      <body>
        <ColorModeProvider>
          <GlobalStyles />
          <UIProvider>{children}</UIProvider>
        </ColorModeProvider>
      </body>
    </html>
  )
}
```

### Vite

```tsx
import { createRoot } from 'react-dom/client'
import { ColorModeProvider, GlobalStyles, ToastProvider, UIProvider } from 'enchase'
import { ptBR } from 'enchase/locales'
import 'enchase/styles.css'

createRoot(document.getElementById('root')!).render(
  <ColorModeProvider>
    <GlobalStyles />
    <UIProvider locale={ptBR}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UIProvider>
  </ColorModeProvider>
)
```

A fonte padrão é Figtree: carregue-a no app (por exemplo com `@fontsource-variable/figtree`) ou troque a família pelo tema.

## Entradas do pacote

| Entrada | Conteúdo |
| --- | --- |
| `enchase` | Componentes, provedores, hooks e tipos. Marcada como `'use client'`. |
| `enchase/theme` | `createTheme`, `validateTheme`, `validateMotion`, `contrastRatio`, `spring` e os tokens. Sem React. |
| `enchase/locales` | `en` e `ptBR` (`{ locale, dir, messages }`). Só dados. |
| `enchase/styles.css` | CSS dos componentes. |
| `enchase/styles.layer.css` | O mesmo CSS dentro de `@layer enchase`. |
| `enchase/theme.css` | Variáveis do tema padrão, claro e escuro, como arquivo estático. |

Quem consome importa só dessas entradas. O código interno (`src/`) não é público.

O pacote traz um arquivo por módulo e declara `sideEffects` só para CSS, então o bundler de quem usa descarta o que não for importado.

## Componentes

Cada componente tem uma story no [Storybook publicado](https://enchase.othiagosilva.com.br/docs/) (ou `npm run storybook`, em `Componentes/<Nome>`).

| Componente | Exemplo mínimo |
| --- | --- |
| `Button` | `<Button variant="primary">Salvar</Button>` |
| `ButtonLink` | `<ButtonLink href="/docs">Documentação</ButtonLink>` |
| `Link` | `<Link href="/sobre">Sobre</Link>` |
| `Input` | `<Input label="E-mail" type="email" error="Informe um e-mail" />` |
| `Select` | `<Select label="País" options={[{ value: 'br', label: 'Brasil' }]} />` |
| `Checkbox` | `<Checkbox label="Aceito os termos" />` |
| `Card` | `<Card variant="elevated">Conteúdo</Card>` |
| `Container`, `Flex`, `Grid` | `<Grid minColumnWidth="14rem" gap="1rem">...</Grid>` |
| `Modal` | `<Modal isOpen={open} onClose={close} title="Editar">...</Modal>` |
| `ConfirmModal` | `<ConfirmModal isOpen={open} onClose={close} onConfirm={apagar} message="Apagar item?" />` |
| `Tooltip` | `<Tooltip text="Ajuda"><button>?</button></Tooltip>` |
| `Popover` | `<Popover label="Detalhes" content={<p>Conteúdo</p>}><button>Abrir</button></Popover>` |
| `Loading`, `InlineLoading` | `<Loading overlay text="Carregando" />` |
| `Skeleton` | `<Skeleton variant="text" width="12rem" />` |
| `Breadcrumbs` | `<Breadcrumbs items={[{ id: 'home', label: 'Início', href: '/' }, { id: 'page', label: 'Atual' }]} />` |
| `Sidebar` | `<Sidebar sections={sections} collapsed={collapsed} onToggleCollapsed={toggle} />` |
| `Navbar` | `<Navbar logo="Meu app" sections={sections} />` |
| `Footer` | `<Footer companyName="Acme" notice="Licença MIT." />` |
| `Layout` | `<Layout brand="Acme" navigationSections={sections}>...</Layout>` |
| `ThemeToggle` | `<ThemeToggle />` |
| `Icon` | `<Icon><circle cx="12" cy="12" r="1" /></Icon>` |
| `VisuallyHidden` | `<VisuallyHidden>Texto só para leitores de tela</VisuallyHidden>` |

A biblioteca não exporta um conjunto de ícones: os que os componentes usam por dentro (menu, fechar, setas, olho, sol e lua) são internos. O `Icon` é um contêiner SVG de 24x24, com traço de 2 px e a cor do texto, para os seus próprios caminhos. Para ícones prontos, use uma biblioteca de ícones (lucide-react, Phosphor, Heroicons) direto, sem o `Icon`: qualquer nó React serve no conteúdo de um `Button` ou na prop `icon` de um item da `Sidebar`.

```tsx
import { Rocket } from 'lucide-react'
import { Button, Icon } from 'enchase'

<Button variant="primary">
  <Rocket size={18} aria-hidden="true" />
  Começar
</Button>

<Icon title="Adicionar" size={20}>
  <path d="M12 5v14M5 12h14" />
</Icon>
```

Sem `title`, o ícone é decorativo (`aria-hidden`); com `title`, vira uma imagem com nome acessível. Use `directional` em setas e chevrons para espelharem em RTL.

Notificações usam o hook `useToast` dentro do `ToastProvider`:

```tsx
import { useToast } from 'enchase'

const { success, error } = useToast()

success('Salvo com sucesso')
```

### Layout e navegação

O `Layout` oferece duas navegações pela prop `navigation`: `sidebar` (padrão, com `AppBar`, breadcrumb e botão de tema, e menu lateral que recolhe para ícones e vira drawer modal no mobile) e `navbar` (barra clássica no topo).

```tsx
const sections = [
  { id: 'nav', title: 'Navegação', items: [{ id: 'home', label: 'Início', href: '/' }] }
]

<Layout brand="Acme" navigationSections={sections} storageKey="acme-sidebar">
  <h1>Conteúdo</h1>
</Layout>
```

- `navigationSections`, `pageSections` e `activePageSectionId`: itens do menu e âncoras da página (use o hook `useScrollSpy`). O `Layout` não traz navegação, marca nem rodapé próprios e não altera o `document.title`.
- `collapsed`, `defaultCollapsed`, `onCollapsedChange`, `open`, `defaultOpen` e `onOpenChange` controlam a sidebar e o drawer, controlados ou não. `storageKey` guarda o estado recolhido no `localStorage`, lido só depois de montar.
- `breadcrumbs`: trilha explícita; sem ela o `Layout` a deriva da rota atual.
- `brand`, `brandLogo`, `sidebarFooter`, `footerProps` e `hideNavbar` completam a casca.

Cada item de menu pode ser uma rota (`href: '/caminho'`), uma âncora (`href: '#id'`) ou uma ação (`onClick`); `native: true` faz o link sair do app.

Para marcar a âncora da seção que está na tela, use `useScrollSpy(ids, topOffset = 96)` e passe o resultado em `activeSectionId` (`Navbar` e `Sidebar`) ou `activePageSectionId` (`Layout`):

```tsx
const sectionIds = ['recursos', 'demos', 'contato']

const active = useScrollSpy(sectionIds)

<Navbar logo="Acme" sections={sections} activeSectionId={active} />
```

O hook devolve o `id` da seção que está na faixa de leitura (de `topOffset` px do topo até 45% da altura da tela) ou `undefined` enquanto nenhuma chegou, por exemplo com um hero acima da primeira seção: nenhum item fica marcado. Depois da última seção, ela continua ativa. Mantenha o array de `ids` estável (uma constante fora do componente ou um `useMemo`).

Na `Navbar`, `logo` aceita texto ou qualquer nó React (uma imagem, ou um SVG com texto) e leva a `logoHref` (padrão `/`; pode ser uma âncora como `#inicio`). `actions` recebe nós, como um botão de chamada: em telas largas ficam na barra, entre o menu e o botão de tema, e em telas estreitas vão para o drawer, abaixo dos links; um clique em link dentro delas fecha o drawer. O nó é renderizado em um lugar por vez.

```tsx
<Navbar
  logo={<img src="/marca.svg" alt="Acme" height={28} />}
  logoHref="#inicio"
  sections={sections}
  activeSectionId={active}
  actions={
    <ButtonLink href="#contato" variant="primary">
      Fale conosco
    </ButtonLink>
  }
/>
```

## Navegação sem roteador

Os componentes não dependem de roteador. Links internos são `<a href>` de verdade: um clique simples chama o `navigate` do `UIProvider`, e Ctrl, Cmd, Shift, botão do meio, `target`, `download`, `native` e URLs externas seguem o comportamento do navegador. Sem `navigate`, os links recarregam a página.

```tsx
<UIProvider navigate={(href) => router.push(href)} currentHref={pathname}>
  <App />
</UIProvider>
```

`currentHref` marca o item ativo (`aria-current="page"`) e deriva os `Breadcrumbs`.

## Tema

As cores são papéis (`primary`, `surface`, `error`, `inverseSurface` e outros), nunca hex solto nos componentes, e chegam por variáveis `--enchase-*`. Trocar o modo muda só o `data-theme` do `<html>`.

```tsx
<ColorModeProvider
  theme={{
    fonts: { primary: "'Inter Variable', system-ui, sans-serif" },
    light: { colors: { primary: '#0B6BCB', onPrimary: '#FFFFFF' } },
    dark: { colors: { primary: '#9CCBFF', onPrimary: '#00325A' } }
  }}
>
  <App />
</ColorModeProvider>
```

- Todo valor é validado antes de virar CSS (cores em hex, `rgb()`, `hsl()`, `oklch()` ou `oklab()`; famílias, tamanhos e pesos de fonte). Valor inválido ou chave desconhecida lança erro dizendo qual token falhou.
- Em desenvolvimento o provider confere o contraste dos pares e avisa no console. Fora do React (build, servidor, CI):

```ts
import { createTheme, validateTheme } from 'enchase/theme'

const theme = createTheme({ light: { colors: { primary: '#0B6BCB' } } })
const issues = validateTheme(theme)
```

- O visual padrão segue a linguagem do Material Design 3 (paleta tonal em índigo, cantos arredondados, camadas de estado). Hoje existe um único preset; os alternativos são trabalho futuro.
- `useColorMode()` devolve `{ mode, resolvedMode, setMode, toggleMode }`. O modo (`light`, `dark` ou `system`, o padrão) fica no `localStorage`.

### Paleta a partir da cor da marca

Passe só a cor da marca e o `createTheme` gera as paletas clara e escura:

```tsx
<ColorModeProvider theme={{ brand: '#0F766E' }}>
  <App />
</ColorModeProvider>
```

- `brand` é um hex (`#0F766E`, `#0fe`) ou `rgb()`, sem transparência. Outro formato lança erro dizendo o motivo.
- No tema claro, o `primary` é a sua cor quando ela passa nos contrastes que o tema exige (texto e link sobre as superfícies, texto sobre o próprio `primary`). Se for clara demais para ser lida como texto, como um amarelo, o `primary` é a mesma cor, com o mesmo matiz, escurecida o mínimo necessário. No tema escuro, o `primary` é a versão clara da cor.
- O resto do primário (`onPrimary`, os contêineres, `primaryHover`, `inversePrimary`), o secundário e os neutros (superfícies, texto e bordas) saem do matiz da marca, com as mesmas luminosidades do tema padrão. Erro, sucesso, aviso, info, sombras, fontes e movimento não mudam.
- O que você passar em `light.colors` e `dark.colors` vence o gerado, token a token: `createTheme({ brand: '#0F766E', dark: { colors: { primary: '#7FE0D6' } } })`.
- Para qualquer cor de marca o `validateTheme` não aponta nenhum par abaixo do contraste mínimo. O teste da biblioteca percorre centenas de cores, de todos os matizes, do muito claro ao muito escuro e do cinza ao vibrante, e exige zero pares reprovados. A página Sistema/Marca do Storybook deixa você experimentar a sua cor.

## Idiomas e RTL

Os textos de acessibilidade vêm do `locale` do `UIProvider`. O padrão é inglês; `ptBR` acompanha o pacote, e `labels` sobrescreve textos avulsos:

```tsx
import { ptBR } from 'enchase/locales'

<UIProvider locale={ptBR} labels={{ closeModal: 'Fechar' }}>
  <App />
</UIProvider>
```

Um `locale` tem a forma `{ locale, dir, messages }`; use `dir: 'rtl'` para línguas da direita para a esquerda. O CSS usa propriedades lógicas, e os ícones direcionais espelham sozinhos. O `dir` do `<html>` continua sendo do app.

## Responsividade

Os breakpoints seguem o Bootstrap 5 (mobile-first, `min-width`): `xs` 0, `sm` 576 px, `md` 768 px, `lg` 992 px, `xl` 1200 px e `xxl` 1400 px.

```tsx
<UIProvider breakpoints={{ md: '1000px' }}>
  <Layout breakpoint="md" navigationSections={sections}>...</Layout>
</UIProvider>
```

- `UIProvider breakpoints` sobrescreve qualquer valor e vale para os componentes e hooks.
- `Layout` e `Navbar` aceitam `breakpoint` (padrão `md`) e expõem `data-layout="compact"` ou `"wide"` na raiz, para você estilizar por atributo.
- `useBreakpoint()` devolve `{ current, up(name), down(name) }`.
- `Grid`, `Footer`, `Modal`, `toast` e `Breadcrumbs` se ajustam pela largura disponível, sem `@media`. O `Container` limita a largura pelo breakpoint escolhido em `maxWidth`.

### Celular e toque

Os componentes já cuidam do que é da biblioteca:

- Controles sem o brilho de toque e sem o atraso do toque duplo (`touch-action: manipulation`), e hover só em ponteiro fino.
- Campos com fonte de pelo menos 16 px em ponteiro de toque, para o iOS não dar zoom ao focar.
- Alturas com `dvh` (a barra de endereço do celular muda a altura útil), `env(safe-area-inset-*)` nos elementos fixos nas bordas (toast e gavetas) e `overscroll-behavior: contain` nas áreas rolantes internas (gavetas, corpo do modal, popover).
- O bloqueio de rolagem da página (`Modal`, gavetas) bloqueia também o encadeamento de rolagem.
- Textos longos quebram ou encolhem com reticências em vez de empurrar a página para o lado (nomes, e-mails sem espaços, rótulos traduzidos), e a inicial do avatar usa a letra inteira, inclusive emoji.

O que é do seu app, não da biblioteca: a meta `viewport` (use `viewport-fit=cover` para a área segura valer, e `interactive-widget=resizes-content` se quiser que o teclado virtual reduza o layout), a cor da barra de status (`theme-color`, uma por esquema de cor) e a fonte dos seus próprios campos.

## Movimento

O movimento é CSS (transições, `@starting-style`, `@keyframes` só para loops e `linear()` para molas), mais o hook interno `usePresence`, que mantém o elemento montado até a saída terminar, lendo a duração real do estilo calculado. Não há biblioteca de animação.

Quatro níveis de configuração, do mais amplo ao mais específico:

```tsx
<UIProvider motion={{ mode: 'auto', preset: 'subtle', recipes: { slide: { distance: 48 } } }}>
  <Modal animation={{ recipe: 'fade' }} isOpen={open} onClose={close} />
  <Button animation={false}>Sem animação</Button>
</UIProvider>
```

1. `UIProvider motion`: `mode` (`auto` respeita `prefers-reduced-motion`; `never` desliga tudo), `preset` (`off`, `subtle`, `standard`, `expressive`) e `recipes` (`fade`, `pop`, `slide`, `press`, `lift`, `spin`, `shimmer`).
2. A prop `animation` de cada componente animado: `false` desliga; `{ recipe, from, tuning }` ajusta.
3. O tema: `createTheme({ motion: { duration, easing, distance } })` é validado, e duração acima de 300 ms vira aviso. `validateMotion` lista os avisos sem React. Cada mola vem no tema com a curva e a duração juntas: `--enchase-motion-spring-gentle` e `--enchase-motion-spring-gentle-duration` (300 ms, sem elasticidade), `-snappy` e `-snappy-duration` (300 ms, elasticidade 0,15) e `-bouncy` e `-bouncy-duration` (400 ms, elasticidade 0,3). A curva toca inteira nessa duração, então o overshoot não muda quando o componente a usa. Troque no tema com `createTheme({ motion: { spring: { snappy: { duration: '240ms', bounce: 0.2 } } } })`; o aviso de duração acima de 300 ms vale para `gentle` e `snappy`, e `bouncy` tem até 400 ms. `spring()` gera a curva a partir de `{ stiffness, damping, mass }` ou `{ duration, bounce }`, e `timedSpring({ duration, bounce })` a faz caber exatamente numa duração em segundos.
4. O seu CSS: cada componente lê variáveis `--enchase-<componente>-duration`, `-ease`, `-distance` e outras.

| Componente | Variáveis (prefixo `--enchase-<componente>`) |
| --- | --- |
| `modal` | `-duration` (padrão: `--enchase-motion-spring-gentle-duration`), `-exit-duration` (metade da entrada), `-distance`, `-dx`, `-dy`, `-scale`, `-ease`, `-fade-ease`, `-exit-ease` |
| `sidebar` | `-duration`, `-exit-duration`, `-distance`, `-dx`, `-dy`, `-ease`, `-label-duration`, `-width`, `-width-collapsed`, `-item-duration`, `-item-scale`, `-indicator-duration`, `-stagger`, `-item-offset` |
| `navbar` | `-duration`, `-exit-duration`, `-distance`, `-dx`, `-dy`, `-ease`, `-stagger`, `-item-offset` |
| `toast` | `-duration` (padrão: `--enchase-motion-spring-snappy-duration`), `-exit-duration`, `-distance`, `-dx`, `-dy`, `-ease`, `-fade-ease`, `-exit-ease`, `-lifetime` |
| `tooltip` | `-duration`, `-scale`, `-ease` |
| `popover` | `-duration` (padrão: `--enchase-motion-spring-snappy-duration`), `-exit-duration`, `-scale`, `-ease`, `-max-width`, `-max-height` |
| `button`, `theme-toggle` | `-duration`, `-scale`, `-distance`, `-ease` |
| `card` | `-duration`, `-distance`, `-ease` |
| `loading` | `-duration`, `-ease` |
| `skeleton` | `-duration`, `-ease` |
| `checkbox` | `-duration`, `-scale`, `-ease` |
| `icon-swap` | `-duration`, `-ease`, `-rotate` |
| `input`, `select`, `link`, `breadcrumbs`, `footer`, `app-bar` | `-duration`, `-ease` |

`-dx` e `-dy` são a direção da entrada (-1, 0 ou 1) e `-distance` o quanto ela anda; em RTL o `-dx` inverte. Com `prefers-reduced-motion: reduce`, o deslocamento e a escala somem e o fade continua; os loops viram pulso de opacidade.

O recolher da `Sidebar` permanente anima a largura (`inline-size`) e é a única animação de layout do pacote, escolhida por custo baixo medido (cerca de 1,5 ms de layout por quadro com 300 parágrafos). A raiz leva `data-state` com `expanded`, `collapsing`, `collapsed` ou `expanding`.

## Customização por CSS

Toda raiz aceita `className` e `style`, e a classe de quem usa vence a da biblioteca. As partes têm `data-slot="<componente>-<parte>"` (`modal-panel`, `sidebar-item`) e os estados aparecem em `data-state`, `data-variant`, `data-size` e afins; estilize por esses atributos, não pelos nomes de classe internos.

```css
[data-slot='modal-panel'][data-state='entering'] {
  transform: translateY(24px);
}
```

O CSS vem em duas variantes. Importe uma delas, nunca as duas:

- `enchase/styles.css`: o layout (tamanho, padding, raio) usa `:where()` e sempre perde para a sua classe. Cores, borda e hover só são vencidos se o seu CSS carregar depois.
- `enchase/styles.layer.css`: o mesmo conteúdo em `@layer enchase`, com a ordem `@layer enchase-theme, enchase-base, enchase;`. Qualquer CSS seu sem camada vence em qualquer ordem. Combine com `<ColorModeProvider cssLayer="enchase-theme">`.
- `enchase/theme.css`: as variáveis do tema padrão como arquivo, para tê-las na primeira resposta do servidor sem esperar JavaScript. Um tema personalizado continua indo em `ColorModeProvider theme`.

## Renderização no servidor

Os componentes renderizam no servidor sem erro de hidratação.

- `ColorModeScript` aplica o `data-theme` antes da primeira pintura (por isso o `suppressHydrationWarning` no `<html>`). Sem JavaScript, o tema escuro do sistema vale por `@media (prefers-color-scheme: dark)`.
- `Layout` e `Navbar` renderizam o modo desktop no servidor e trocam pelo breakpoint com CSS gerado, sem quadro compacto antes da hidratação.
- Portais (`Modal`, `Loading` com overlay, `Tooltip`, `Popover`) abrem só depois da montagem.
- O pacote marca todo o `enchase` como `'use client'`: páginas e layouts de servidor importam os componentes direto, e a fronteira de cliente é o pacote inteiro.

## Testes

```bash
npm test                  # jsdom: comportamento, axe, hidratação e SSR
npm run test:browser          # Chromium real (Playwright)
npm run test:browser:firefox  # Firefox
npm run test:browser:webkit   # WebKit
npm run test:next         # app Next mínimo com o pacote empacotado
npm run lint
npm run build:lib && npm run pack:check && npm run test:consumer
```

`npm run test:browser:repeat [N]` repete a suíte de navegador para caçar testes instáveis.

## Estado do projeto

Versão `0.x`, em desenvolvimento ativo. Ainda não existem: gestos com velocidade (arrastar para dispensar, inércia, rubber-band), presets de design alternativos e props responsivas no `Grid` (`columns={{ base, md }}`).

## Contribuindo

Veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).

## Autor

**Thiago Silva** — [GitHub](https://github.com/thiagopedro99)
