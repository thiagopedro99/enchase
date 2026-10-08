# hydration

Teste de renderização no servidor e hidratação, feito do jeito que o Next.js usa os componentes. O código do teste foi descartado depois da medição; aqui fica só o resultado, em [`results.json`](./results.json). Reescrever este teste como teste permanente é o primeiro passo do plano.

## Método

1. **Servidor:** Vitest com ambiente `node` (sem `window`, `document`, `localStorage` nem `matchMedia`), `renderToString` de cada caso. O `src/tests/setup.ts` precisou ficar de fora, porque a linha 20 acessa `window` sem checar se existe.
2. **Navegador simulado:** Vitest com jsdom, o HTML do servidor dentro de um `<div id="root">`, e `hydrateRoot` com `onRecoverableError` e espião em `console.error`.
3. Cada caso usa os providers do `App.tsx` com as props padrão (`ColorModeProvider`, `UIProvider`, `ToastProvider`) e um `MemoryRouter`.
4. Variantes do navegador: A desktop + tema escuro salvo; B celular + claro + nada salvo (controle); C desktop + claro; D celular + escuro do sistema; E movimento reduzido; F celular + claro do sistema + escuro salvo.

## Resultado

O `results.json` lista 23 casos. Nenhum quebra no servidor. Na variante A, 8 não hidratam limpo, contando dois casos extras (a página Home e o Modal aberto sozinho). O resumo original do agente fala em "25 casos, 7 falhas" porque agrupou as variações de outro jeito; as causas são as mesmas três:

1. **Valores do navegador no estado inicial:** `colorMode/index.tsx:15-16`, `colorMode/defaultData.ts:13` e `hooks/useMediaQuery.ts:4`. Afeta ThemeToggle, Navbar e Layout com tema escuro, e o Layout em qualquer desktop (`layout/index.tsx:42`).
2. **Portais:** `Modal/index.tsx:89-91` e `Loading/index.tsx:42-44` devolvem `null` no servidor e `createPortal` no cliente. Falha sempre que abertos na primeira renderização, inclusive na variante de controle B.
3. **Movimento reduzido:** `hooks/useMotionRecipe.ts:11`. Só diferenças de atributo, apenas aviso em desenvolvimento.

Quando um caso falha, o React descarta o HTML do servidor e refaz a raiz inteira no cliente.

## Limites

- Usou `renderToString`, não o renderizador em streaming do Next.
- Hidratou dentro de um `<div>`, não com `hydrateRoot(document)`.
- O `persist` do Zustand (`app-storage`) não foi testado.
- Hidratação limpa não garante ausência de flash: com as leituras movidas para depois da montagem, quem usa tema escuro ainda vê o claro até hidratar, porque as variáveis escuras só existem sob `[data-theme='dark']`.
