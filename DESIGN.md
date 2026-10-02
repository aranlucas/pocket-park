# Design handoff

Pocket Park follows a violet/chalk/coral side-view game concept generated and inspected in this task. Native geometric canvas art shows the actual physics fixtures, rings and puck. The physics preview is measured, and the large launch button is the central interaction hook.

Tokens: violet `#443678`, chalk `#fff2c6`, coral `#f59383`, mint `#a5d5be`, muted `#d0c2e5`. Self-hosted Fraunces supplies the playful heavy serif title; system sans and Georgia organize controls. Mint marks success and the next-park action. Native labeled sliders, focus rings, status text and stars accompany visual state.

Impeccable context, new-work, craft-floor and init guidance were applied. The detector's sole warning was the overused Fraunces family. It is retained deliberately for fidelity to the already-generated reference; a separate UI pass may replace it, but should preserve the rounded heavy serif silhouette. This is a documented style choice rather than an unreported detector failure.

Intentional differences from the concept: ramps depict real Planck fixture coordinates; ring paths derive from tested reference trajectories; completion requires actual ring collection and a resting landing. It is an abstract puck puzzle, not a realistic skate simulation. Five parks vary gravity, obstacles and flight shape. Hints reveal a reference line rather than faking an AI solution.

Bounded review: all five canonical solutions pass fixed-step simulation tests; a poor launch misses; swept ring collection is tested; browser pause/resume, a three-ring landing and persisted best time pass. Desktop 1536×1024 and mobile 390×844 screenshots are in the task's `output/playwright/` folder. No mobile horizontal overflow was observed. On mobile, the arena is letterboxed and controls stack below it. There is no audio/gamepad/replay export.

For the separate UI coordinator: keep `src/physics.ts` independent of React and retain the 120 Hz fixed step, collision geometry, hidden-tab catch-up bound, swept rings and soft-landing condition. `renderer.ts` should continue drawing the same geometry that is simulated.
