# Security boundaries

Pocket Park is a browser game with synthetic park geometry and local best scores. It has no account system, server API, upload endpoint, file picker, analytics or external data provider. Source visibility is separate from local data storage: do not put secrets in this repository or assume that it is private.

The Vercel configuration restricts connections and scripts to the app origin, disallows framing and disables camera, microphone and location permissions. These are deployment configuration claims, not proof of headers on every possible host. Local preview hosting does not automatically reproduce Vercel headers.

Saved scores use the browser profile's unencrypted localStorage. Zod validates the version, finite control/time ranges and park IDs when restoring scores. A malformed record resets the restored scores and produces a notice. Write failures currently keep scores in memory without warning. The parser has no explicit input-byte limit; local storage and same-origin scripts are the relevant boundary. There is no sensitive record or cross-user authorization boundary in the game.

Simulation is bounded by a fixed step and terminal time/position conditions. Live playback caps elapsed catch-up per frame at 50 ms, owns one animation-frame request and cancels it on pause or unmount. Ready and terminal runs schedule no further frames. This limits simulation work; it is not a general browser resource quota.

Production offline support uses a same-origin generated Workbox service worker. Registration errors are currently swallowed, so successful online play alone does not prove offline availability. Browser-level offline/update tests remain necessary.

The documented `--ignore-scripts` install disables lifecycle scripts for that command. Normal installs use the workspace build allowlist, which permits esbuild. CI action references are pinned; `pnpm-lock.yaml` fixes resolved package versions, including dependencies declared with ranges. Recheck advisories with `pnpm audit`; a zero-advisory result does not prove absence of vulnerabilities.

Report security issues through a private maintainer channel when available. Do not put credentials or personal browser data in public issues. This project has no public security support SLA.
