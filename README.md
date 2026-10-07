<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/enchase-logo-branco.svg">
    <img src="public/enchase-logo.svg" alt="Enchase" width="360">
  </picture>
</p>

# Enchase

Um template moderno e completo para desenvolvimento de aplicações React, construído com as melhores práticas e tecnologias atuais.

## Visão Geral

Este template fornece uma base sólida para iniciar projetos React com TypeScript, incluindo componentes reutilizáveis, sistema de temas, gerenciamento de estado, roteamento e muito mais. Projetado para ser escalável e fácil de manter.

## Características Principais

- **React 19** com TypeScript para desenvolvimento type-safe
- **Vite** para build ultra-rápido e Hot Module Replacement otimizado
- **Styled Components** para estilização com CSS-in-JS
- **React Router** para navegação client-side
- **Zustand** para gerenciamento de estado global leve e eficiente
- **Axios** configurado para requisições HTTP
- **Sistema de temas** (Light/Dark) totalmente customizável
- **Componentes reutilizáveis** prontos para uso
- **Sistema de notificações** (Toast) integrado
- **Estrutura de pastas** organizada e escalável
- **ESLint** configurado para qualidade de código
- **Path aliases** para imports mais limpos

## Tecnologias Utilizadas

### Core
- React 19.1.0
- TypeScript 5.8.3
- Vite 6.3.5

### UI e Estilização
- Styled Components 6.1.18
- Lucide React 0.544.0 (ícones)

### Roteamento e Estado
- React Router DOM 7.6.0
- Zustand 5.0.4

### HTTP Client
- Axios 1.9.0

### Ferramentas de Desenvolvimento
- ESLint 9.25.0
- TypeScript ESLint 8.30.1
- Babel Plugin Styled Components 2.1.4

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd meu-projeto
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente (opcional)

```bash
cp .env.example .env
```

A única variável usada é `VITE_API_BASE_URL`, o endereço base da sua API. Sem o arquivo `.env`, o projeto usa `https://api.example.com`.

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
src/
├── assets/           # Recursos estáticos (imagens, fontes, etc)
├── components/       # Componentes reutilizáveis
│   ├── common/      # Componentes básicos (Button, Input, Card, etc)
│   ├── layout/      # Layout principal da aplicação
│   ├── navbar/      # Barra de navegação (opção ao menu lateral)
│   ├── footer/      # Rodapé
│   └── toast/       # Sistema de notificações
├── hooks/           # Custom React hooks
├── pages/           # Páginas da aplicação
│   ├── home/
│   ├── componentsDemo/
│   ├── gettingStarted/
│   └── notFound/
├── routes/          # Configuração de rotas
├── stores/          # Gerenciamento de estado (Zustand)
│   ├── app/        # Estado global da aplicação
│   └── data/       # Estado de dados específicos
├── styles/          # Temas e estilos globais
│   └── themes/     # Temas light e dark
├── utils/           # Funções utilitárias
├── App.tsx          # Componente raiz
└── main.tsx         # Entry point
```

## Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev
```

Inicia o servidor de desenvolvimento com hot reload.

### Build

```bash
npm run build
```

Cria a build otimizada para produção na pasta `dist/`.

### Preview

```bash
npm run preview
```

Visualiza a build de produção localmente.

### Linting

```bash
npm run lint
```

Executa o ESLint para verificar problemas no código.

### Testes

```bash
npm run test
```

Roda os testes (Vitest, Testing Library e axe) uma vez; use `npm run test:watch` durante o desenvolvimento.

### Type Check

```bash
npm run type-check
```

Verifica os tipos TypeScript sem emitir arquivos.

## Componentes Disponíveis

O template inclui uma biblioteca completa de componentes reutilizáveis:

### Layout
- **Container** - Container responsivo com larguras máximas configuráveis
- **Flex** - Layout flexível com props para direção, alinhamento e espaçamento
- **Grid** - Sistema de grid responsivo

### Formulários
- **Button** - Botão com múltiplas variantes (primary, secondary, outline, ghost)
- **Input** - Input com label, validação e mensagens de erro
- **Select** - Select customizado com suporte a opções desabilitadas
- **Checkbox** - Checkbox estilizado com label opcional

### Feedback
- **Modal** - Modal customizável com overlay e animações
- **ConfirmModal** - Modal de confirmação pré-configurado
- **Toast** - Sistema de notificações (success, error, warning, info)
- **Loading** - Indicador de carregamento com tamanhos variados
- **Skeleton** - Placeholders de carregamento

