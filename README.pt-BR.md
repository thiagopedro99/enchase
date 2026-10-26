<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo-branco.svg">
    <img src="https://raw.githubusercontent.com/thiagopedro99/enchase/main/public/enchase-logo.svg" alt="Enchase" width="360">
  </picture>
</p>

<p align="center"><a href="README.md">English</a> · <b>Português</b></p>

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
- Firefox e WebKit rodam a mesma suíte de navegador do Chromium, um arquivo por vez. No Linux ficam pulados 19 testes no Firefox e 19 no WebKit, porque dependem de chamadas só do Chromium (emulação de toque, mouse cru, métricas de layout e transparência reduzida) ou de uma emulação que o navegador não tem (cores forçadas no WebKit, contraste aumentado no Firefox); a lista central com o motivo está em `src/tests-browser/browserSkips.ts`, e os testes que dependem de um recurso que o navegador não tem são pulados só onde ele falta. Os testes de toque rodam no WebKit com o perfil de um iPhone (toque nativo), o mais perto do Safari que dá para automatizar. Os três navegadores passam no CI em Linux (Ubuntu 24.04) e bloqueiam o workflow. A devolução do foco ao gatilho e a armadilha de Tab funcionam também no Safari, onde clicar num botão não o focaliza: a biblioteca guarda o gatilho a partir do último ponteiro ou tecla. Revisão manual em Safari de verdade e com leitores de tela continua necessária.
- Contraste de temas personalizados em `hsl()`, `oklch()` ou `oklab()`: esses formatos não são medidos, e o aviso diz quantos pares ficaram sem checar.
- Gestos com velocidade (arrastar para dispensar, inércia), os estilos Material 3 e Ant Design e uma opção de densidade à parte dos estilos: ainda não existem.

## Instalação

```bash
npm install enchase
```

`react` e `react-dom` (versão 19) são peer dependencies. O pacote é ESM e traz os tipos.

### Navegadores suportados

Chrome e Edge 120, Firefox 129 e Safari 17.5 (iOS 17.5) ou mais novos. A lista está no campo `browserslist` do `package.json`, que também define o alvo do CSS publicado, e é a política de suporte da biblioteca. A única exigência dura é o `inert`, que isola a página atrás de um modal (Chrome 102, Safari 15.5 e Firefox 112). O resto degrada bem em um navegador mais antigo: sem `@starting-style` a animação de entrada some, sem `linear()` a mola cai na curva `ease` e sem `color-mix()` alguns fundos de estado (hover e desabilitado) não aparecem.

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

O `GlobalStyles` é opcional. Ele acrescenta uma folha pequena, em `@layer enchase-base`: um reset de `box-sizing`, margem e padding, a fonte, a cor e o fundo do tema no `<body>`, o tamanho dos títulos, barras de rolagem finas, o anel de foco, a cor da seleção e animações encurtadas sob `prefers-reduced-motion`. Deixe-o de fora se o app já tem a base dele: os componentes se estilizam sozinhos. Nesse caso, dê ao `<body>` as cores do tema (`background-color: var(--enchase-color-background)` e `color: var(--enchase-color-text-primary)`) e ponha `scrollbar-gutter: stable` no `<html>`, para a página não deslocar para o lado quando um modal trava a rolagem.

## Entradas do pacote

| Entrada | Conteúdo |
| --- | --- |
| `enchase` | Componentes, provedores, hooks e tipos. Marcada como `'use client'`. |
| `enchase/theme` | `createTheme`, `defineStyle`, `validateTheme`, `validateMotion`, `contrastRatio`, `spring`, `timedSpring`, `themeCss` e os tokens (veja "O que `enchase/theme` exporta"), com os tipos. Sem React. |
| `enchase/styles/<nome>` | Um estilo visual por entrada: `enchase/styles/shadcn` e `enchase/styles/enchase`. Só dados, sem React, e só entra no bundle de quem a importa. |
| `enchase/locales` | `en` e `ptBR` (`{ locale, dir, messages }`). Só dados. |
| `enchase/icons` | Os 19 ícones que os componentes usam por dentro, um componente por ícone. Funciona em Server Components. |
| `enchase/styles.css` | CSS dos componentes. |
| `enchase/styles.layer.css` | O mesmo CSS dentro de `@layer enchase`. |
| `enchase/theme.css` | Variáveis do tema padrão, claro e escuro, como arquivo estático. |

Quem consome importa só dessas entradas. O código interno (`src/`) não é público.

O pacote traz um arquivo por módulo e declara `sideEffects` só para CSS, então o bundler de quem usa descarta o que não for importado.

## Componentes

