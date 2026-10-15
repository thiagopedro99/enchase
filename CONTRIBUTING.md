# Contribuindo

Contribuições são bem-vindas. Antes de abrir um pull request, leia o [`skill.md`](./skill.md), que descreve as convenções de código e o contrato de componente. A consistência com o padrão existente vem antes de qualquer abstração nova.

## Como rodar

```bash
npm ci
npm run dev               # demo em http://localhost:5173
npm run storybook         # documentação em http://localhost:6006
```

## Antes de abrir o PR

Tudo isto precisa passar:

```bash
npm run build             # tsc -b e build do app
npm run lint
npm test                  # jsdom: comportamento, axe, hidratação e SSR
npm run test:browser      # Chromium real (Playwright)
npm run build:lib
npm run pack:check
npm run test:consumer
npm run test:next
```

Mudança em foco, `inert`, layout ou animação também deve ser conferida no navegador: o jsdom não simula esses recursos. Use `npm run test:browser:repeat [N]` para detectar testes instáveis.

## Convenções

- **Sem comentários no código**, nem `//`, `/* */`, `{/* */}`, nem cabeçalho de arquivo.
- **Commits** no padrão [Conventional Commits](https://www.conventionalcommits.org/), em inglês, com uma linha curta, no imperativo e sem ponto final (`feat: add the Popover`, `fix: close the confirm modal on Esc`). Prefixos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
- **API pública pequena:** só o que está em `lib/` é público (`enchase`, `enchase/theme`, `enchase/locales`). `src/` é interno, e `demo/` e as stories importam só da entrada pública. Exportar pouco: remover um export depois é uma quebra de versão.
- **Testes:** todo componente tem um teste espelho em `src/tests/components`. Comportamento novo ganha teste, e o que o jsdom não cobre ganha teste de navegador em `src/tests-browser`.
- **Acessibilidade e movimento:** siga a seção "Contrato de componente" do `skill.md` (`className`, `data-slot`, propriedades lógicas, tokens de movimento, hover só em ponteiro fino, `prefers-reduced-motion`).

## Pull requests

1. Faça um fork e crie uma branch (`git checkout -b feat/nova-coisa`).
2. Faça commits pequenos e descritivos.
3. Abra o pull request descrevendo o que mudou e por quê.