### Superfície
- **Card** - Container de conteúdo com variantes (default, elevated, outlined)

### Navegação
- **Sidebar** - Menu lateral permanente que recolhe para uma barra de ícones e vira um drawer modal no mobile
- **Breadcrumbs** - Trilha de navegação com última página atual, colapso de trilhas longas e itens por rota ou âncora
- **Navbar** - Barra de navegação responsiva com menu mobile (alternativa à Sidebar)
- **Footer** - Rodapé customizável

Para ver todos os componentes em ação, acesse a rota `/components` no aplicativo.

## Layout e Navegação

O `Layout` oferece duas navegações, escolhidas pela prop `navigation`:

```tsx
<Layout pageTitle="Início">
  <h1>Conteúdo</h1>
</Layout>

<Layout navigation="navbar" pageTitle="Início">
  <h1>Conteúdo</h1>
</Layout>
```

- **`navigation="sidebar"` (padrão)**: uma barra superior (`AppBar`) com o botão de menu, o breadcrumb e o botão de tema, e o menu lateral. No desktop o botão recolhe a sidebar para uma barra de ícones (a escolha fica salva); no mobile ele abre o drawer modal. O ícone acompanha o estado (linhas com seta `‹` quando o menu está aberto, hambúrguer quando fechado) e o botão tem tooltip com a ação atual. Com a propriedade `sidebarFooter`, o rodapé da sidebar mostra o que você passar, por exemplo o `SidebarUser`, com avatar, nome e botão de sair.
- **`navigation="navbar"`**: a barra de navegação clássica no topo.
- **`navigationSections`**: substitui os itens do menu (por padrão, Início, Primeiros passos e Componentes).
- **`pageSections` e `activePageSectionId`**: seções extras no menu para navegar por âncoras dentro da página, usadas no style guide da rota `/components` com o hook `useScrollSpy`.
- **`breadcrumbs`**: trilha explícita (`BreadcrumbItem[]`). Sem ela, o `Layout` deriva a trilha do item de menu da rota atual (`Início › Componentes`) e acrescenta a seção ativa da página (`Início › Componentes › Botões`); em rotas sem item de menu usa o `pageTitle`.
- **`brand`**: nome exibido na marca. `hideNavbar` esconde a navegação.

O `Sidebar` também pode ser usado sozinho:

```tsx
<Sidebar
  sections={[{ id: 'app', title: 'Navegação', items: [{ id: 'home', label: 'Início', icon: Home, to: '/' }] }]}
  collapsed={collapsed}
  onToggleCollapsed={() => setCollapsed((current) => !current)}
/>
```

Cada item pode ser uma rota (`to`), uma âncora (`href`) ou uma ação (`onClick`). Com `variant="modal"` ele vira um drawer com foco preso, página inerte e Esc para fechar.

## Acessibilidade e Movimento

Os componentes seguem WCAG 2.2 AA (foco visível, teclado, ARIA, contraste e alvos mínimos) e todas as animações vêm de um catálogo único de receitas (`src/motion/`), configurável pelo `UIProvider`:

```tsx
<UIProvider
  motion={{ preset: 'subtle', recipes: { slide: { distance: 48 } } }}
  labels={{ closeModal: 'Close dialog', closeToast: 'Dismiss' }}
>
  <ToastProvider>
    <Router />
  </ToastProvider>
</UIProvider>
```

- **`motion.mode`**: `auto` respeita `prefers-reduced-motion`; `never` desliga todo o movimento.
- **`motion.preset`**: `off`, `subtle`, `standard` ou `expressive` escalam duração e distância de todas as receitas.
- **`motion.recipes`**: ajuste fino por receita (`fade`, `pop`, `slide`, `press`, `lift`, `spin`, `shimmer`).
- **`labels`**: todos os textos de acessibilidade (rótulos de botões, regiões e estados) para internacionalização.
- **Por componente**: `animation={false}` desliga, `animation={{ recipe: 'fade' }}` troca a receita.

Com `prefers-reduced-motion`, movimento espacial vira fade, `press` e `lift` somem e os loops viram um pulso de opacidade.

## Gerenciamento de Estado

O template utiliza Zustand para gerenciamento de estado global. Exemplos de stores incluídos:

### App Store

Gerencia o estado global da aplicação:

