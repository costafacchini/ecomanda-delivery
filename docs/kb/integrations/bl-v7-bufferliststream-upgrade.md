# bl v7 Jest Compatibility

**Last Updated**: 2026-04-21
**Context**: Upgrading `bl` to v7 in this repo or fixing backup/archive code that is loaded by Jest

## Overview
- `bl` v7 is ESM-only.
- This repo runs app code as ESM in Node, but Jest transpiles app files to CommonJS via `babel-jest`.
- A top-level `import 'bl'` inside application code can therefore fail in tests even if it works in direct Node ESM execution.

## Key Concepts
- Prefer native Node streams when the code only needs to accumulate archive output into a `Buffer`.
- Keep the archive lifecycle explicit: collect chunks, wait for the writable stream `finish` event, then `Buffer.concat()`.
- Attach `error` handlers to the archive, input stream, and output stream.

## How It Works
1. `backup()` now waits for `zipBackup(file)` before calling `upload()` in `src/app/services/Backup.js:18`.
2. `zipBackup()` uses a native `Writable` to collect archive chunks in `src/app/services/Backup.js:30`.
3. The input file stream is appended to the archive, the archive is piped to that writable collector, and `archive.finalize()` is started in `src/app/services/Backup.js:42`.
4. The `Promise` resolves on the writable stream `finish` event and rejects on archive, input, or output stream errors in `src/app/services/Backup.js:38`.

## Common Pitfalls
- Importing `bl` at module scope in code paths that Jest loads can break test bootstrap because Jest resolves it through a CommonJS path.
- Treating `archive.finalize()` as if the output buffer were already ready causes a race with `upload()`.
- Missing stream `error` listeners can hide failures and leave the backup job hanging.

## Related
- [project-overview](../architecture/project-overview.md)
- [express-conventions](../architecture/express-conventions.md)
