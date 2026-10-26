# Feature roadmap

Planning baseline: `e236120a960e` on `origin/main`, 2026-10-26. Proposed game releases follow the higher-priority Digits/MCP work.

## Outcome

Make a small change to a launch, understand what it changed, and enjoy finding a better line. The [current game](README.md) already has five parks, a physical preview, reference hints, pause/restart, undo and local best times.

## 1. Compare the last two attempts

Keep the prior attempt's launch settings and a lightweight visual trace available beside the current attempt. Let the player deliberately restore the earlier settings.

Acceptance:

- The comparison labels angle, push, rings collected and finish outcome.
- Both traces come from the same physics and park version.
- Restoring settings does not start playback unexpectedly.
- Reduced-motion and keyboard users can understand the result without replaying animation.

Observe players trying to improve one park. Look for fewer random changes and clearer explanations of why an attempt worked.

## 2. Keep a favorite solution

Allow an explicit local bookmark of a successful launch, with a name and versioned park identity. Show when storage fails and offer retry or export before implying it is saved.

Acceptance: a reload can reproduce a compatible saved launch; incompatible versions are explained rather than replayed as if equivalent.

## 3. Add a small challenge set

Add a few parks with distinct, verified physical solutions after the comparison loop is useful. Keep hints optional and introduce one idea at a time.

## Boundaries

No network leaderboard, accounts, analytics or generated level service is needed. Preserve the existing playback ownership and deterministic fixed-step behavior; use native tests for physics and lifecycle contracts. Value is a satisfying improvement the player understands, not the number of trajectories simulated or minutes spent.
