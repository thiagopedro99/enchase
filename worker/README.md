# Enchase API

A Cloudflare Worker that answers under `https://enchase.othiagosilva.com.br/api/`, on the same domain as the site. It is not part of the npm package.

## What it does

| Route | What it answers |
| --- | --- |
| `GET /api/suggestions` | The cards of the page `/sugestoes`, as JSON. |
| `GET /api/session` | Who is signed in and which suggestions that visitor voted for, or `{ "user": null }`. |
| `GET /api/auth/login` | A redirect to GitHub, to sign in. |
| `GET /api/auth/callback` | Where GitHub sends the visitor back. It opens the session and goes to `/sugestoes`. |
| `POST /api/auth/logout` | Ends the session and revokes the token on GitHub. |
| `PUT` and `DELETE /api/suggestions/{number}/vote` | Adds or removes the 👍 of the visitor on that issue. |

Any other path answers 404, and a method that the path does not take answers 405.

### The list

The Worker reads the issues of this repository as a GitHub App, so the visitors of the site do not share the limit that GitHub puts on requests without a token. The mapping from an issue to a card is the one of the site, in `demo/pages/sugestoes/github.ts`, and the rules are in the section "Suggestions board" of `CONTRIBUTING.md`.

- The answer is kept for one minute, at the edge and by the visitor. The query string is ignored, so it cannot be used to skip the cache. A vote drops the copy of the edge that took it.
- When GitHub refuses or fails, the answer is 502 and the Worker leaves GitHub alone for fifteen seconds. The site then reads the public GitHub API from the browser, as it did before the Worker.
- The Worker asks GitHub for a token that only reads the issues of this repository, whatever the app is allowed to do, and keeps it in memory until five minutes before it expires. The private key never leaves the Worker and nothing of it is logged.

### The session and the vote

A visitor signs in with GitHub through the same GitHub App, and the vote is a 👍 that GitHub records as given by that visitor. The Worker never votes as the app.

- **Login:** the authorization code flow with a `state` and PKCE (`S256`). The state and the verifier live for ten minutes in a cookie that only this browser sends back, so a callback that another site starts is refused before GitHub is asked.
- **Session:** an opaque random id in the cookie `__Host-enchase-session` (`HttpOnly`, `Secure`, `SameSite=Lax`), for at most eight hours. The store, a KV namespace, is keyed by a hash of that id and holds the token of the visitor sealed with a key derived from the id, so a copy of the store alone opens no session and reads no token. The refresh token that GitHub sends is thrown away.
- **What the token can do:** only what both the visitor and the app can do, on the repositories where the app is installed. The Worker uses it to read which suggestions the visitor voted for and to add or remove the 👍.
- **Requests that change something** (`POST`, `PUT`, `DELETE`) must carry the `Origin` of the site. The Worker sends no CORS header, so another site cannot read an answer either.
- **What can be voted:** an issue that has one of the labels of the board. Anything else answers 404.
- **Limits:** thirty votes a minute for each visitor, and thirty callbacks a minute for each network address, counted in each Cloudflare location.
- **When GitHub says that the token is no longer valid,** the session ends and the site offers the login again.

The routes of the session and of the vote answer 404 until `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and the store are configured, and the site then shows the board without the login.

## Configuration

| Name | Where | What |
| --- | --- | --- |
| `GITHUB_APP_ID` | `[vars]` of `wrangler.toml` | The App ID, from the page of the app. It is not a secret. |
| `GITHUB_CLIENT_ID` | `[vars]` of `wrangler.toml` | The Client ID, from the page of the app. It is not a secret. |
| `GITHUB_APP_PRIVATE_KEY` | secret of the Worker | The private key of the app, as the `.pem` file that GitHub generates. |
| `GITHUB_CLIENT_SECRET` | secret of the Worker | A client secret, generated on the page of the app. |
| `SESSIONS` | `[[kv_namespaces]]` of `wrangler.toml` | The store of the sessions. Without an `id`, `wrangler deploy` creates the namespace and writes its id back to the file: commit that line. |
| `LIMITER` | `[[ratelimits]]` of `wrangler.toml` | The limit of votes and of callbacks. |

## The GitHub App

Create it once, in Settings, Developer settings, GitHub Apps, New GitHub App:

1. Turn the webhook off.
2. Callback URL: `https://enchase.othiagosilva.com.br/api/auth/callback`, without wildcard matching. Keep "Expire user authorization tokens" on, and "Request user authorization (OAuth) during installation" and the device flow off.
3. Repository permissions: Issues, read and write. Nothing else. The write is what lets a visitor vote and, later, suggest; the Worker itself only asks for tokens that read.
4. Where can it be installed: only on this account.
5. On the page of the app, write down the App ID and the Client ID, generate a private key and generate a client secret.
6. Install the app on this repository only. After a change of permissions, accept the new permissions on the page of the installation.

## Deploy

```sh
cd worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put GITHUB_APP_PRIVATE_KEY < path/to/the-key.pem
npx wrangler secret put GITHUB_CLIENT_SECRET
```

In PowerShell, `<` does not exist: use `Get-Content -Raw path\to\the-key.pem | npx wrangler secret put GITHUB_APP_PRIVATE_KEY`.

Then `curl -i https://enchase.othiagosilva.com.br/api/suggestions` answers `200` with `content-type: application/json`, and `curl -i https://enchase.othiagosilva.com.br/api/session` answers `{"user":null}`. Before the Worker is deployed, the same addresses answer the page of the site, and the site reads GitHub from the browser.

`npx wrangler tail` shows the reason of a 502, and `npx wrangler deploy --dry-run` builds the Worker without publishing it.

## Tests

The tests are in `src/tests/worker/` and run with `npm run test`. `tsconfig.worker.json` type-checks the Worker without the DOM, so the code that it shares with the site cannot reach for `window`.
