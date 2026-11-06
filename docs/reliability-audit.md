# Correctness and reliability audit — 2026-11-06

## Inventory before implementation

Clean isolated worktree and fetched remote default both at fd7a750 (merged untangle pass). Read all source modules, tests, package/configuration, CI, README, architecture and security policies. Preserve public simulation/playback/progress interfaces, park content and documented storage failure policy. No local tests or builds are run.

The product is a static React/Vite canvas game: five selectable parks, launch controls, hint, undo, pause/resume/restart, ring collection, landing and local best scores. Planck owns collision/stepping; playback bounds frame catch-up and disposes pending frames; React reports outcomes and persists versioned scores through Zod. The generated same-origin Workbox worker provides offline assets. There are no accounts, tenants, server transactions, remote writes or credentials. Untrusted boundaries are restored browser storage, launch numbers and browser event/clock lifecycles.

## Findings from static success/failure tracing

1. **Medium, high confidence: held Space repeatedly changes playback state.** `src/app.tsx:key` processes auto-repeated keydown events. Focus the game container and hold Space: the first event launches; repeats alternate pause/resume, and a repeat after a terminal report launches another attempt. Expected: one launch/pause action per physical press. Ignore repeated Space events while still preventing page scrolling. A component regression must dispatch an initial keydown and repeated events and observe rolling/paused outcomes. Expected results follow the documented Space launch/pause control, not physics internals.
2. **Low, high confidence: final-park success falsely claims every park complete.** `src/run-result.tsx` renders “Every little adventure, complete.” whenever the last park lands. Every park is selectable from startup, so completing only park five triggers this claim. Keep final-park celebration but scope the message to that adventure. A component assertion covers final-park copy; browser coverage selects the last park without completing earlier ones.

## Rejected hypotheses and retained contracts

- Invalid launch values already throw for ready runs, while repeat launches/terminal steps are intentionally inert. Canonical solutions are protected by existing real-Planck tests.
- Pause/disposal races are already guarded and tested, including stale callbacks and StrictMode. No structural playback rewrite is justified.
- Storage read failure resets records with a notice; write failure keeps in-memory records silently. Both are explicit security/product policy. No cross-tab merge or warning requirement is invented.
- Numeric aliases in saved park keys are accepted today and normalize on write. No demonstrated ordinary user loss warrants a format change here. Same-origin storage has no sensitive account boundary; byte caps are not introduced speculatively.
- Physics timeout/rest edge cases and worker registration failures were traced; no reproducible shipped-park defect identified. Browser offline/update behavior remains a coverage limit, not a claimed proven bug.

## Regression and framework plan

Keep existing Vitest, lint, format and build gates. Add deterministic real `e2e` / `@e2e-dev/web` tests against the built preview: hint → launch → pause/resume → all rings/landing → reload/best record; undo/reset/park navigation; direct last-park landing; malformed storage recovery. No model calls or credentials. Registry verified published e2e 0.23.0 and web 0.15.5; engines require Node ^22.22.3 or >=24.8.0. Read upstream quickstart/CI/GitHub Actions and Vite example, then installed package docs/types. Dependencies are requested by the user and chosen for their maintained browser engine and deterministic supported locators.

Demonstrate the new defect assertions against the original two source files in an isolated CI checkout, requiring the expected named assertion failures; run the full corrected suite and production build in normal CI. Upload e2e reports/artifacts. CI results and independent review will be recorded after implementation. No local passing result is claimed.

## Independent review findings

Independent static review identified another concrete keyboard failure: `App.key` excludes buttons/inputs before Escape handling. Launch, click Pause, then press Escape while the Resume button retains focus: the advertised reset does nothing. Handle Escape before the native-control Space guard. Add a focused-button regression and include it in the pre-fix CI failure proof.

## CI follow-up

First CI run 42304931157 failed at lint before tests/build: native readable-spacing rules, prohibited module mocking in the new keyboard tests, and browser role queries belonging to the `screen` fixture. Corrected those queries to the supported fixture and replaced the Playfield mock with real App/Playfield effects, a canvas method recorder and a pending animation-frame stub. The regression assertions and pre-fix proof are retained. Independent final static review found no remaining worthwhile behavior objections. Validation remains CI-only.
