# Pocket Park

One push, three rings, a soft landing. A tiny momentum puzzle with five parks and a real Box2D-derived physics simulation.

## Try it

Adjust launch angle and push, inspect the dotted physical preview, then Take the line. Collect all rings and rest in the bowl. Pause, restart, undo a tweak, or use a reference hint; try another park and keep a local best time.

Requires **Node 24+** and pnpm. No account, key, model download or external service is needed.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run dev
```

Open **https://pocket-park.localhost**. `pnpm run dev` runs through [Portless](https://github.com/vercel-labs/portless) (a dev dependency); its first run may ask for `sudo` to bind port 443 and trust a local certificate. For a production/offline check:

```sh
pnpm run check
pnpm run preview
```

The production build includes a versioned service worker. After the first successful online/local-server load and activation, the bundled app can reopen without a network connection at that origin. Browser storage and service-worker availability still apply. Dev mode does not install the offline cache.

## Why this library

Planck 1.5.1 (MIT), imported without its testbed, plus self-hosted Fraunces (OFL). It drives real collisions and fixed steps; native geometric art depicts the same fixtures.

Live GitHub Trending evidence was inspected on 2 October 2026 across daily, weekly, monthly and language views. This project does not claim that its core dependency was itself trending or newly released.

## Behavior and limits

This is an abstract puck game, not a realistic skating simulator. Five compact parks share a family of ramps but vary gravity, obstacles and ring trajectories. Ring placement is derived from verified canonical trajectories; hints intentionally reveal those controls. Best times and undo state are local, no global leaderboard. Physics advances at 120 Hz; rendering caps catch-up after hidden-tab stalls. No audio, gamepad or replay export in this prototype.

Unreadable saved progress produces a recovery message. Saved progress is validated. Storage write failures currently leave scores in memory without a warning; they may be lost on reload. Control tweaks can be undone during the current visit. The app makes no external network requests for user data and has no analytics. All parks are synthetic.

## Verification

`pnpm run check` runs lint, Vitest tests, strict TypeScript checks and a production build. CI also runs `pnpm format:check`. The frozen lockfile fixes resolved dependency versions. The install command above disables lifecycle scripts; normal installs follow `pnpm-workspace.yaml`, which allows esbuild's build script.

Tests cover real fixed-step physics, saved-score validation, React playback lifecycle and result presentation. The 2026-10-26 update adds pause/resume, frame cleanup, preview reuse and bounded catch-up regressions. These use jsdom and a canvas command recorder, not browser pixels. Historical desktop/mobile browser evidence remains in the original implementation PR.

The shared Oxforge `maintainability` preset enforces classic cyclomatic complexity at most 9 and nesting depth at most 3 through the existing lint command. See [architecture and verification](docs/architecture.md) for measurements, API contracts and remaining test gaps.

## Deployment configuration

The live app is hosted on [Vercel](https://pocket-park.vercel.app), the sole deployment target. Vercel builds the Vite app with `pnpm build` and serves `dist/`. Security headers are configured in `vercel.json` using [Vercel's native headers configuration](https://vercel.com/docs/project-configuration/vercel-json#headers).

## Code map

- `src/app.tsx`: state composition and user workflow.
- `src/physics.ts`: Planck worlds, park geometry, scoring and saved-score validation.
- `src/playback.ts`: animation-frame ownership, bounded fixed steps and pause/resume.
- `src/playfield.tsx`: React canvas lifecycle and memoized previews.
- `src/renderer.ts`: ordered canvas drawing of simulation geometry.
- `src/run-result.tsx` and `src/styles.css`: result presentation and responsive layout.
- `test/`: domain, lifecycle, presentation and input-boundary regression tests.
- `vite.config.ts`: `vite-plugin-pwa` generates the Workbox service worker that precaches the build.

See `PRODUCT.md`, `DESIGN.md`, `DEPENDENCIES.md` and `SECURITY.md` for the UI coordinator and future reviewers.