Cada componente tem uma story no [Storybook publicado](https://enchase.othiagosilva.com.br/docs/) (ou `npm run storybook`, em `Components/<Name>`).

| Componente | Exemplo mínimo |
| --- | --- |
| `Button` | `<Button variant="primary">Salvar</Button>` |
| `ButtonLink` | `<ButtonLink href="/docs">Documentação</ButtonLink>` |
| `Link` | `<Link href="/sobre">Sobre</Link>` |
| `Input` | `<Input label="E-mail" type="email" error="Informe um e-mail" />` |
| `Textarea` | `<Textarea label="Mensagem" rows={4} helperText="Conte o que aconteceu" />` |
| `NumberInput` | `<NumberInput label="Preço" min={0} step={0.5} formatOptions={{ style: 'currency', currency: 'BRL' }} onValueChange={setPreco} />` |
| `Select` | `<Select label="País" options={[{ value: 'br', label: 'Brasil' }]} />` |
| `Checkbox` | `<Checkbox label="Aceito os termos" />` |
| `Switch` | `<Switch label="Receber notificações" defaultChecked />` |
| `RadioGroup` | `<RadioGroup label="Plano" options={[{ value: 'free', label: 'Grátis' }, { value: 'pro', label: 'Pro' }]} defaultValue="free" />` |
| `Accordion` | `<Accordion items={[{ value: 'envio', title: 'Quanto tempo leva o envio?', content: <p>Até dois dias úteis.</p> }]} />` |
| `Pagination` | `<Pagination pageCount={20} page={page} onPageChange={setPage} />` |
| `Table` | `<Table caption="Pedidos" columns={[{ key: 'id', header: 'Pedido' }, { key: 'total', header: 'Total', align: 'end' }]} rows={pedidos} />` |
| `Tabs` | `<Tabs ariaLabel="Conta" items={[{ value: 'perfil', label: 'Perfil', content: <p>Seus dados</p> }, { value: 'plano', label: 'Plano', content: <p>Sua assinatura</p> }]} />` |
| `Card` | `<Card variant="elevated">Conteúdo</Card>` |
| `CardButton` | `<CardButton onClick={escolher}><span>React</span></CardButton>` |
| `CardLink` | `<CardLink href="/projetos/enchase"><h3>Enchase</h3><p>Biblioteca de componentes</p></CardLink>` |
| `Badge` | `<Badge variant="success">Pago</Badge>` |
| `Tag` | `<Tag onRemove={remover}>React</Tag>`: sem `onRemove` é só um rótulo; com ele ganha um botão de remover, nomeado por `labels.removeTag` e pelo conteúdo da etiqueta |
| `Avatar` | `<Avatar name="Ana Souza" src="/ana.png" />`: sem `src`, ou se a imagem falhar, mostra as iniciais do nome |
| `Alert` | `<Alert variant="warning" title="Atenção" onClose={fechar}>O prazo termina hoje.</Alert>` |
| `Container`, `Flex`, `Grid` | `<Grid as="ul" minColumnWidth="14rem" gap="1rem">...</Grid>` |
| `Modal` | `<Modal isOpen={open} onClose={close} title="Editar">...</Modal>` |
| `ConfirmModal` | `<ConfirmModal isOpen={open} onClose={close} onConfirm={apagar} message="Apagar item?" />` |
| `Tooltip` | `<Tooltip text="Ajuda"><button>?</button></Tooltip>` |
| `Popover` | `<Popover label="Detalhes" content={<p>Conteúdo</p>}><button>Abrir</button></Popover>` |
| `Loading`, `InlineLoading` | `<Loading overlay text="Carregando" />` |
| `Progress` | `<Progress value={40} aria-label="Enviando fotos" />`; sem `value` é indeterminado, e `variant="circular"` desenha um anel |
| `Skeleton` | `<Skeleton variant="text" width="12rem" />` |
| `Divider` | `<Divider />`, ou `<Divider orientation="vertical" />` entre botões de uma linha `Flex` |
| `Breadcrumbs` | `<Breadcrumbs items={[{ id: 'home', label: 'Início', href: '/' }, { id: 'page', label: 'Atual' }]} />` |
| `Sidebar` | `<Sidebar sections={sections} collapsed={collapsed} onToggleCollapsed={toggle} />` |
| `Navbar` | `<Navbar logo="Meu app" sections={sections} />` |
| `Footer` | `<Footer companyName="Acme" notice="Licença MIT." />` |
| `Layout` | `<Layout brand="Acme" navigationSections={sections}>...</Layout>` |
| `ThemeToggle` | `<ThemeToggle />` |
| `Icon` | `<Icon><circle cx="12" cy="12" r="1" /></Icon>` |
| `VisuallyHidden` | `<VisuallyHidden>Texto só para leitores de tela</VisuallyHidden>` |

`enchase/icons` exporta os 19 ícones que os componentes usam por dentro, um componente por ícone: `AlertTriangleIcon`, `CheckIcon`, `ChevronDownIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `ChevronsLeftIcon`, `ChevronsRightIcon`, `CloseIcon`, `ExternalLinkIcon`, `EyeIcon`, `EyeOffIcon`, `InfoIcon`, `LogOutIcon`, `MenuIcon`, `MenuOpenIcon`, `MinusIcon`, `MoonIcon`, `PlusIcon` e `SunIcon`. Só entra nessa lista o que algum componente usa, então ela não é uma biblioteca de ícones: para os demais, use uma (lucide-react, Phosphor, Heroicons) direto, ou o `Icon`, o contêiner SVG de 24x24, com traço de 2 px e a cor do texto, para os seus próprios caminhos. Qualquer nó React serve no conteúdo de um `Button` ou na prop `icon` de um item da `Sidebar`.

```tsx
import { Button, Icon } from 'enchase'
import { ChevronRightIcon, CloseIcon } from 'enchase/icons'
import { Rocket } from 'lucide-react'

<Button variant="ghost" aria-label="Fechar">
  <CloseIcon size={20} />
</Button>

<Button variant="primary">
  Continuar
  <ChevronRightIcon size={18} />
</Button>

<Button variant="outline">
  <Rocket size={18} aria-hidden="true" />
  Começar
</Button>

<Icon title="Adicionar" size={20}>
  <path d="M12 5v14M5 12h14" />
</Icon>
```

Cada ícone aceita `size` (24 por padrão), `title` e os atributos de um `<svg>`. Sem `title`, o ícone é decorativo (`aria-hidden`); com `title`, vira uma imagem com nome acessível, e um botão só de ícone precisa de `aria-label`. Os que apontam para um lado (setas, chevrons, sair, link externo e o menu aberto) espelham em RTL sozinhos; no `Icon` próprio, use `directional`. O `enchase/icons` não leva `'use client'`: pode ser importado em um Server Component. Mudar o desenho de um ícone não é uma quebra; renomear ou remover é.

Notificações usam o hook `useToast` dentro do `ToastProvider`. Cada método (`success`, `error`, `warning`, `info` e `addToast`) devolve o id da notificação, que o `removeToast` aceita para fechá-la, o que ajuda com `duration` 0, que a mantém aberta até alguém fechá-la:

```tsx
import { useToast } from 'enchase'

const { success, info, removeToast } = useToast()

success('Salvo com sucesso')

const id = info('Enviando...', 0)

removeToast(id)
```

A mensagem pode ser texto ou nós (`success(<>Salvo em <strong>Drive</strong></>)`). O terceiro argumento aceita `className`, `style`, `action` (`{ label, onClick }`: um botão que chama `onClick` e fecha a notificação) e `dismissible: false` (sem botão de fechar e sem fechar por clique ou Esc: só fecha ao fim da duração ou com `removeToast`). O `useToast` tem ainda `update(id, patch)`, que muda uma notificação no lugar (`message`, `type`, `duration`, `action`, `dismissible`, `className` ou `style`), e `promise(tarefa, { loading, success, error })`, que mostra a mensagem de carregamento numa notificação que não expira e a transforma no resultado quando a promise termina (`success` e `error` podem ser funções do valor ou do motivo, e a chamada devolve a mesma promise). A região de notificações é só um `role="region"` nomeado, sem `aria-live`: dois anunciadores ocultos, criados junto do `ToastProvider` e antes da primeira notificação, leem o texto de cada uma em voz alta, com `role="status"` para `success`, `info` e `warning` e `role="alert"` para `error`. Como os anunciadores ficam na página desde a montagem, uma busca como `getByRole('alert')` nos seus testes encontra também o anunciador vazio: restrinja a busca com `within` ou procure pelo texto.

### Props comuns

Os componentes repetem o mesmo vocabulário. A lista completa de cada um está no [API.md](API.md), que também vai dentro do pacote (`node_modules/enchase/API.md`).

| Prop | Onde | O que faz |
| --- | --- | --- |
| `variant` | `Button`, `ButtonLink` (`primary`, `secondary`, `outline`, `ghost`), `Card`, `CardButton` e `CardLink` (`default`, `elevated`, `outlined`), `Badge` (`neutral`, `primary`, `success`, `warning`, `error`, `info`), `Alert` (`info`, `success`, `warning`, `error`), `Skeleton` (`text`, `circular`, `rectangular`) | Aparência. O padrão de `Button` e `ButtonLink` é `primary`, o de `Badge`, `neutral`, e o de `Alert`, `info`. |
| `size` | `Button` e `ButtonLink` (`sm`, `md`, `lg`), `Badge` (`sm`, `md`), `Pagination` e `Table` (`sm`, `md`), `Loading` (`xs` a `xl`), `InlineLoading` (`xs`, `sm`, `md`), `Modal` (`sm` a `xl` e `full`) | Tamanho. |
| `label` | `Input`, `Textarea`, `NumberInput`, `Select`, `Checkbox`, `Switch`, `RadioGroup` | Rótulo visível, ligado ao controle. No `RadioGroup`, é o título do grupo. |
| `error` | `Input`, `Textarea`, `NumberInput`, `Select`, `RadioGroup` | Mensagem de erro: marca o campo com `aria-invalid`, aparece com `role="alert"` e substitui o `helperText`. |
| `helperText` | `Input`, `Textarea`, `NumberInput`, `Select`, `RadioGroup` | Texto de apoio sob o campo, ligado ao controle por `aria-describedby`. |
| `fullWidth` | `Button`, `ButtonLink`, `Input`, `Textarea`, `NumberInput`, `Select` | Ocupa toda a largura disponível. |
| `labelPlacement` | `Input`, `Textarea`, `NumberInput`, `Select` | Onde fica o rótulo: `floating` (dentro do campo, sobe ao focar) ou `stacked` (acima do controle). Sem a prop, vale o `style` do tema: `floating` no `enchase` e `stacked` no `shadcn`. |
| `externalIcon` | `ButtonLink` | Com `target="_blank"`, mostra o ícone de link externo (padrão `true`). `false` tira só o ícone e mantém o texto "abre em nova aba" para leitores de tela; em um link só de ícone com `aria-label`, ponha o aviso no próprio rótulo. |
| `as` | `Container`, `Flex`, `Grid`, `Card` | Tag HTML da raiz, só entre as de estrutura: `div` (padrão), `section`, `article`, `aside`, `nav`, `header`, `footer`, `main`, `ul`, `ol` e `li`. Com `ul` e `ol` a raiz leva `role="list"`. Veja [Listas e cartões clicáveis](#listas-e-cartões-clicáveis). |
| `animation` | Componentes com movimento | `false` desliga o movimento do componente; `{ recipe, tuning }` troca a receita. Veja [Movimento](#movimento). |
| `className`, `style` | Toda raiz | A classe de quem usa vence a da biblioteca. Nos campos, vão para o controle nativo, e `wrapperClassName` e `wrapperStyle` para o contêiner. No `RadioGroup`, vão para o `<fieldset>`, que é a raiz. |
| `isOpen` e `onClose` | `Modal`, `ConfirmModal` | Sempre controlados. |
| `value`, `defaultValue` e `onValueChange` | `RadioGroup`, `Tabs`, `Accordion` | Valor da opção marcada, da aba escolhida ou, no `Accordion`, a lista dos itens abertos (`string[]`), controlado ou não. `onValueChange` recebe o valor que o usuário acabou de escolher. |
| `value`, `defaultValue` e `onValueChange` (numérico) | `NumberInput` | O número do campo, ou `null` com o campo vazio, controlado ou não. `onValueChange` recebe o número já confirmado (ao sair do campo, com Enter, com as setas e com os botões), limitado a `min` e `max` e arredondado às casas do formato, nunca a cada tecla. |
| `page`, `defaultPage` e `onPageChange` | `Pagination` | Página atual (a primeira é 1), controlada ou não. `onPageChange` recebe o número da página que o usuário escolheu. |
| `onClose` | `Alert` | Mostra o botão de fechar. O `Alert` não some sozinho: quem usa o remove ao receber o evento. |
| `open`, `defaultOpen` e `onOpenChange` | `Popover` e o drawer do `Layout` | Controlados ou não. A `Sidebar` modal usa `open` e `onClose`. |

Componentes que estendem um elemento HTML (`Button`, `Input`, `Card`, `Footer`, `Layout` e outros) repassam os demais atributos para ele, como `id`, `aria-*`, `data-*` e handlers.

### Listas e cartões clicáveis

`Container`, `Flex`, `Grid` e `Card` aceitam `as` com uma tag de estrutura: `div` (padrão), `section`, `article`, `aside`, `nav`, `header`, `footer`, `main`, `ul`, `ol` ou `li`. Com `ul` ou `ol`, a raiz perde marcadores, margem e recuo e ganha `role="list"`, que mantém a semântica de lista no Safari com o VoiceOver quando o marcador some (o `role` que você passar vence). Link e botão não entram em `as`: para isso há `CardLink` e `CardButton`.

```tsx
import { Badge, CardLink, Flex, Grid } from 'enchase'

<Grid as="ul" columns={{ xs: 1, md: 3 }} aria-label="Projetos">
  {projects.map((project) => (
    <li key={project.href}>
      <CardLink href={project.href} variant="outlined">
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </CardLink>
    </li>
  ))}
</Grid>

<Flex as="ul" wrap gap="0.5rem" aria-label="Tecnologias">
  {stack.map((name) => (
    <li key={name}>
      <Badge>{name}</Badge>
    </li>
  ))}
</Flex>
```

Uma lista de etiquetas não precisa de componente próprio: é um `Flex as="ul"` com `wrap` e um `Badge` em cada `li`. Um `Card as="li"` direto num `Grid as="ul"` estica até a altura da linha sem `block-size: 100%`, e um `CardLink` ou `CardButton` dentro do `li` já ocupa a altura do item.

`CardLink` e `CardButton` são o cartão inteiro clicável, com o elemento certo: um `<a href>`, que segue as mesmas regras de `href` do `Link` (rota do app pelo `navigate` do `UIProvider`, e `native`, `target` e `download` deixam o clique com o navegador), e um `<button type="button">`, que não envia um formulário sozinho. Os dois têm a superfície do `Card` (`variant`, `padding` e `animation`, e os mesmos ganchos `--enchase-card-*`, então um estilo que redesenha o `Card` redesenha os dois), o anel de foco, as camadas de hover e de pressionado dos tokens `--enchase-state-*` e, no botão, `disabled`, que usa `--enchase-card-opacity-disabled` (padrão: o token `--enchase-state-disabled-content`). Com `target="_blank"`, o `CardLink` põe `rel="noopener noreferrer"` e o texto "abre em nova aba" no nome acessível, sem ícone: o desenho do cartão é seu.

Duas regras do HTML valem para o que fica dentro: tudo entra no nome acessível (prefira um título curto e um apoio curto) e não pode haver outro link, botão ou campo. Um `<button>` só aceita elementos de texto (`span`, `strong`, `Badge`, imagens), enquanto um `<a>` aceita também títulos e parágrafos.

O `title` de um item do `Accordion` e o `label` de uma aba do `Tabs` também aceitam nós, não só texto, como um logo e um selo ao lado do nome. A mesma regra vale: eles ficam dentro de um `<button>`, então só cabem elementos de texto, e o texto de tudo o que está dentro é o nome do botão e do painel (um logo decorativo leva `alt=""` ou `aria-hidden`).

```tsx
<Accordion
  items={[
    {
      value: 'acme',
      title: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <img src="/acme.svg" alt="" width={24} height={24} />
          <span>Acme Ltda</span>
          <Badge variant="success">Atual</Badge>
        </span>
      ),
      content: <p>Desde 2023.</p>
    }
  ]}
