# Mistake Log

**Last Updated**: initialized
**Context**: Read at session start to avoid repeating known error patterns.

When the AI is corrected, `log-mistake` appends an entry here.
Entries reaching count 3+ get escalated to AGENTS.md "Things to Avoid".

---

## [2026-04-21] Verify test/runtime compatibility before adopting an ESM-only package API

**Wrong**: Updated `src/app/services/Backup.js` to use `bl` v7 directly without checking that the repo's Jest setup transpiles app code to CommonJS.
**Correct**: Confirm package format compatibility with the project's runtime and test pipeline first; in this repo, avoid top-level `bl` imports in app code or replace the usage with native streams.
**Area**: Dependency upgrades, Jest module resolution
**Prevention**: Before applying a library migration, run or inspect a representative test path that loads the changed module and check whether the repo mixes ESM app code with CommonJS test transforms.
**Count**: 1
