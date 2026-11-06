# Untangle decision log — 2026-11-06

## Inventory before edits

Starting point: clean worktree at c4d223f. Read every source, test, documentation and configuration file. Preserve the recent playback lifecycle, documentation and test-pruning decisions. Both optional additions selected: remove redundant comments and assess tests by observable regressions. No local tests, benchmarks or builds are authorized; use CI only. No owned local test processes were found.

## Design and findings

- Separate immutable park layouts, simulation, park assembly and saved scores by responsibility. Park assembly may depend on simulation; simulation must not depend on park assembly or persistence.
  - `physics.ts` combines Planck stepping, five layouts and Zod persistence. Storage-only changes require loading the simulation module.
  - Parallel name/description/solution arrays and ID-specific obstacle branches hide one park definition across several locations.
  - App imports saved-score parsing and park construction from the simulation module.
- Give shared launch bounds and simulation duration one owner; derive park counts from the catalog and ring counts from the active park.
  - Angle/strength limits appear independently in physics, Zod and range controls.
  - Timeout and synchronous simulation iteration bound must change together.
  - Five parks / final index four are repeated in creation, UI and progress validation; three rings are repeated in canvas labels and results.
  - App imports the playback report through Playfield's incidental re-export.
- Use standard sequential GitHub Actions steps for CI validation.
  - Replace the parallel validation group with sequential steps to respect the requested memory limits. Existing main CI has a successful run; no baseline CI failure is claimed.
- Remove comments that paraphrase function bodies. Keep lifecycle contracts, storage/offline failure policy and recorder limitations where they carry caller or external information.
- Preserve meaningful tests. The existing suite protects canonical solutions, bad launches, determinism, swept geometry, terminal immutability, playback lifecycle and result progression. Split storage tests from physics and remove engine-specific JSON error wording (malformed JSON must fail regardless of runtime message).

## Retained special cases and boundaries

- Park-specific geometry is content, represented with its park definition rather than ID conditionals.
- Ignore repeat launches and steps on terminal runs: lifecycle contract.
- Zero-length distance segments and clamped frame deltas: mathematical/clock boundaries.
- Storage read recovery and silent write/worker-registration failures: documented product policy, retained.
- Playback pause/disposal guards, ready preview, conditional status messages and final-park completion: required user behavior.
- Canvas dimensions and decorative flag/goal artwork describe the fixed scene; no speculative renderer framework.
- No generic geometry dependency added: existing swept-segment calculation is small game glue around Planck; collision/stepping remain in Planck and score validation remains in Zod.

## Validation and review

Implementation separates catalog, ring assembly, simulation, shared rules and saved-score encoding/decoding. New tests cover independent mutable layouts, saved-control/time boundaries, final-park restoration and variable ring totals. Expected values come from existing playable contracts. No tests removed; malformed JSON no longer depends on engine wording.

First independent static review found remaining persistence-format ownership, duplicate launch defaults and count-specific completion copy. Consolidated score key/version/encoding, shared App defaults and made completion wording count independent. This is the only visible copy change. Geometry, launch defaults and stored format remain unchanged.

First review also identified an inert reduced-motion scroll override (no smooth scrolling exists) and a layout-restating CSS comment; removed both. A saved-format round-trip regression protects the consolidated encoder.

Final independent static re-review found no remaining worthwhile structural issues or introduced regressions. Tests will run only in CI. No baseline test result is claimed.