```typescript
import { useAppStore } from '@stores/app/index.ts';

const { language, setLanguage, sidebarCollapsed } = useAppStore();
```

**Estados disponíveis:**
- `language` - Idioma da aplicação
- `sidebarOpen` - Estado da sidebar
- `modalOpen` - Estado de modals

### Data Store

Exemplo de store para gerenciar dados da aplicação:

```typescript
import { useDataStore } from '@stores/data/index.ts';

const { items, addItem, updateItem, removeItem } = useDataStore();
```

## API e Serviços

### Configuração Base

O template inclui um cliente Axios pré-configurado em `src/actions/api.ts`:

```typescript
import { api } from '@actions/api.ts';

// GET
const response = await api.get('/users');

// POST
const response = await api.post('/users', userData);

// PUT
const response = await api.put('/users/1', userData);

// DELETE
const response = await api.delete('/users/1');
```

### Interceptors

O `actions/api.ts` cria a instância do Axios sem interceptors. Se o seu projeto precisar de autenticação ou de tratamento global de erros, adicione-os ali, com o gerenciamento de sessão que você escolher.

### Actions por Entidade

Cada entidade tem sua pasta em `src/actions/<entidade>/` (funções) e, quando tem estado de servidor, em `src/stores/<entidade>/`:

```typescript
// src/actions/users/index.ts
import { api } from '../api.ts';

import type { User } from './types.ts';

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/${id}`);

  return data;
};
```

Os tipos da entidade (domínio e request/response) ficam juntos em `src/actions/<entidade>/types.ts`. Veja `src/actions/users` como exemplo. As convenções completas estão em [`skill.md`](./skill.md).

## Sistema de Temas

### Linguagem visual

O template segue o **Material Design 3**, implementado só com styled-components (sem a biblioteca MUI): paleta tonal em índigo, cantos arredondados (botões em pílula, cards de 24px, diálogos de 28px), elevação suave, camadas de estado em hover/foco/pressionado e a fonte Figtree (self-hosted via `@fontsource-variable/figtree`).

### Estrutura dos Temas

Os temas ficam em `src/styles/themes/`:

- `shared.ts` - tokens comuns aos dois temas (fontes, espaçamento, raios, transições, breakpoints, z-index)
- `light.ts` - cores e sombras do tema claro
- `dark.ts` - cores e sombras do tema escuro

### Papéis de cor

As cores são papéis, nunca hex solto nos componentes:

| Papel | Uso |
|---|---|
| `primary` / `onPrimary` | Ação principal (botão preenchido, link, foco) e o texto sobre ela |
| `primaryContainer` / `onPrimaryContainer` | Botão tonal, item ativo da navegação, destaques |
| `secondary*` | Ações de apoio e elementos neutros tonais |
| `surface`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh` | Fundo da página e camadas de cards, barras e diálogos |
| `success`, `warning`, `info`, `error` e seus `*Container`/`on*` | Feedback (toasts, erros de campo) |
| `inverseSurface` / `inverseOnSurface` / `inversePrimary` | Tooltip e superfícies de contraste invertido |
| `text.primary`, `text.secondary`, `text.placeholder` | Texto sobre as superfícies |
| `border` (decorativa) e `borderStrong` (campos) | Divisores e bordas de controles |

### Camadas de estado e forma

Hover, foco e pressionado usam `stateLayer(cor, opacidade)` de `src/styles/stateLayer.ts` (8% hover, 10% foco e pressionado), em vez de trocar de cor. Os cantos vêm de `borderRadius` (`xs` 4px, `sm` 8px, `md` 12px, `lg` 16px, `xl` 24px, `2xl` 28px, `full`) e a elevação de `shadows` (`sm` a `xl`).

### Customização

Para modificar as cores e estilos:

```typescript
// src/styles/themes/light.ts
export const lightTheme = {
  ...sharedTokens,
  colors: {
    primary: '#4F46E5',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E1E0FF',
    background: '#FBF8FF',
    surface: '#FBF8FF',
    // ...
  },
  // ...
};
```

### Paleta e Acessibilidade

A paleta dos dois temas atende WCAG 2.2 AA e isso é verificado por testes (`npm run test`):

