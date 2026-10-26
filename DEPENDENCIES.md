# Dependency rationale and inspection

Planck 1.5.1 (MIT), imported without its testbed, implements rigid-body simulation, collisions and fixed steps. React/react-dom 19.3.1 (MIT) bind controls and rendering lifecycle. Zod validates persisted scores. Fraunces is self-hosted under the OFL. Vite 8.3.5 and TypeScript 7.0.2 provide the build and static checking. The manifest and frozen lockfile are authoritative for versions; some development dependencies and Zod use declared ranges.

The 2026-10-26 maintenance update uses the published Oxforge 0.3.0 maintainability preset with the existing native Oxlint command. This supplies the shared complexity/depth rules and resolves the previous formatter peer-range mismatch. No custom validation runner was added.

Vitest remains the test runner. Testing Library React 16.3.3, Testing Library DOM 10.4.2 and jsdom 30.1.3 are development dependencies for exercising actual React effects, rerenders and cleanup. Physics tests still use actual Planck worlds. A bounded canvas recorder verifies calls without asserting browser pixel output. No browser emulator ships in the production application.

The Workbox build dependency `serialize-javascript` was updated in the lockfile from 7.1.2 to 7.1.3 to address [GHSA-m5mm-p8h7-m29v](https://github.com/advisories/GHSA-m5mm-p8h7-m29v). The advisory concerns serialization of attacker-controlled function objects; no corresponding game input path was demonstrated. Native `pnpm audit` reported zero known advisories after the update. This is dated dependency evidence, not a security guarantee.

Use `pnpm install --frozen-lockfile --ignore-scripts` for the documented install path. A normal install follows `pnpm-workspace.yaml`, whose build allowlist permits esbuild. No dependency source was modified. The game-specific playback controller coordinates requestAnimationFrame, Planck fixed steps, pause state and report delivery; it is runtime domain integration, not an installation or maintenance wrapper.

The browser application does not include the full trending applications. No GPL/AGPL application code was copied. No telemetry, remote provider credentials, arbitrary code evaluation or server-side user file ingestion is present.

Full runtime license texts and upstream source references are collected in `THIRD_PARTY_NOTICES.txt`.
