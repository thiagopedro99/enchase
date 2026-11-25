import type { GroupKind, ReleaseNote } from './types.ts'

export const groupLabels: Record<GroupKind, { label: string; variant: 'success' | 'warning' | 'info' }> = {
  novo: { label: 'Novo', variant: 'success' },
  mudou: { label: 'Mudou', variant: 'warning' },
  corrigido: { label: 'Corrigido', variant: 'info' }
}

export const anchorOf = (version: string) => `v-${version.replace(/\./g, '-')}`

export const releases: ReleaseNote[] = [
  {
    version: '0.26.0',
    previous: '0.25.1',
    date: '25 de novembro de 2026',
    shortDate: '25 nov',
    title: 'Board, o quadro Kanban experimental',
    summary: 'Um componente novo, o `Board`: colunas com cartões que mudam de lugar por arrastar, pelo teclado ou por um menu. Ele chega como experimental, em `enchase/experimental/board`, e nada do que já existia mudou.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`Board`, em `enchase/experimental/board`: você entrega as colunas e os cartões, e ele avisa cada movimento uma única vez, ao soltar.',
          'Três jeitos de mover: arrastar (o cartão inteiro no mouse, a alça no toque), teclado (espaço pega, setas movem, Esc cancela) e o menu "Mover para" de cada cartão.',
          '`sortable={false}` mantém a ordem de cada coluna com você, e `readOnly` mostra o quadro sem alça nem menu.',
          'Os anúncios para leitor de tela saem em português ou em inglês conforme o idioma do `UIProvider`, e a prop `labels` aceita outras línguas.'
        ]
      }
    ],
    migration: {
      text: 'Nada a mudar no que você já usa. Por ser experimental, o `Board` pode mudar entre versões menores, e cada mudança sai nas notas.',
      blocks: [
        {
          label: 'Quadro.tsx',
          language: 'tsx',
          code: "import { Board } from 'enchase/experimental/board'\n\n<Board\n  columns={colunas}\n  items={cartoes}\n  getItemLabel={(cartao) => cartao.titulo}\n  renderCard={(cartao) => <span>{cartao.titulo}</span>}\n  onMove={({ item, to }) => salvar(item.id, to.columnId, to.index)}\n/>"
        }
      ]
    }
  },
  {
    version: '0.25.1',
    previous: '0.25.0',
    date: '25 de novembro de 2026',
    shortDate: '25 nov',
    title: 'A cor da marca no estilo workbench',
    summary: 'Uma correção no estilo `workbench`: com uma cor de marca, o contêiner primário passa a acompanhar a marca. Sem cor de marca, nada muda.',
    behavior: true,
    groups: [
      {
        kind: 'corrigido',
        items: ['No `workbench` com `brand`, o contêiner primário ficava no azul do estilo. Badge primário, botão secundário, item atual da navegação e linhas selecionadas agora saem na cor da marca.']
      }
    ],
    migration: {
      text: 'Só muda quem usa `workbench` com `brand`. Para manter o par azul de antes, passe as duas cores ao tema.',
      blocks: [
        {
          label: 'main.tsx',
          language: 'tsx',
          code: "import { ColorModeProvider } from 'enchase'\nimport { workbench } from 'enchase/styles/workbench'\n\nconst theme = {\n  style: workbench,\n  brand: '#BE123C',\n  light: { colors: { primaryContainer: '#E6F4FF', onPrimaryContainer: '#0958D9' } },\n  dark: { colors: { primaryContainer: '#15325B', onPrimaryContainer: '#8DC5F8' } }\n}\n\n<ColorModeProvider theme={theme}>\n  <App />\n</ColorModeProvider>"
        }
      ]
    }
  },
  {
    version: '0.25.0',
    previous: '0.24.0',
    date: '24 de novembro de 2026',
    shortDate: '24 nov',
    title: 'Material 2, o quinto estilo',
    summary: 'O estilo novo `material2` deixa o kit com a cara do tema padrão do Material UI: cantos de 4 px, botões em maiúsculas com elevação e campos com rótulo flutuante. É opcional: quem não importa o estilo continua com o visual que tem.',
    behavior: true,
    groups: [
      {
        kind: 'novo',
        items: [
          'Estilo `material2`, em `enchase/styles/material2`: próximo do tema padrão do Material UI v5, no claro e no escuro, com o contraste que a biblioteca exige.',
          'Com uma cor de marca, o contêiner primário do `material2` acompanha a marca.',
          'Dez ganchos novos, todos com o valor de antes como padrão: caixa e largura mínima do botão, caixa e espaçamento das abas, tamanho dos itens da paginação, fundo e sombra do acordeão, sombra da barra de navegação e trilho do switch desabilitado.'
        ]
      },
      {
        kind: 'mudou',
        items: ['Um `ButtonLink` dentro de um elemento com `text-transform` não herda mais a caixa desse elemento. O `Button` não muda.']
      }
    ],
    migration: {
      text: 'Para usar o estilo novo, passe `material2` ao tema. Ele não embute a Roboto: carregue a fonte no app e passe em `fonts`. Se um `ButtonLink` seu dependia do `text-transform` do elemento em volta, defina `--enchase-button-text-transform` nesse elemento.',
      blocks: [{ label: 'main.tsx', language: 'tsx', code: "import { ColorModeProvider } from 'enchase'\nimport { material2 } from 'enchase/styles/material2'\n\n<ColorModeProvider theme={{ style: material2 }}>\n  <App />\n</ColorModeProvider>" }]
    }
  },
  {
    version: '0.24.0',
    previous: '0.23.0',
    date: '24 de novembro de 2026',
    shortDate: '24 nov',
    title: 'Lapidado, o novo visual padrão',
    summary: 'Quem não escolhe um estilo passa a receber o Lapidado: superfícies neutras, bordas precisas e a cor da marca só onde há ação, seleção ou foco. O visual anterior continua disponível, igual ao que era, como o estilo `material3`.',
    behavior: true,
    groups: [
      {
        kind: 'novo',
        items: [
          'Estilo `material3`, em `enchase/styles/material3`: o visual padrão da 0.23, com o mesmo tema de antes.',
          'Um gancho seu declarado em `:root` vence o estilo padrão em qualquer ordem de CSS, também com a densidade compacta.',
          'Ganchos novos: `--enchase-table-header-background-sticky` e `--enchase-input-outline-padding-inline`.'
        ]
      },
      {
        kind: 'mudou',
        items: [
          'Sem `style`, o visual é o Lapidado, não mais o Material 3: cantos de 10 px nos controles e 16 px nos cards, borda de 1 px com sombra curta e controles um pouco mais baixos.',
          'O rótulo dos campos fica em cima por padrão (`stacked`). No `material3` ele continua flutuante.'
        ]
      },
      {
        kind: 'corrigido',
        items: [
          'Texto longo sem espaços na ajuda e no erro dos campos quebra a linha em vez de alargar a página.',
          'O rótulo ao lado do campo fica centralizado com ele quando quebra em duas linhas.',
          'No estilo shadcn, o cabeçalho fixo da `Table` deixa de mostrar as linhas que rolam por trás.'
        ]
      }
    ],
    migration: {
      text: 'Para manter o visual da 0.23, passe o estilo `material3` ao tema. É a única mudança.',
      blocks: [{ label: 'main.tsx', language: 'tsx', code: "import { ColorModeProvider } from 'enchase'\nimport { material3 } from 'enchase/styles/material3'\n\n<ColorModeProvider theme={{ style: material3 }}>\n  <App />\n</ColorModeProvider>" }]
    }
  },
  {
    version: '0.23.0',
    previous: '0.22.0',
    date: '12 de novembro de 2026',
    shortDate: '12 nov',
    title: 'A sua classe vence o CSS da biblioteca',
    summary: 'O CSS da Enchase passa a ocupar uma faixa fixa da cascata. Uma classe sua vence as regras da biblioteca em qualquer ordem de carregamento, sem camada de cascata e sem `!important`. Vale para CSS puro, CSS Modules e styled-components.',
    behavior: true,
    groups: [
      {
        kind: 'novo',
        items: [
          'Uma classe sua vence a regra de repouso da biblioteca, venha antes ou depois do CSS dela.',
          'Uma classe que nomeia um estado, como `.salvar:hover` ou `.salvar:disabled`, vence a regra da biblioteca para aquele estado.',
          'Guia novo, `STYLING.md`, que diz o que vence o quê.'
        ]
      },
      {
        kind: 'mudou',
        items: [
          'Um seletor só de elemento, como `button` ou `h1`, perde para todas as regras da biblioteca. Antes ele podia vencer algumas.',
          'Uma regra sua em estado de elemento, como `a:hover`, não altera mais o hover do `Link` nem o anel de foco dos links de navegação.',
          'O `styles.css` cresce 4,5% em gzip (de 27,3 para 28,6 kB). Nenhuma API foi removida.'
        ]
      }
    ],
    migration: {
      text: 'Se você mudava um componente com um seletor de elemento, troque por uma classe.',
      blocks: [
        { label: 'Antes', language: 'css', code: 'button {\n  border-radius: 0;\n}' },
        { label: 'Depois', language: 'css', code: '.salvar {\n  border-radius: 0;\n}' }
      ]
    }
  },
  {
    version: '0.22.0',
    previous: '0.21.1',
    date: '6 de novembro de 2026',
    shortDate: '6 nov',
    title: 'CSS por componente',
    summary: 'Agora dá para importar só o CSS dos componentes que você usa, e o item do `Breadcrumbs` passa a ser nomeado como nos outros componentes de lista.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`enchase/css/<nome>.css` traz o CSS de um componente só. O mapa `enchase/css/index.json` diz de quais outros arquivos cada um precisa.',
          '`BreadcrumbItem` aceita `value`, como `TabsItem` e `AccordionItem`. O `id` continua valendo até a 1.0.',
          '`contrastChecks` passa a ser exportado de `enchase/theme`.'
        ]
      }
    ],
    migration: {
      text: 'Opcional. Use os arquivos por componente no lugar do `enchase/styles.css`, nunca os dois juntos.',
      blocks: [{ label: 'main.tsx', language: 'tsx', code: "import 'enchase/theme.css'\nimport 'enchase/css/icon.css'\nimport 'enchase/css/button.css'" }]
    }
  },
  {
    version: '0.21.1',
    previous: '0.21.0',
    date: '6 de novembro de 2026',
    shortDate: '6 nov',
    title: 'Correção no estilo shadcn',
    summary: 'Uma correção visual, sem mudança na API.',
    behavior: false,
    groups: [{ kind: 'corrigido', items: ['O rótulo do `SegmentedControl` agora segue o estilo shadcn.'] }]
  },
  {
    version: '0.21.0',
    previous: '0.20.0',
    date: '6 de novembro de 2026',
    shortDate: '6 nov',
    title: 'ButtonLink só com ícone e ref em todo componente',
    summary: 'Quatro recursos pedidos no uso do dia a dia. Nada foi removido nem mudou de comportamento.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`ButtonLink` aceita `iconOnly`, como o `Button`: um quadrado para um ícone só, nomeado por `aria-label`.',
          '`SegmentedControl` ganha um rótulo visível com a prop `label`.',
          'Todo componente que desenha um elemento aceita `ref`.',
          'No `Combobox`, a primeira opção que combina com o texto já fica ativa enquanto você digita.'
        ]
      },
      { kind: 'corrigido', items: ['O `padding` do `Card` deixa de ser escrito inline: uma classe sua agora vence a prop.'] }
    ]
  },
  {
    version: '0.20.0',
    previous: '0.19.1',
    date: '5 de novembro de 2026',
    shortDate: '5 nov',
    title: 'Hooks headless em caminhos estáveis',
    summary: 'Os cinco hooks sem interface saem do caminho experimental, e o `enchase eject` passa a ser estável.',
    behavior: false,
    groups: [
      {
        kind: 'novo',
        items: [
          '`useTabs`, `useAccordion`, `usePagination`, `useSegmentedControl` e `useSlider` são exportados de `enchase/headless/<nome>`.',
          '`enchase eject` congela os comandos, as opções e o formato do `enchase.eject.json`.'
        ]
      },
      { kind: 'mudou', items: ['Os caminhos `enchase/experimental/*` continuam funcionando, com aviso de depreciação no editor, até a 1.0.'] }
    ],
    migration: {
      text: 'Troque o caminho do import. O hook é o mesmo.',
      blocks: [
        { label: 'Antes', language: 'tsx', code: "import { useTabs } from 'enchase/experimental/tabs'" },
        { label: 'Depois', language: 'tsx', code: "import { useTabs } from 'enchase/headless/tabs'" }
      ]
    }
  }
]

export const currentVersion = releases[0]?.version ?? ''

export const oldestVersion = releases[releases.length - 1]?.version ?? ''
