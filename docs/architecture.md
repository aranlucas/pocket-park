# Architecture and verification

Pocket Park is a single-screen React game. It has no server API or shared account state. Controls create a Planck run; the playback controller advances it at 120 Hz; the renderer draws that same geometry; React receives ring/status transitions and the final time. Best scores persist locally.

## Module boundaries

| Module               | Responsibility and contract                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/main.tsx`       | Mount React in StrictMode and register the production service worker after load. Missing root is fatal; service-worker registration failure is currently silent.                                                                                 |
| `src/app.tsx`        | Own park selection, controls, bounded undo history, attempt identity, pause state and local best records. Control changes reset the attempt. Successful runs replace a best record only when faster.                                             |
| `src/physics.ts`     | Own geometry, Planck worlds, deterministic stepping, ring collection, terminal conditions and persisted-score validation. No React or browser-storage dependency.                                                                                |
| `src/playback.ts`    | Own the frame request and clock for one run. Convert elapsed wall time into bounded fixed steps, draw, then notify only when status/ring count changes.                                                                                          |
| `src/playfield.tsx`  | Bind canvas and controller lifetime to the selected park, controls and attempt. Cache the preview by park/angle/strength, so launch/reset reuse it. Update report/pause refs through effects and dispose the previous controller on replacement. |
| `src/renderer.ts`    | Draw background, terrain, trajectory, rings, goal and puck in that order. Drawing helpers share the canvas but do not advance physics.                                                                                                           |
| `src/run-result.tsx` | Render accessible status, collected rings, best time and progression actions. It owns no simulation or persistence state.                                                                                                                        |
| `vite.config.ts`     | Use the maintained Vite PWA plugin to generate Workbox precaching. The manifest remains in `public/`; registration is owned by `main.tsx`.                                                                                                       |

The dependency direction keeps physics usable in Node tests, playback independent of React and presentation independent of both. Additional service layers or a general event bus would add little value at this scale. The renderer's layer helpers and the physics step phases are the natural extension points.

## Public domain APIs

| API                                                           | Inputs, outputs and failures                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basePark(id): Park`                                          | IDs 0–4 return fresh geometry without rings. Unknown IDs throw.                                                                                                                                                                                                                                |
| `createRun(park): Run`                                        | Allocate a new independent Planck world and ready puck. The supplied park is retained, so treat park geometry as immutable during a run.                                                                                                                                                       |
| `launch(run, angle, strength)`                                | Mutate a ready run to rolling. Finite angle 5–70 and strength 8–22 are required. Invalid ready-run input throws; repeat launches are ignored.                                                                                                                                                  |
| `step(run)`                                                   | Advance a rolling world by `FIXED_TIME_STEP = 1/120`, collect swept rings, record a bounded trail, update goal rest and choose terminal state. Ready/terminal runs do not mutate.                                                                                                              |
| `simulate(park, angle, strength): Run`                        | Run a fresh launch synchronously, stopping on terminal state or after at most 1,442 steps. Return its complete observable state. Input validation is shared with `launch`.                                                                                                                     |
| `makeParks(): Park[]`                                         | Construct five fresh parks, simulate canonical controls and place three rings along measured trajectories.                                                                                                                                                                                     |
| `pointSegmentDistance(p, a, b): number`                       | Compute the closest distance to a closed segment, including zero-length segments. Used for swept collection rather than point-only collision checks.                                                                                                                                           |
| `readProgress(text): Progress`                                | Empty input returns `{}`. Parse version-one JSON and validate finite controls, positive time at most 12 seconds and park IDs 0–4. Invalid JSON/schema/IDs throw for the UI to recover.                                                                                                         |
| `startPlayback(run, draw, report, initiallyPaused): Playback` | Immediately draw/report the run. Only rolling, unpaused runs schedule a frame. `setPaused` cancels or resumes without accumulating paused wall time; `dispose` permanently cancels. Reports include status, ring count and simulation time. Callers provide synchronous nonthrowing callbacks. |
| `render(ctx, run, preview?)`                                  | Draw a 960×450 logical canvas without mutating the run. Prefer the actual trail when present, otherwise the supplied preview.                                                                                                                                                                  |