/>
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
- `translucent` deixa a barra do topo semitransparente, a `AppBar` (navegação `sidebar`) ou a `Navbar` (navegação `navbar`); veja a `Navbar` abaixo. Nas duas navegações a barra fica fixa no topo enquanto a página rola.

Cada item de menu pode ser uma rota (`href: '/caminho'`), uma âncora (`href: '#id'`) ou uma ação (`onClick`); `native: true` faz o link sair do app.

Para marcar a âncora da seção que está na tela, use `useScrollSpy(ids, topOffset = 96)` e passe o resultado em `activeSectionId` (`Navbar` e `Sidebar`) ou `activePageSectionId` (`Layout`):

```tsx
const sectionIds = ['recursos', 'demos', 'contato']

const active = useScrollSpy(sectionIds)

<Navbar logo="Acme" sections={sections} activeSectionId={active} />
```

O hook devolve o `id` da seção que está na faixa de leitura (de `topOffset` px do topo até 45% da altura da tela) ou `undefined` enquanto nenhuma chegou, por exemplo com um hero acima da primeira seção: nenhum item fica marcado. Depois da última seção, ela continua ativa. O hook acompanha as seções que montam depois, remontam ou saem da página, e só o conteúdo do array de `ids` conta, não a identidade dele: pode criá-lo a cada renderização.

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

