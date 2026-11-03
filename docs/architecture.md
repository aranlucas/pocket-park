# Architecture and integration contracts

Physics stays independent of React and browser storage so the same Planck simulation can power previews, playback and Node tests. Playback owns the animation clock; React owns controls and persistence; rendering depicts the simulated geometry. Keep these boundaries when extending the game.

## Physics

The exported types and signatures live in [src/physics.ts](../src/physics.ts). Integration relies on these contracts:

- `basePark` returns a fresh layout without rings; `makeParks` derives rings from each canonical trajectory. Treat the supplied park geometry as immutable for the lifetime of a run: `createRun` retains it rather than cloning it.
- `launch` accepts finite angles 5–70 and strengths 8–22. Invalid input throws only for a ready run; repeat launches are ignored.
- `step` advances rolling runs at the shared 120 Hz fixed step. Ready and terminal runs do not mutate. `simulate` uses the same step and launch validation, with a bounded synchronous loop.
- Ring collection uses distance to the swept segment between positions so fast movement cannot skip rings. Landing requires every ring and at least 0.3 seconds below speed 1.5 inside the goal. Leaving the goal or reaching that speed resets the rest timer. Landing takes precedence over a bounds/time failure on the same step.

## Playback and rendering

[startPlayback](../src/playback.ts) immediately draws and reports the run, then owns at most one animation-frame request. Only rolling, unpaused runs schedule frames. Callers must provide synchronous, nonthrowing draw/report callbacks. Reports arrive on status or ring-count changes, including the final simulation time, rather than on every clock tick.

`setPaused` cancels the frame; resume establishes a fresh clock baseline without counting paused wall time. Active catch-up is capped at 50 ms per frame, retaining the sub-step fraction. `dispose` permanently cancels playback and is safe to repeat. Replacement or unmount must dispose the previous controller, including under React StrictMode.

[Playfield](../src/playfield.tsx) caches previews by park and launch controls. Launch, reset and pause should reuse that simulation. Keep [rendering](../src/renderer.ts) free of simulation mutation; the visible terrain must match the collision fixtures.

## Persistence

`readProgress` decodes version-one saved scores. Empty input returns no scores; malformed JSON, invalid schema or unknown park IDs throw for the UI to recover. Controls use the launch ranges; saved time must be finite, positive and at most 12 seconds. The UI replaces a best record only with a faster landed run.

Storage and offline failure behavior, including silent write/registration failures, is documented in [SECURITY.md](../SECURITY.md).

## Verification limits

Use the [existing checks](../README.md#verification-and-offline-preview). Component tests use actual React effects and Planck with a controlled animation clock and canvas command recorder. They do not establish browser pixel correctness, focus behavior, accessible announcements or offline activation/update behavior.

Coverage still needed before relying on those flows: full App hint/launch/landing/reload, keyboard/undo/park changes, blocked storage reads/writes, and browser offline reload/update. Physics boundary cases include a missing ring while resting, exact goal edges, rest reset on exit and time-limit precedence. Persistence currently accepts numeric aliases for park keys and has no explicit JSON byte/count cap.
