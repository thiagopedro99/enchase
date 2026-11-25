# Enchase API

A Cloudflare Worker that answers under `https://enchase.othiagosilva.com.br/api/`, on the same domain as the site. It is not part of the npm package.

## What it does

`GET /api/suggestions` answers the cards of the page `/sugestoes` as JSON. The Worker reads the issues of this repository as a GitHub App, so the visitors of the site do not share the limit that GitHub puts on requests without a token. The mapping from an issue to a card is the one of the site, in `demo/pages/sugestoes/github.ts`, and the rules are in the section "Suggestions board" of `CONTRIBUTING.md`.

- The answer is kept for one minute, at the edge and by the visitor. The query string is ignored, so it cannot be used to skip the cache.
- Any other path answers 404, and any method other than `GET` and `HEAD` answers 405.
- When GitHub refuses or fails, the answer is 502 and the Worker leaves GitHub alone for fifteen seconds. The site then reads the public GitHub API from the browser, as it did before the Worker.
- The Worker asks GitHub for a token that only reads the issues of this repository, whatever the app is allowed to do, and keeps it in memory until five minutes before it expires. The private key never leaves the Worker and nothing of it is logged.

## Configuration

| Name | Where | What |
| --- | --- | --- |
| `GITHUB_APP_ID` | `[vars]` of `wrangler.toml` | The App ID, from the page of the app. It is not a secret. |
| `GITHUB_APP_PRIVATE_KEY` | secret of the Worker | The private key of the app, as the `.pem` file that GitHub generates. |

## The GitHub App

Create it once, in Settings, Developer settings, GitHub Apps, New GitHub App:

1. Turn the webhook off, and leave the callback URL empty.
2. Repository permissions: Issues, read-only. Nothing else.
3. Where can it be installed: only on this account.
4. On the page of the app, write down the App ID and generate a private key.
5. Install the app on this repository only.

## Deploy

```sh
cd worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put GITHUB_APP_PRIVATE_KEY < path/to/the-key.pem
```

Then `curl -i https://enchase.othiagosilva.com.br/api/suggestions` answers `200` with `content-type: application/json`. Before the Worker is deployed, the same address answers the page of the site, and the site reads GitHub from the browser.

`npx wrangler tail` shows the reason of a 502, and `npx wrangler deploy --dry-run` builds the Worker without publishing it.

## Tests

The tests are in `src/tests/worker/` and run with `npm run test`. `tsconfig.worker.json` type-checks the Worker without the DOM, so the code that it shares with the site cannot reach for `window`.