`translucent` deixa a barra da `Navbar` semitransparente, com desfoque do conteúdo que rola por baixo (`backdrop-filter`). O fundo e o desfoque saem de duas variáveis, que você muda no seu CSS ou no `style` da barra: `--enchase-navbar-background` (padrão: a cor `--enchase-navbar-background-solid`, a `surfaceContainer` do tema, a `--enchase-navbar-background-alpha`, 0,8) e `--enchase-navbar-blur` (padrão `12px`). Sem `translucent`, essas variáveis não fazem nada e a barra continua opaca, com o fundo de `--enchase-navbar-background-solid`, que também é o fundo de volta quando o sistema pede menos transparência. No `Layout`, a prop `translucent` vale para a barra do topo da navegação escolhida: com `sidebar`, a `AppBar` usa `--enchase-app-bar-background` (a `--enchase-app-bar-background-solid`, a `surface`, a `--enchase-app-bar-background-alpha`) e `--enchase-app-bar-blur`, com as mesmas regras de volta ao fundo opaco.

```tsx
<Navbar logo="Acme" sections={sections} translucent />
```

```css
[data-slot='navbar'] {
  --enchase-navbar-background: color-mix(in srgb, var(--enchase-color-primary-container) 60%, transparent);
  --enchase-navbar-blur: 20px;
}
```

A barra volta ao fundo opaco do tema, mesmo com uma cor sua em `--enchase-navbar-background`, quando o sistema pede menos transparência (`prefers-reduced-transparency`) ou mais contraste (`prefers-contrast: more`), em cores forçadas (o alto contraste do Windows) e em navegadores sem `backdrop-filter`. Com o tema padrão, o texto da marca e do menu mantém 4,5:1 mesmo sobre preto ou branco puro (3:1 na cor de destaque da marca ao passar o mouse), e um teste de navegador mede isso nos dois modos de cor. Com outra cor de fundo ou um tema próprio, confira o contraste sobre o conteúdo que passa por trás da barra.

## Navegação sem roteador

Os componentes não dependem de roteador. `Link`, `ButtonLink`, os itens da `Sidebar` e da `Navbar`, os `Breadcrumbs` e os links do `Footer` são `<a href>` de verdade, e um clique simples em uma rota do app chama o `navigate` do `UIProvider`. Sem `navigate`, os links recarregam a página.

```tsx
<UIProvider navigate={(href) => router.push(href)} currentHref={pathname}>
  <App />
</UIProvider>
```

Como cada `href` é tratado:

| `href` | Quem trata o clique |
| --- | --- |
| `/rota`, `/rota?a=1` | `navigate`, quando o provider tem um |
| `/rota#id`, em outra página | `navigate`, com o hash no `href` |
| `/rota#id`, na página atual | O navegador rola até o elemento; o `navigate` não é chamado |
| `#id` | O navegador |
| `https://...`, `//host`, `mailto:`, `tel:` e caminhos relativos (`sobre`, `?a=1`) | O navegador |
| Qualquer `href` com `native`, `target` diferente de `_self` ou `download` | O navegador |
| Ctrl, Cmd, Shift, Alt ou botão do meio | O navegador |

A página atual é o caminho de `currentHref` ou, quando o provider não tem `currentHref`, o `window.location.pathname` no momento do clique. Por isso `/#recursos` na home e `/sobre#equipe` em `/sobre` rolam a página sem `native` e sem passar pelo roteador.

`currentHref` também marca o item ativo do menu e deriva os `Breadcrumbs` do `Layout`:

- Uma rota (`/docs`) recebe `aria-current="page"` quando `currentHref` é essa rota ou está dentro dela (`/docs/api`); `/` marca só a home.
- Uma âncora (`#recursos`, ou `/#recursos` estando em `/`) recebe `aria-current="location"` quando é o `activeSectionId`, nunca `page`. Use `useScrollSpy` para ele.
- Itens `native`, externos e âncoras da página não entram na trilha dos `Breadcrumbs`, e os `native` nunca são marcados.

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

- O visual padrão segue a linguagem do Material Design 3 (paleta tonal em índigo, cantos arredondados, camadas de estado). O `style` troca o visual inteiro de uma vez (veja "Estilo visual", abaixo), a forma dos cantos tem três presets (`shape`) e paleta, fonte e movimento são seções à parte do `createTheme`.
- `useColorMode()` devolve `{ mode, resolvedMode, setMode, toggleMode }`. O modo (`light`, `dark` ou `system`, o padrão) fica no `localStorage`.

### O que `enchase/theme` exporta