| Tokens | Uso | Mínimo |
|---|---|---|
| `text.primary`, `text.secondary`, `text.placeholder` | Texto e placeholder sobre qualquer superfície | 4.5:1 |
| `primary`, `primaryHover`, `error`, `success`, `warning`, `info` | Texto e links sobre qualquer superfície | 4.5:1 |
| `on*` sobre o respectivo papel (`onPrimary` em `primary`, `onErrorContainer` em `errorContainer`...) | Texto de botões, toasts e destaques | 4.5:1 |
| `inverseOnSurface` e `inversePrimary` sobre `inverseSurface` | Tooltip e ação de snackbar | 4.5:1 |
| `borderStrong` | Borda de campos (`Input`, `Select`, `Checkbox`) | 3:1 |
| `primary`, `error` | Anel de foco, botão outline e campo inválido | 3:1 |

`border` é só para divisores decorativos. Ao trocar uma cor, rode os testes: `src/tests/styles/contrast.test.ts` falha se algum par ficar abaixo do mínimo. Para checar uma cor nova, use `contrastRatio(foreground, background)` de `src/styles/contrast.ts`.

### Alternância de Tema

O tema é controlado pelo `ColorModeProvider` (já usado no `App.tsx`). Ele aceita três modos: `light`, `dark` e `system` (o padrão, que acompanha a preferência do sistema), lembra a escolha no `localStorage` e marca o `<html>` com `data-theme`.

```tsx
import { useColorMode } from '@hooks/useColorMode.ts'

const { mode, resolvedMode, setMode, toggleMode } = useColorMode()

<button onClick={toggleMode}>
  Tema: {resolvedMode}
</button>
```

Para começar sempre no claro, use `<ColorModeProvider defaultMode="light">`. Para desligar a persistência, `storage={null}`; para controlar de fora, passe `mode` e `onModeChange`.

## Roteamento

### Adicionar Nova Rota

1. Crie a página em `src/pages/`:

```typescript
// src/pages/minhaPage/index.tsx
import Layout from '@components/layout';

const MinhaPage = () => {
  return (
    <Layout pageTitle="Minha Página">
      <h1>Conteúdo</h1>
    </Layout>
  );
};

export default MinhaPage;
```

2. Adicione a rota em `src/routes/routes.tsx`:

```typescript
import MinhaPage from '@pages/minhaPage';

const routes = [
  {
    path: "/",
    privateRoute: false,
    routes: [
      // ...
      ["/minha-page", <MinhaPage />],
    ],
  },
];
```

## Path Aliases

O projeto está configurado com aliases para imports mais limpos:

```typescript
import { Button } from '@components/common';
import { useAppStore } from '@stores/app/index.ts';
import { api } from '@actions/api.ts';
import Layout from '@components/layout';
```

**Aliases disponíveis:**
- `@components/*` → `src/components/*`
- `@pages/*` → `src/pages/*`
- `@stores/*` → `src/stores/*`
- `@actions/*` → `src/actions/*`
- `@hooks/*` → `src/hooks/*`
- `@utils/*` → `src/utils/*`
- `@styles/*` → `src/styles/*`
- `@assets/*` → `src/assets/*`
- `@routes/*` → `src/routes/*`
- `@motion/*` → `src/motion/*`

## Build para Produção

### Otimizações Incluídas

O template está configurado com várias otimizações de build:

- **Code splitting** automático por vendors
- **Tree shaking** habilitado
- **CSS minification**
- **Compressão de assets**
- **Chunks otimizados** (react-vendor, ui-vendor, state-vendor)

### Configuração de Build

Personalize em `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // ...
  },
});
```

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças seguindo o padrão Conventional Commits
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

### Conventional Commits

Este projeto segue a convenção de [Conventional Commits](https://www.conventionalcommits.org/). Use os seguintes prefixos:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, falta de ponto e vírgula, etc (sem mudança de código)
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Atualização de dependências, configurações, etc

**Exemplos:**
```bash
git commit -m "feat: adiciona componente Accordion"
git commit -m "fix: corrige bug no modal de confirmação"
git commit -m "docs: atualiza documentação do componente Button"
git commit -m "chore: atualiza dependências do projeto"
```

### Diretrizes

- Mantenha o código consistente com o estilo existente
- Adicione testes quando apropriado
- Atualize a documentação conforme necessário
- Certifique-se de que o lint passa antes de commitar
- Use commits atômicos e descritivos

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Autor

**Thiago Silva**

- LinkedIn: [linkedin.com/in/thiago-silva](https://www.linkedin.com/in/thiago-pedro-da-silva/)
- GitHub: [github.com/thiagopedro99](https://github.com/thiagopedro99)
