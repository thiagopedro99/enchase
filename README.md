<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo-branco.svg">
    <img src="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo.svg" alt="Enchase" width="360">
  </picture>
</p>

# Enchase

Componentes React acessíveis por contrato: tema com contraste validado, CSS primeiro, movimento próprio, SSR e RTL, e nenhuma dependência de runtime além do React.

> Versão `0.x`: a API ainda pode mudar entre versões menores.

## O que a biblioteca garante (e o que não garante)

**Verificado por testes automatizados:**
- Todo componente passa no axe (vitest-axe) em jsdom, e os fluxos de foco, `inert`, scroll lock, Esc empilhado e restauração de foco rodam em Chromium real.
- Os pares de cor da paleta padrão (claro e escuro) atingem 4,5:1 para texto e 3:1 para bordas de campos e anel de foco. O `createTheme` lança erro em valor de cor inválido, e `validateTheme` lista os pares abaixo do mínimo.
- Alvos interativos têm pelo menos 24 x 24 px, e os componentes respeitam `prefers-reduced-motion` (o deslocamento some, o fade continua).
- Renderização no servidor e hidratação sem erro em 6 variantes de ambiente (largura, tema salvo, sistema escuro e movimento reduzido), mais um app Next 15 mínimo (`npm run test:next`) importando os componentes num Server Component.
- O `className` de quem usa vence o da biblioteca (provado em navegador, na variante em camada em qualquer ordem de carregamento).

**Não garantido:**
- Conformidade total com WCAG: a lib verifica o que os tokens e os testes cobrem, e não substitui auditoria nem teste com leitores de tela (nada foi testado com NVDA, JAWS ou VoiceOver).
- Firefox e WebKit rodam a suíte de navegador, mas com testes pulados: 7 no Firefox e 14 no WebKit (lista central com o motivo de cada um em `src/tests-browser/browserSkips.ts`). O WebKit não move o foco para botões e links ao clicar ou ao usar Tab por padrão, então a devolução de foco e as armadilhas de Tab não são observáveis nele; em Safari de verdade isso exige revisão manual.
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

## Componentes

Cada componente tem uma story no Storybook (`npm run storybook`, em `Componentes/<Nome>`).

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
| `Icon` | `<Icon name="dot"><circle cx="12" cy="12" r="1" /></Icon>` |
| `VisuallyHidden` | `<VisuallyHidden>Texto só para leitores de tela</VisuallyHidden>` |

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
3. O tema: `createTheme({ motion: { duration, easing, distance } })` é validado, e duração acima de 300 ms vira aviso. `validateMotion` lista os avisos sem React. Os tokens `--enchase-motion-spring-gentle`, `-snappy` e `-bouncy` vêm no tema, e `spring()` gera uma curva `linear(...)` a partir de `{ stiffness, damping, mass }` ou `{ duration, bounce }`.
4. O seu CSS: cada componente lê variáveis `--enchase-<componente>-duration`, `-ease`, `-distance` e outras.

| Componente | Variáveis (prefixo `--enchase-<componente>`) |
| --- | --- |
| `modal` | `-duration`, `-exit-duration`, `-distance`, `-dx`, `-dy`, `-scale`, `-ease`, `-fade-ease`, `-exit-ease` |
| `sidebar` | `-duration`, `-exit-duration`, `-distance`, `-dx`, `-dy`, `-ease`, `-label-duration`, `-width`, `-width-collapsed`, `-item-duration`, `-item-scale`, `-indicator-duration`, `-stagger`, `-item-offset` |
| `navbar` | `-duration`, `-exit-duration`, `-distance`, `-dx`, `-dy`, `-ease`, `-stagger`, `-item-offset` |
| `toast` | `-duration`, `-exit-duration`, `-distance`, `-dx`, `-dy`, `-ease`, `-fade-ease`, `-exit-ease`, `-lifetime` |
| `tooltip` | `-duration`, `-scale`, `-ease` |
| `popover` | `-duration`, `-exit-duration`, `-scale`, `-ease`, `-max-width`, `-max-height` |
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

Versão `0.x`, em desenvolvimento ativo. Ainda não existem: gestos com velocidade (arrastar para dispensar, inércia, rubber-band), presets de design alternativos, props responsivas no `Grid` (`columns={{ base, md }}`) e testes em Firefox e WebKit.

## Contribuindo

Veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).

## Autor

**Thiago Silva** — [GitHub](https://github.com/thiagopedro99)