| Nome | O que é |
| --- | --- |
| `createTheme(input)` | Valida a entrada (`style`, `brand`, `fonts`, `motion`, `shape`, `radius`, `light` e `dark`) e devolve o conjunto `{ base, light, dark, hooks }`. |
| `defineStyle(style)` | Confere um estilo visual e o devolve congelado. |
| `validateTheme(theme)` | Lista os pares de cor abaixo do contraste mínimo. |
| `validateMotion(base)` | Lista as durações de movimento acima do recomendado. |
| `contrastRatio(foreground, background)` | A razão de contraste do WCAG entre duas cores. |
| `spring(input)`, `timedSpring({ duration, bounce })` | A curva `linear()` de uma mola e a duração em milissegundos, por física (`stiffness`, `damping`) ou por duração e `bounce`. |
| `themeCss(theme, { layer })` | O CSS das variáveis de um tema, para o `ThemeVariables`. Com `layer`, dentro dessa camada. |
| `defaultThemeCss` | O CSS do tema padrão, o mesmo de `enchase/theme.css`. |
| `defaultTheme` | O conjunto do tema padrão: `{ base: baseTokens, light: lightTheme, dark: darkTheme }`. |
| `baseTokens` | Os tokens que não mudam com o modo: fontes, espaçamento, cantos, foco, borda, estado, movimento, breakpoints e `zIndex`. |
| `lightTheme`, `darkTheme` | As cores e as sombras de cada modo. |
| `breakpoints` | Os breakpoints em pixels, de `xs` a `xxl`. |
| `colorRoles`, `themeModes` | Os papéis de cor (`primary`, `secondary`, `error`, `success`, `warning`, `info`) e os modos (`light`, `dark`). |

Os tipos dessas funções também saem de `enchase/theme` (`ThemeInput`, `ThemeSet`, `ThemeStyle` e outros). O que não está aqui é interno e pode mudar sem aviso.

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
- Para qualquer cor de marca o `validateTheme` não aponta nenhum par abaixo do contraste mínimo. O teste da biblioteca percorre centenas de cores, de todos os matizes, do muito claro ao muito escuro e do cinza ao vibrante, e exige zero pares reprovados. A página System/Brand do Storybook deixa você experimentar a sua cor.

### Forma dos cantos

O `createTheme` troca os raios com a seção `shape` (um preset) e com `radius` (um ou mais tokens, por cima do preset):

```tsx
<ColorModeProvider theme={{ shape: 'soft' }}>
  <App />
</ColorModeProvider>

<ColorModeProvider theme={{ shape: 'square', radius: { button: '0.5rem' } }}>
  <App />
</ColorModeProvider>
```

| Preset | Botões, itens de menu e badges | Campos | Cartões | Diálogos |
| --- | --- | --- | --- | --- |
| `pill` (padrão) | pílula | `0.5rem` | `1.5rem` | `1.75rem` |
| `soft` | `0.75rem` | `0.75rem` | `1rem` | `1.25rem` |
| `square` | `0.25rem` | `0.25rem` | `0.375rem` | `0.5rem` |

- Os tokens de `radius` são `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `control` (campos e a paginação), `button` (botões, botões de ícone, itens de menu e de navegação, links de trilha e badges) e `full`. Cada um vira `--enchase-radius-<nome>`. O `full` segue sendo a pílula de verdade (a chave, a bolinha do radio e o avatar), em todos os presets.
- Um valor é `0` ou um número com `rem`, `em`, `px` ou `%`. Valor inválido, token desconhecido ou preset que não existe lançam erro dizendo qual falhou.
- Sem `shape` e sem `radius`, nada muda: o `pill` é o visual de sempre, e `--enchase-radius-button` aponta para `--enchase-radius-full`, então quem já sobrescrevia `--enchase-radius-full` no `:root` continua vendo os botões acompanharem. Uma sobrescrita de `--enchase-radius-full` só em um trecho da página não chega mais aos botões desse trecho, porque o alias já foi resolvido no `:root`: ali, sobrescreva `--enchase-radius-button`.
- O `Button` ainda lê `--enchase-button-radius` antes do tema, para mudar um botão só.
- O `shape` muda só os raios: o contraste das cores e o movimento ficam como estão. A página System/Shape do Storybook mostra os presets no kit inteiro.

### Estilo visual

`style` troca o visual do kit inteiro de uma vez: a paleta, os raios, as alturas, os pesos, as bordas, as sombras e o lugar do rótulo dos campos. Sem `style`, o visual é o de sempre (o estilo `enchase`, que não muda nada). O `shadcn` aproxima o kit do shadcn/ui: paleta neutra, bordas no lugar de sombras, botões e campos de 36px com texto de 14px, cantos de `0.5rem` e o rótulo acima do campo.

```tsx
import { shadcn } from 'enchase/styles/shadcn'

<ColorModeProvider theme={{ style: shadcn }}>
  <App />
</ColorModeProvider>

<ColorModeProvider theme={{ style: shadcn, brand: '#0B6BCB', shape: 'soft' }}>
  <App />
</ColorModeProvider>
```

- Cada estilo tem a própria entrada, `enchase/styles/<nome>` (`enchase/styles/shadcn` e `enchase/styles/enchase`), e só entra no bundle de quem a importa: sem `style`, o `ColorModeProvider` e o `createTheme` não carregam nenhum dado de estilo, e quem importa o `shadcn` paga por ele (cerca de 2,5 kB em gzip) e por nenhum outro, nem mesmo em um bundler que não remove código morto. Também dá para carregar um estilo sob demanda, com `import('enchase/styles/shadcn')`. Não existe `enchase/styles` sozinho, de propósito: o CSS é `enchase/styles.css`, e esquecer o `.css` dá erro em vez de um import que não faz nada. Um estilo é só dado, então vale em Server Components: importe-o no layout de servidor e passe-o à prop `theme` do `ColorModeProvider`.
- O `style` é um objeto, não um nome: `style: 'shadcn'` lança erro dizendo para importar o estilo de `enchase/styles/shadcn`.
- O estilo é "inspirado em", não uma cópia: o contrato de acessibilidade da biblioteca vale mais que a fidelidade. Onde o original fica abaixo dele, o estilo ajusta. A borda dos campos e a trilha da chave desligada são `#808080` (3:1 contra o fundo; a do original tem 1,26:1). O anel de foco é sólido, de 2px, na cor `primary` e com 2px de folga (o original usa um anel translúcido, que não chega a 3:1). O texto secundário sobre as superfícies cinza e o vermelho de erro usado como texto têm 4,5:1. Em cores forçadas (o modo de alto contraste do Windows), a borda do campo em foco engrossa para 2px, porque a sombra do anel some. O desenho do checkbox e do radio é de 16px, mas a área de toque continua com 24px ou mais.
- Além das cores e dos raios, o estilo muda: botões de 32, 36 e 40px, campos de 36px e texto de 14px nos controles, uma sombra pequena nos botões e nos campos, alertas neutros com o ícone e o título coloridos, badges tingidos (sólidos só o `primary` e o de erro), abas só com o sublinhado, acordeão sem contorno e com linhas entre os itens, diálogo, popover e notificação com borda, e o rótulo acima do controle.
- A precedência, do mais fraco ao mais forte, é: o padrão da biblioteca, o `style` e o que você passa (`shape`, `radius`, `fonts`, `motion`, `brand`, `light` e `dark`). `shape: 'pill'` com o `shadcn` devolve os botões em pílula, e `radius: { button: '1rem' }` muda só o raio dos botões. Com `brand`, só o acento muda (o `primary` e o que deriva dele): os neutros continuam os do estilo, e o `validateTheme` confere o contraste do resultado como em qualquer tema.
- Por baixo, um estilo é um conjunto de tokens e de ganchos de CSS (veja "Customização por CSS"). O `createTheme` os junta ao tema e o `ColorModeProvider` os escreve no `:root` e nos blocos de cada modo, então o CSS da sua aplicação vence o estilo: `:root { --enchase-button-font-size-md: 16px; }` muda só esse valor. O `ThemeSet` que o `createTheme` devolve ganha `hooks` e `defaults`, que são opcionais, então um `ThemeSet` montado à mão continua valendo.
- A página System/Styles do Storybook mostra os estilos no kit inteiro, e a barra de ferramentas do Storybook troca o estilo de todas as stories.

