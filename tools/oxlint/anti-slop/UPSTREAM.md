# Provenance

Source: https://github.com/dmmulroy/anti-slop

Exact commit: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`. Production assets copied unmodified from `skills/install-anti-slop/assets/anti-slop/` to `tools/oxlint/anti-slop/`. Root MIT license and nested ESLint Stylistic LICENSE/UPSTREAM.md are preserved.

## Integration

Oxlint and @oxlint/plugins are both exactly 1.86.0. All 18 generic custom rules plus native oxc/no-accumulating-spread are enabled. No direct Effect dependency exists, so Effect remains unregistered. Existing package manager, CI triggers, security checks and formatting commands are preserved.

Type-guard-only runtime typeof checks are enabled with the upstream allowInTypeGuards option; no inline rule exceptions. Pending PR #3 UI changes are not included: this patch starts from main. Local test/build validation is blocked by npm dependency tarball HTTP403 (Planck unavailable); CI performs the complete install and checks.

Initial diagnostic counts: {"anti-slop(no-known-value-widening)": 1, "anti-slop(no-runtime-typeof)": 1, "anti-slop(require-readable-spacing)": 118, "anti-slop(require-safety-comment-for-type-assertion)": 2, "eslint(no-unused-expressions)": 1}. Final lint: zero diagnostics using the matching, already verified local toolchain. No deployment or merge.
