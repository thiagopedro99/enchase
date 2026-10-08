# native-dialog

Experimentos com `<dialog>` + `showModal()` e o atributo `popover` como alternativa aos portais. A decisão foi adiada: por enquanto o Enchase mantém portais, abertos só depois da hidratação.

## Arquivos

- [`page.html`](./page.html) e `run*.mjs`: dois modais empilhados, Esc, `closedby`, transição de saída com `allow-discrete` e `overlay`, popovers aninhados, ordem do Tab e rolagem atrás do modal.
- [`domcheck.mjs`](./domcheck.mjs): o que o jsdom e o happy-dom implementam de `<dialog>` e `popover`.
- [`app/`](./app): React 19 + motion. Saída animada com `usePresence` antes do `close()`, modais aninhados (com e sem a checagem de `event.target`) e SSR com o modal aberto na hidratação (portal contra diálogo no lugar). `node build.mjs` gera as páginas em `app/dist/`.

## Resultados (Chromium 141)

- Saída animada: `usePresence`, animação com o diálogo aberto, `close()`, `safeToRemove()`. O `:modal` fica verdadeiro até o fim e o foco volta ao gatilho.
- Empilhados: um Esc fecha só o de cima. Abertos sem gesto do usuário, um Esc fecha os dois, e o segundo Esc seguido não pode ser cancelado.
- O React 19 propaga `cancel` e `close` pela árvore: sem `if (event.target !== event.currentTarget) return`, fechar o modal de dentro fecha o de fora.
- O Tab não fica preso no diálogo e a página rola atrás, então `useFocusTrap` e `useScrollLock` continuam necessários.
- SSR com o modal aberto: o portal atual falha a hidratação; o diálogo no lugar com `showModal()` no `useLayoutEffect` não tem erros.
- jsdom 29 e 30 não têm `showModal`/`showPopover`; o happy-dom só marca `open`. Testes desse caminho precisam de navegador real.