O lugar do rótulo dos campos é a prop `labelPlacement` do `Input`, do `Textarea`, do `NumberInput` e do `Select`: `floating` (o padrão do estilo `enchase`) deixa o rótulo dentro do campo, e ele sobe para o contorno ao focar ou preencher; `stacked` (o padrão do `shadcn`) põe o rótulo acima do controle, sem entalhe no contorno, com a ajuda e o erro abaixo. A prop vence o estilo, nos dois sentidos, e sem `ColorModeProvider` o rótulo é flutuante. A ordem no HTML é a visual (o `<label>` vem antes do controle), igual no servidor e no cliente.

### Criar um estilo

Um estilo é um objeto de dados. O `defineStyle`, de `enchase/theme`, confere o objeto, diz qual parte está errada e o devolve congelado. O estilo só diz o que muda em relação ao padrão; o resto fica como está.

```tsx
import { defineStyle } from 'enchase/theme'

export const compact = defineStyle({
  base: { control: { height: { sm: '1.75rem', md: '2rem', lg: '2.25rem' } }, hit: { size: '1.5rem' } },
  fonts: { weights: { medium: 500 } },
  radius: { button: '0.375rem', control: '0.375rem' },
  hooks: { '--enchase-button-font-size-md': 'var(--enchase-font-size-sm)' },
  colorHooks: { '--enchase-button-border-color-outline': 'var(--enchase-color-border)' },
  light: { colors: { background: '#FAFAFA' }, shadows: { sm: '0 1px 2px rgb(0 0 0 / 0.08)' } },
  dark: { colors: { background: '#0A0A0A' } },
  brand: ['primary', 'onPrimary'],
  defaults: { labelPlacement: 'stacked' }
})

<ColorModeProvider theme={{ style: compact }}>
  <App />
</ColorModeProvider>
```

| Seção | O que vai nela |
| --- | --- |
| `base` | Os tokens `control`, `focus`, `border`, `halo`, `hit` e `state` que mudam, no mesmo formato do tema padrão. |
| `fonts` | `sizes`, `weights`, `lineHeights` e `letterSpacings`. As famílias (`primary` e `mono`) são de quem usa o estilo, pela seção `fonts` do `createTheme`. |
| `radius` | Os raios (`xs` a `full`, menos `none`), como na seção `radius` do `createTheme`. |
| `hooks` | Ganchos de CSS (`--enchase-<data-slot>-<propriedade>`) cujo valor não cita uma cor nem uma sombra do tema. Vão para o `:root`. |
| `colorHooks` | Ganchos cujo valor cita uma cor ou uma sombra do tema (`var(--enchase-color-…)`, `var(--enchase-shadow-…)`). Vão para o bloco de cada modo, onde essas variáveis existem. |
| `light` e `dark` | O que vale só em um modo: `colors` (qualquer papel de cor), `shadows` (menos `none`) e `hooks`. |
| `brand` | Quais papéis da paleta vêm da cor da marca quando quem usa passa `brand`. Sem a lista, a marca tinge a paleta inteira. |
| `defaults` | Hoje só `labelPlacement`. |

