# overlay-stack

O que acontece quando um Popover abre dentro do Modal com os hooks atuais, e um protótipo de pilha de camadas que resolve. Rodou no Chromium 141 com o Modal e o Tooltip reais do repositório, teclado e mouse reais pelo Playwright. Firefox, WebKit, leitores de tela e toque não foram testados.

## Arquivos

- [`src/hooks/overlayStack.ts`](./src/hooks/overlayStack.ts): a pilha (66 linhas). Um listener de Esc e um de `pointerdown` no `document`, compartilhados por todas as camadas.
- [`src/hooks/useModalBehavior.stack.ts`](./src/hooks/useModalBehavior.stack.ts): o `useModalBehavior` registrando uma camada modal em vez do próprio listener de Esc.
- `src/components/common/Modal/index.stack.tsx` e `Tooltip/index.stack.tsx`: as mudanças mínimas nos dois componentes.
- [`entry.tsx`](./entry.tsx): a página de teste, com um Popover de exemplo e as variações de listener.
- `exp-*.mjs`: um script por cenário; [`lib.mjs`](./lib.mjs) abre o Chromium e serve o build.

Para reproduzir: rode `npm install` na raiz do repositório e aqui (instala o `playwright-core`), copie o `src/` do repositório para cá sem sobrescrever os arquivos `.stack` (`cp -rn ../../src/. src/`), rode `node build.mjs` e depois os `exp-*.mjs`. O build usa o `esbuild` e o `node_modules` da raiz.

## Problemas confirmados nos hooks atuais

1. **Um Esc fecha o Popover e o Modal.** O `useModalBehavior` escuta o `keydown` no `document` (linhas 20-30), e quem registrou primeiro reage primeiro. Usar `stopPropagation` em captura não resolve: quando o Popover está abaixo de um Modal, é ele que fecha.
2. **Modais aninhados:** qual deles o Esc fecha depende da identidade do `onClose`. Com função inline fecha só o de dentro; com `useCallback` fecha os dois. Vale também para a Sidebar e o drawer da Navbar.
3. **Clique fora:** um clique no fundo do Modal com o Popover aberto fecha os dois de uma vez.
4. **Modal aberto de dentro de um Popover:** OK ou Esc fecham o Popover junto, e o foco se perde no `body`.
5. **Tab:** o conteúdo num portal no fim do `body` fica fora da ordem do Tab. No meio da página, o Tab da âncora pula o Popover; dentro do Modal, o Tab nunca chega nele.
6. **Tooltip dentro do Modal:** um Esc fecha os dois. Os testes atuais da Navbar dependem disso.
7. O Popover aberto de dentro do Modal **não** fica inerte, porque o `useInertSiblings` só marca o que existe quando o Modal abre. Isso é o comportamento desejado.

## O protótipo

- O Esc vai só para a camada do topo, e é ignorado durante composição de IME ou se alguém já chamou `preventDefault`.
- Um `pointerdown` fecha as camadas não modais de cima para baixo até encontrar uma que contém o alvo ou uma modal.
- O fundo do Modal só fecha se o Modal era o topo no `pointerdown` (`wasTopAtPointerDown`).
- Cada camada guarda um handle estável e lê os callbacks por `ref`, então a identidade do `onClose` não muda a ordem.
- O foco preso, o `inert` e a trava de rolagem do Modal continuam iguais.

Resultado: os 15 cenários (S1 a S14, com S10b e S10c) passam. Numa cópia do repositório com o protótipo aplicado, a suíte jsdom passou 717/717 e os testes de Modal, Sidebar e Navbar em modo navegador passaram 63/63. O Tooltip ficou de fora: fazê-lo consumir o Esc quebra 5 testes da Navbar, e a decisão do Tooltip foi adiada.

Limitação conhecida (não testada): camadas entram na ordem dos efeitos; se um pai e um filho montam no mesmo commit, o filho entra primeiro. Radix e React Aria têm a mesma limitação.

A combinação segue o React Aria (só o topo fecha; topo registrado no `pointerdown`) e o Radix (fecha as camadas não modais até a primeira modal), pela leitura do código publicado de `@radix-ui/react-dismissable-layer` 1.1.20, `react-aria` 3.53.0 e `@floating-ui/react` 0.27.20.

## Casos para o contrato do Popover

Já exercitados no Chromium:

- Esc no Popover dentro do Modal fecha só o Popover, e o foco volta à âncora; o segundo Esc fecha o Modal e o foco volta a quem o abriu.
- Clique no corpo do Modal fecha só o Popover. Clique no fundo fecha só o Popover; o segundo clique fecha o Modal. Clique no Popover onde ele cobre o fundo não fecha nada.
- Popovers aninhados: clique no filho mantém os dois, no pai fecha o filho, fora fecha os dois; Esc fecha só o filho.
- Modal aberto de um Popover: OK ou Esc fecham só o Modal, com o foco de volta no item.
- Modais aninhados: um Esc por Modal, qualquer que seja o `onClose`.
- Nenhuma camada sobra depois de fechar.
- O Popover dentro do Modal está na árvore de acessibilidade e não é inerte, enquanto a página continua inerte.
- `aria-expanded` acompanha o estado; `aria-controls` só existe enquanto aberto.
- Ordem do Tab preservada: Tab na âncora entra no Popover; Tab no último elemento vai para o elemento seguinte à âncora e fecha; Shift+Tab no primeiro volta à âncora; dentro do Modal, nunca cai na página inerte.

Ainda por escrever:

- Esc durante composição de IME não faz nada.
- Clicar numa área não focável do Popover mantém o foco nele (hoje falha).
- Âncora que é o último elemento do Modal: o Tab volta ao primeiro elemento do Modal.
- Clique fora não puxa o foco de volta para a âncora.
- Os dois modos de abertura: foco fica na âncora (disclosure do APG) e foco vai para o conteúdo (diálogo não modal).
- Layout RTL.

Rodar no Chromium, Firefox e WebKit; o jsdom não consegue testar o foco saindo do documento.
