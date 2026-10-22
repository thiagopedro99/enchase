# CLAUDE.md

Enchase (React 19, TypeScript, Vite, CSS Modules). Biblioteca de componentes, sem acesso a API nem estado global.

## Convenções de código

Siga o [`skill.md`](./skill.md): formatação, imports, componentização com `/subcomponentes`, estilos com CSS Modules e variáveis `--enchase-*`, animação própria em CSS e acessibilidade. Consistência com o padrão existente vem antes de qualquer abstração nova.

## Estrutura pública

`src/` é interno; `lib/` é o contrato público (`enchase`, `enchase/theme`, `enchase/styles`, `enchase/locales`, `enchase/icons`, arquivos finos que reexportam). `demo/` e as stories (`src/docs`) importam só da entrada pública, e `src/components` nunca importa de `lib/` (regras de ESLint). Exportar pouco: remover um export depois é uma quebra de versão.

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

## Skills de design

As skills de design e de animação (de `emilkowalski/skills`) ficam fora do git (`.agents/` e `.claude/skills/`). O `skills-lock.json` registra a origem e o hash de cada uma: reinstale-as com o instalador de skills que o gerou.

## Commits (regras essenciais)

- Sempre no padrão **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `style:`, `test:`...).
- Mensagem **em inglês**, com **descrição curta** (uma linha, imperativo, sem ponto final).
- **Nunca** adicionar trailer `Co-Authored-By` nem qualquer atribuição ao Claude, nos commits ou nas descrições de PR.
- Só commitar quando o usuário pedir.