Landing requires all rings and at least 0.3 seconds of rest below speed 1.5 inside the goal. Goal damping, bounds and time-limit ordering are preserved. A run leaving the position bounds or exceeding 12 seconds misses unless the landing condition wins first on that same step.

## Complexity and performance evidence

Measured with Oxlint 1.89.0, `eslint/complexity` using the classic convention. Logical expressions, ternaries, loops, conditionals, catches, defaults and optional chaining contribute according to that implementation. An `else` alternative is not an additional classic decision by itself.

| Function                   | Before | After | Change                                                                                                   |
| -------------------------- | -----: | ----: | -------------------------------------------------------------------------------------------------------- |
| Animation callback `frame` |     11 |     3 | Separate clock advancement, scheduling, notification and cancellation; paused runs schedule no callback. |
| `step`                     |     17 |     2 | Extract swept collection, trail sampling, rest updates and terminal-state selection.                     |
| `render`                   |     20 |     2 | Extract six ordered drawing layers. The default preview argument still contributes one decision.         |
| `App`                      |     16 |     6 | Move result presentation and status text into `RunResult` and a focused message helper.                  |

All source functions now score at most 8; all extracted helpers remain below 10. The existing `pnpm lint` command extends Oxforge's published `maintainability` preset, enforcing classic complexity at most 9 and nesting depth at most 3 across the repository. No wrapper script is needed.

Decomposition reduces decisions a reader must hold inside one function, not the number of gameplay choices. Source functions increased from 50 to 73 and their summed scores from 158 to 187, partly because every function contributes a base path and the playback controller now expresses lifecycle ownership explicitly. Do not interpret the lower maximum as a reduction in total program behavior.

Two measured runtime improvements are independent of the complexity score:

- Launching a canonical preview previously repeated its entire 310-step simulation. The memoized preview now reuses that work when only attempt/pause state changes; changing controls still computes a new physical preview.
- Paused playback previously retained a recurring animation-frame callback. It now owns zero scheduled frames, draws nothing and advances no physics while paused. A resumed frame establishes a fresh time baseline. Active catch-up is capped at 50 ms per frame, with any retained sub-step fraction carried forward.

Before/after fingerprints match exactly for 565 sampled trajectories across five parks: canonical controls plus a grid covering angles 5–70 and strengths 8–22. Compared fields were status, time, collected rings, trail, position, velocity and rest. This is deterministic equivalence evidence for those samples, not an exhaustive proof or a browser frame-rate benchmark.

## Native verification and remaining tests

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
pnpm format:check
pnpm peers check
pnpm audit
```

The 20 Vitest cases cover canonical wins, deterministic and failed launches, swept distance, invalid controls/progress, terminal immutability, preview reuse, pause/resume, catch-up bounds, final-time reporting, cancellation of frame ID zero, StrictMode replay, callback replacement and result/progression presentation. Component tests use actual React effects and Planck with a controlled animation clock. A bounded canvas recorder exercises drawing calls without claiming browser pixel correctness.

Prioritize these remaining tests and improvements:

1. Full App workflows: hint → launch → landing → persisted best → reload; keyboard launch/pause/reset; undo and park changes; blocked storage reads and writes. Write failures need a visible persistence notice without interrupting play.
2. Browser offline registration, first activation, update and disconnected reload. Surface registration failure instead of silently implying offline readiness.
3. Real desktop/mobile canvas rendering, focus behavior and accessible status announcements. Historical browser evidence is not a new visual regression run.
4. Physics boundaries: missing one ring while resting, exact goal edges, rest reset on exit, time-limit precedence and zero-length swept segments.
5. Persistence aliases and bounds: the current decoder accepts noncanonical numeric spellings of a park key and has no explicit JSON byte/count cap. These are local robustness concerns, not a demonstrated remote exploit.

The production build still reports a JavaScript chunk over Vite's 500 kB warning threshold. Measure load/interaction on target devices before introducing code splitting or off-main-thread physics; no measured frame-rate or memory leak claim is made here. There are no custom setup, validation or maintenance scripts to replace in the maintained project.
