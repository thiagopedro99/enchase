# CLAUDE.md

Enchase (React 19, TypeScript, Vite, CSS Modules, Zustand, Axios, motion). Ainda não se comunica com nenhuma API — `actions/` e `stores/` trazem só exemplos genéricos (`users`, `data`).

## Convenções de código

Siga o [`skill.md`](./skill.md): formatação, imports, componentização com `/subcomponentes`, estilos com CSS Modules e variáveis `--enchase-*`, padrão Actions (`actions/`, `stores/`, `types/`), Zustand, Axios, animação com `motion/react` e acessibilidade. Consistência com o padrão existente vem antes de qualquer abstração nova.

## Regras essenciais de código

- **Nunca comentar código** (nem `//`, nem `/* */`, nem `{/* */}`, nem cabeçalho de arquivo). Ao mexer em arquivo que tenha comentário, remova-o.

## Comandos

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — `tsc -b` + build do Vite
- `npm run lint` — ESLint
- `npm run type-check` — `tsc --noEmit`
- `npm run test` — Vitest (comportamento + axe)
- `npm run storybook` — documentação interativa em `localhost:6006`
- `npm run build-storybook` — site estático do Storybook

Antes de dar uma tarefa por concluída, rode `npm run build` (inclui o type-check) e `npm run test`. Mudança em foco, `inert`, layout ou animação também deve ser conferida no navegador: o jsdom não simula esses recursos.

## Commits (regras essenciais)

- Sempre no padrão **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`, `test:`...).
- Mensagem **em inglês**, com **descrição curta** (uma linha, imperativo, sem ponto final).
- **Nunca** adicionar trailer `Co-Authored-By` nem qualquer atribuição ao Claude, nos commits ou nas descrições de PR.
- Só commitar quando o usuário pedir.
