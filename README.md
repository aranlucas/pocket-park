# Pocket Park

One push, three rings, a soft landing. A tiny momentum puzzle with five parks and a real Box2D-derived physics simulation.

Adjust launch angle and push, inspect the dotted physical preview, then Take the line. Collect all rings and rest in the bowl. Pause, restart, undo a tweak, or use a reference hint; try another park and keep a local best time.

## Local development

Requires **Node 24.8+** and **pnpm 12.14.0** (see [package.json](package.json)). No account, key, model download or external service is needed.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev
```

Open the URL printed by the dev command: normally **https://pocket-park.localhost**, with a branch subdomain in linked worktrees. The command uses [Portless](https://github.com/vercel-labs/portless); its first run may ask for `sudo` to bind port 443 and trust a local certificate.

## Verification and offline preview

```sh
pnpm run check
pnpm run format:check
pnpm run preview
```

`check` runs lint, Vitest, TypeScript checks and a production build; CI also checks formatting. Tests exercise real Planck physics and React lifecycle behavior with jsdom and a canvas command recorder, not browser pixels.

The production build generates a service worker. After a successful load and activation at the preview origin, the app can reopen there without a network connection, subject to browser storage and service-worker availability. Dev mode does not install the offline cache. Registration failure is silent; test activation, updates and disconnected reload in a browser before relying on offline support.

Vercel is the configured deployment target: `pnpm build` produces `dist/`, and [vercel.json](vercel.json) defines security headers. Local preview does not reproduce those headers.

## Rationale and further reading

Planck supplies Box2D-derived collisions and fixed stepping without importing its testbed. Zod validates saved scores; Fraunces is self-hosted. Dependency versions belong in the manifest and lockfile; license texts and upstream attribution remain in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).

- [Product and design intent](PRODUCT.md)
- [Proposed feature roadmap](ROADMAP.md)
- [Architecture and integration contracts](docs/architecture.md)
- [Security boundaries, storage failures and reporting](SECURITY.md)
- [Project license](LICENSE)

CI also runs deterministic browser journeys with pinned `e2e` and `@e2e-dev/web` against the production preview. These tests require no model or credentials; reports and failure artifacts are uploaded as `reliability-evidence`. See [the behavior audit](docs/reliability-audit.md) for findings and coverage limits.