- O `defineStyle` lança erro, com o caminho da parte que falhou, para uma seção ou um token que não existe, para um valor de CSS inseguro (com `;`, `{`, `}`, `<`, `>`, `\`, um comentário, `url()`, `@import`, parêntese ou aspas sem fechar, ou com mais de 400 caracteres), para um nome de gancho fora do formato `--enchase-<palavras-em-minúsculas-com-hífen>`, para um "gancho" que na verdade é um token do tema (`--enchase-space-md`) e para um gancho da raiz que cita uma cor ou uma sombra do tema (esse vai em `colorHooks`).
- O `createTheme` confere de novo todo estilo que não saiu do `defineStyle`, porque um estilo pode chegar de um JSON ou atravessar a fronteira de um Server Component sem a marca de que já foi conferido. O que saiu do `defineStyle` é congelado e não é conferido outra vez.
- O contraste das cores depende da paleta final e não é conferido pelo `defineStyle`: rode `validateTheme(createTheme({ style: compact }))`, também com `brand`, no teste do seu estilo.
- O estilo é a base: o que quem usa passa ao `createTheme` (`shape`, `radius`, `fonts`, `motion`, `brand`, `light` e `dark`) vence o estilo, e o CSS da aplicação vence os dois.
- Para partir de um estilo pronto, espalhe-o: `defineStyle({ ...shadcn, defaults: { labelPlacement: 'floating' } })`.

## Idiomas e RTL

Os textos de acessibilidade vêm do `locale` do `UIProvider`. O padrão é inglês; `ptBR` acompanha o pacote, e `labels` sobrescreve textos avulsos:

```tsx
import { ptBR } from 'enchase/locales'

<UIProvider locale={ptBR} labels={{ closeModal: 'Fechar' }}>
  <App />
</UIProvider>
```

Um `locale` tem a forma `{ locale, dir, messages }`; use `dir: 'rtl'` para línguas da direita para a esquerda. O CSS usa propriedades lógicas, e o que precisa espelhar (os ícones direcionais, a bolinha da chave, o entalhe dos rótulos flutuantes, a barra de progresso do toast) segue o atributo `dir` do documento ou de um ancestral, qualquer que seja a `lang`, por seletores de atributo que nenhuma etapa de build reescreve. Pôr `dir="rtl"` no `<html>` é com o app, e uma ilha `dir="ltr"` dentro de uma página RTL não é desespelhada. As chaves `pagination`, `previousPage`, `nextPage` (os textos da `Pagination`), `increaseValue` e `decreaseValue` (os botões do `NumberInput`) são opcionais num `locale` próprio: sem elas, valem as do inglês. O `locale` também decide como o `NumberInput` escreve e lê os números (`1.234,5` em `pt-BR`, `1,234.5` em `en`); `useUIConfig().locale` devolve o código do idioma. O `dir` do `<html>` continua sendo do app.

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
- `Footer`, `Modal`, `toast` e `Breadcrumbs` se ajustam pela largura disponível, sem `@media`, e o `Grid` também enquanto `columns` for um número (o máximo de colunas, que ele reduz sozinho quando não cabem). O `Container` limita a largura pelo breakpoint escolhido em `maxWidth`.
- `Grid` aceita `columns` em objeto, com o número de colunas a partir de cada breakpoint, e `centerLastRow` (veja abaixo).

### Colunas do Grid por breakpoint

```tsx
<Grid columns={{ xs: 1, md: 2, lg: 4 }} gap="1rem" centerLastRow>
  {cards}
</Grid>
```

- É mobile first: o valor de um breakpoint vale dele para cima, e um breakpoint sem valor repete o menor que veio antes. Sem `xs`, a grade começa com uma coluna. Os números viram inteiros de pelo menos 1.
- Os breakpoints são os do `UIProvider` (`breakpoints` personalizado vale aqui também). As regras são CSS puro, geradas pelo `UIProvider`, então a coluna certa já vem no HTML do servidor, sem JavaScript e sem quadro errado antes da hidratação. Sem `UIProvider`, valem os breakpoints padrão.
- `centerLastRow` centraliza a última linha incompleta (os dois últimos cards de cinco em três colunas, por exemplo). Para isso o `Grid` vira uma linha flexível que quebra: cada célula tem a largura de uma coluna, as linhas cheias continuam alinhadas nas colunas e as células de uma linha têm a mesma altura. Vale com `columns` (número ou objeto); com `minColumnWidth` ele é ignorado, porque o número de colunas então depende da largura.
- O número `columns` e o `minColumnWidth` continuam como antes: o `Grid` reduz as colunas sozinho, sem `@media`.

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
| `card` (e `CardButton`, `CardLink`) | `-duration`, `-distance`, `-ease` |
| `loading` | `-duration`, `-ease` |
| `skeleton` | `-duration`, `-ease` |
| `checkbox`, `radio-group` | `-duration`, `-scale`, `-ease` |
| `accordion` | `-duration`, `-distance`, `-ease` |
| `icon-swap` | `-duration`, `-ease`, `-rotate` |
| `input`, `textarea`, `number-input`, `select`, `switch`, `tabs`, `pagination`, `link`, `breadcrumbs`, `footer`, `app-bar`, `alert` | `-duration`, `-ease` |

`-dx` e `-dy` são a direção da entrada (-1, 0 ou 1) e `-distance` o quanto ela anda; em RTL o `-dx` inverte. Com `prefers-reduced-motion: reduce`, o deslocamento e a escala somem e o fade continua; os loops viram pulso de opacidade.

O recolher da `Sidebar` permanente anima a largura (`inline-size`) e é a única animação de layout do pacote, escolhida por custo baixo medido (cerca de 1,5 ms de layout por quadro com 300 parágrafos). A raiz leva `data-state` com `expanded`, `collapsing`, `collapsed` ou `expanding`.

## Customização por CSS

Toda raiz aceita `className` e `style`, e a classe de quem usa vence a da biblioteca. As partes têm `data-slot="<componente>-<parte>"` (`modal-panel`, `sidebar-item`) e os estados aparecem em `data-state`, `data-variant`, `data-size` e afins; estilize por esses atributos, não pelos nomes de classe internos.

```css
[data-slot='modal-panel'][data-state='entering'] {
  transform: translateY(24px);
}
```

O anel de foco, a largura das bordas, as camadas de estado, o halo dos controles de seleção, a área de toque, a entrelinha e o espaçamento entre letras saem de variáveis do tema (experimentais até a versão 1.0), que você muda no `:root` ou em qualquer trecho da página. Os componentes só leem essas variáveis:

| Variável | Padrão | O que controla |
| --- | --- | --- |
| `--enchase-focus-width` | `2px` | espessura do anel de foco |
| `--enchase-focus-offset` | `2px` | distância do anel ao elemento |
| `--enchase-focus-offset-inset` | `-2px` | distância do anel dentro de um contêiner (abas, acordeão, tabela) |
| `--enchase-focus-offset-selector` | `3px` | distância do anel no checkbox, no radio e na chave |
| `--enchase-focus-color` | a cor `primary` | cor do anel; sem valor, o anel segue o `primary` do trecho da página |
| `--enchase-border-width` | `1px` | bordas e divisores |
| `--enchase-border-width-strong` | `2px` | bordas do checkbox, do radio e da chave, e do campo em foco |
| `--enchase-state-hover` | `0.08` | força da camada de hover de botões, abas, acordeão, paginação, itens de menu, opções e links |
| `--enchase-state-pressed` | `0.1` | força da camada ao pressionar |
| `--enchase-state-row-hover` | `0.06` | força do hover de uma linha da tabela |
| `--enchase-state-disabled-container` | `0.12` | contorno de um campo e fundo de um botão desabilitados |
| `--enchase-state-disabled-content` | `0.38` | borda e marca do checkbox, do radio e da chave desabilitados |
| `--enchase-halo-size` | `10px` | halo do checkbox e do radio ao passar o mouse e ao pressionar |
| `--enchase-halo-size-switch` | `0.5rem` | halo da bolinha da chave |
| `--enchase-hit-size` | `40px` | área de toque dos controles de formulário (linha do checkbox, do radio e da chave, botões do campo numérico e do campo de senha, links do menu da navbar, fechar do modal e do toast) |
| `--enchase-hit-size-lg` | `44px` | área de toque dos botões que abrem, fecham ou recolhem uma navegação (menu, tema, recolher a barra lateral, sair) |
| `--enchase-line-height-none`, `-tight`, `-snug`, `-normal`, `-relaxed` | `1`, `1.2`, `1.4`, `1.5`, `1.6` | entrelinha dos componentes: `none` nos selos e na paginação, `tight` nos botões e nas abas, `snug` no acordeão, `normal` nos avisos e nas áreas de texto, `relaxed` no corpo do diálogo |
| `--enchase-letter-spacing-tight`, `-control` | `-0.01em`, `0.01em` | espaçamento entre letras: `tight` na marca e no logo da navbar, `control` nos botões |

As camadas de estado são a fração (de 0 a 1) da cor do elemento que se mistura com o fundo: `--enchase-state-hover: 0.16` dobra o hover. Um halo de `0` desliga o halo. A área de toque nunca fica abaixo de 24px (WCAG 2.5.8), mesmo que a variável peça menos, e o espaço que o campo de senha e o campo numérico reservam para os botões de dentro acompanha a variável. O foco precisa continuar visível (contraste de pelo menos 3:1 com o fundo). O `validateTheme` confere o `primary`, mas não uma `--enchase-focus-color` sua.

Cada componente também lê ganchos próprios, `--enchase-<data-slot>-<propriedade>`, opcionais e experimentais até a versão 1.0. O nome é o `data-slot` da parte mais a propriedade (e o tamanho ou a variante, quando há mais de um): `data-slot="switch-thumb"` e `size` dão `--enchase-switch-thumb-size`. O tema não os declara, a não ser os que o `style` escolhido muda. Sem valor, o componente usa o padrão, e um padrão que aponta para um token do tema (como `--enchase-radius-md`) continua seguindo uma sobrescrita desse token. A lista completa, com o padrão e a propriedade de cada um, está em [API.md](API.md#css-hooks) e é gerada do CSS dos componentes, então não sai de sincronia.

```css
:root {
  --enchase-button-padding-inline-md: 1rem;
  --enchase-button-font-weight: 500;
  --enchase-checkbox-box-size: 16px;
  --enchase-switch-track-width: 2rem;
  --enchase-switch-thumb-size: 1rem;
  --enchase-switch-thumb-scale-off: 1;
  --enchase-input-padding-inline: 0.75rem;
}
```

O que depende de uma medida acompanha sozinho: o traço do checkbox, o ponto do radio e o curso da bolinha da chave seguem o tamanho de cada um; o rótulo flutuante dos campos sobe metade de `--enchase-input-height` e segue o padding do texto; e o espaço que os campos de senha e numérico reservam para os botões de dentro segue `--enchase-hit-size`. Os quatro campos (texto, número, seleção e área de texto) dividem os ganchos `--enchase-input-*`, e o canto do campo e o do contorno dele saem do mesmo gancho. A tipografia dos rótulos flutuantes fica fixa, porque o entalhe do contorno depende dela.

Os ganchos de cor (`--enchase-alert-background-info`, `--enchase-badge-color-success`, `--enchase-table-header-background`) caem no papel de cor do tema, então seguem o modo claro e o escuro sozinhos. Para um valor que muda por modo, declare o gancho dentro do seletor do modo, junto das cores (`:root, [data-theme='light'] { ... }` e `[data-theme='dark'] { ... }`): um gancho declarado só no `:root` e escrito como `var(--enchase-color-surface)` acompanha o modo do documento, mas numa ilha `data-theme` de outro modo (um `div` aninhado) continua com as cores do documento, porque o alias é resolvido onde é declarado.

O espaço, o tamanho, a cor e a sombra das barras e da navegação (`Navbar`, a barra do topo do `Layout`, `Sidebar`, `Breadcrumbs`, `Pagination`, `Footer`, a marca e o usuário da sidebar) saem de ganchos do mesmo jeito, como `--enchase-navbar-bar-height`, `--enchase-sidebar-item-control-height` ou `--enchase-pagination-control-color-current`. O indicador deslizante da `Sidebar` pinta com `--enchase-sidebar-indicator-background`, que segue a cor do item atual (`--enchase-sidebar-item-control-background-current`), e a largura dele acompanha `--enchase-sidebar-nav-padding-inline`.

Os controles seguem o mesmo padrão: `Button` tem ganchos de cor por variante e por estado (`--enchase-button-background-primary`, `--enchase-button-color-outline-hover`, `--enchase-button-shadow-primary-hover`), os quatro campos dividem os ganchos `--enchase-input-*` (`--enchase-input-outline-border-color`, `--enchase-input-label-color-focus`, `--enchase-input-error-color`), e `Checkbox`, `RadioGroup` e `Switch` expõem as cores da caixa, do ponto e do rótulo. As camadas de hover, pressionado e desabilitado são misturas das cores do tema com os tokens `--enchase-state-*`, então mudam pelos tokens, não por ganchos.

O CSS vem em duas variantes. Importe uma delas, nunca as duas:

- `enchase/styles.css`: o layout (tamanho, padding, raio) usa `:where()` e sempre perde para a sua classe. Cores, borda e hover só são vencidos se o seu CSS carregar depois.
- `enchase/styles.layer.css`: o mesmo conteúdo em `@layer enchase`, com a ordem `@layer enchase-theme, enchase-base, enchase;`. Qualquer CSS seu sem camada vence em qualquer ordem. Combine com `<ColorModeProvider cssLayer="enchase-theme">`.
- `enchase/theme.css`: as variáveis do tema padrão como arquivo, para tê-las na primeira resposta do servidor sem esperar JavaScript. Um tema personalizado continua indo em `ColorModeProvider theme`.

### Overlays dentro de um trecho da página

`Modal`, `ConfirmModal`, `Popover`, `Tooltip`, o `Loading` com `overlay` e a região de notificações do `ToastProvider` renderizam num portal no `<body>`. As variáveis do tema chegam até eles, porque são declaradas em `:root` e em `[data-theme]`, mas uma variável que você muda num elemento do app (uma ilha com `data-theme="dark"`, um `div` com ganchos `--enchase-*` próprios) não chega, porque a herança segue a árvore do DOM e o portal está no `body`. A prop `container`, um elemento ou uma função que o devolve, monta o overlay dentro desse elemento, que passa a herdar as variáveis dele (a região de notificações dentro da página continua alcançável quando um modal deixa o resto da página inerte):

```tsx
const [island, setIsland] = useState<HTMLElement | null>(null)

return (
  <section data-theme="dark" ref={setIsland}>
    <Modal isOpen={open} onClose={close} title="Settings" container={island}>
      ...
    </Modal>
  </section>
)
```

Com `container` nulo, ou com a função devolvendo `null`, o overlay cai no `body`; a função roda só no cliente, nunca no servidor. Os overlays são `position: fixed` com as coordenadas da janela, então um ancestral do contêiner com `transform`, `filter` ou `contain` vira o bloco de contenção e desloca o overlay, e um que cria contexto de empilhamento (`z-index`, `opacity`, `isolation`) prende o `z-index` do overlay dentro dele: escolha um contêiner sem essas propriedades. O mesmo vale para o que o `data-theme` não resolve: um gancho declarado no `:root` como `var(--enchase-color-surface)` continua com as cores do documento, porque o alias é resolvido onde é declarado (veja acima).

## Renderização no servidor

Os componentes renderizam no servidor sem erro de hidratação.

- `ColorModeScript` aplica o `data-theme` antes da primeira pintura (por isso o `suppressHydrationWarning` no `<html>`). Sem JavaScript, o tema escuro do sistema vale por `@media (prefers-color-scheme: dark)`.
- `Layout` e `Navbar` renderizam o modo desktop no servidor e trocam pelo breakpoint com CSS gerado, sem quadro compacto antes da hidratação.
- Portais (`Modal`, `Loading` com overlay, `Tooltip`, `Popover` e a região de notificações do `ToastProvider`) abrem só depois da montagem. A região de notificações vive em um `div` próprio no `<body>` (`data-slot="toast-host"`, com `display: contents`), fora da árvore do app: um modal deixa o resto da página `inert`, mas não essa região, então uma notificação disparada com o modal aberto continua anunciada e clicável. O `data-slot="toast-host"` é um detalhe interno: não é uma API para isentar uma região sua do `inert`.
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

Versão `0.x`, em desenvolvimento ativo. Há dois estilos visuais, `enchase` e `shadcn`. Ainda não existem: gestos com velocidade (arrastar para dispensar, inércia, rubber-band), os estilos Material 3 e Ant Design, e uma opção de densidade à parte dos estilos.

## Contribuindo

Veja o [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE).

## Autor

**Thiago Silva** — [GitHub](https://github.com/thiagopedro99)
