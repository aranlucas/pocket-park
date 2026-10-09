# Pocket Park

One push, three rings, a soft landing. A tiny momentum puzzle with five parks and a real Box2D-derived physics simulation.

## Try it

Adjust launch angle and push, inspect the dotted physical preview, then Take the line. Collect all rings and rest in the bowl. Pause, restart, undo a tweak, or use a reference hint; try another park and keep a local best time.

Requires **Node 24+** and npm. No account, key, model download or external service is needed.

```sh
npm ci --ignore-scripts
npm install -g portless@0.15.7
npm run dev
```

Open **https://pocket-park.localhost**, or the URL printed by Portless. For a production/offline check:

```sh
npm run check
npm run preview
```

The production build includes a versioned service worker. After the first successful online/local-server load and activation, the bundled app can reopen without a network connection at that origin. Browser storage, file and codec support still apply. Dev mode does not install the offline cache.

### Development URL with Portless

The normal `npm run dev` command uses
[Portless](https://github.com/vercel-labs/portless/tree/v0.15.7) for a stable local URL.
Install its CLI once with **Node.js 24 or newer** (within this project's supported
range), then run:

```sh
npm install -g portless@0.15.7
npm run dev
```

Open **https://pocket-park.localhost** with the default proxy settings.
Portless starts its shared proxy automatically. Its first HTTPS run creates and
trusts a local certificate authority and may prompt for administrator privileges
to bind port 443 or update local hostname entries. Start it from an interactive
terminal and review those prompts. `portless doctor` diagnoses local setup issues.

Portless supplies Vite with a free port, a loopback host, and `--strictPort`.

Linked Git worktrees receive a branch-name prefix, such as
`https://fix-ui.pocket-park.localhost`; use the URL Portless prints.
Use `npm run dev:direct` to run the original localhost server without Portless.

Browser storage and offline caches belong to each origin. Existing data at a
numbered localhost URL stays there; use the app's export/import flow when available
to move data to the named URL.

## Why this library

Planck 1.5.0 (MIT), imported without its testbed, plus self-hosted Fraunces (OFL). Related non-trending mature library chosen from the creative geometry thread around live OpenCADStudio. It drives real collisions and fixed steps; native geometric art depicts the same fixtures.

Live GitHub Trending evidence was inspected on 2 October 2026 across daily, weekly, monthly and language views. This project does not claim that its core dependency was itself trending or newly released.

## Behavior and limits

This is an abstract puck game, not a realistic skating simulator. Five compact parks share a family of ramps but vary gravity, obstacles and ring trajectories. Ring placement is derived from verified canonical trajectories; hints intentionally reveal those controls. Best times and undo state are local, no global leaderboard. Physics advances at 120 Hz; rendering caps catch-up after hidden-tab stalls. No audio, gamepad or replay export in this prototype.

Local browser storage failures produce a recovery message. Saved progress is validated. Control tweaks can be undone during the current visit. The app makes no external network requests for user data and has no analytics. All parks are synthetic.

## Verification

`npm run check` runs meaningful core tests, strict TypeScript checks and a production build. CI repeats these on Node 24 and audits production dependencies. Runtime pins and the lockfile make installs reproducible; lifecycle scripts are disabled. Desktop/mobile browser evidence and interaction notes are recorded in the implementation PR.

## Deployment configuration

`wrangler.toml` targets Cloudflare static assets; `railway.json` describes a Vite preview process. Both are **configuration only**. Nothing has been provisioned or deployed. Hosting requires a separate decision about access and provider terms.

## Code map

- `src/App.tsx`: state composition and user workflow.
- Domain modules in `src/`: pure calculations / media / physical rules.
- Rendering components and `styles.css`: native interface and responsive layout.
- `tests/`: core behavior and input-boundary regression tests.
- `scripts/offline.mjs`: build-specific cache manifest.

See `PRODUCT.md`, `DESIGN.md`, `DEPENDENCIES.md` and `SECURITY.md` for the UI coordinator and future reviewers.
