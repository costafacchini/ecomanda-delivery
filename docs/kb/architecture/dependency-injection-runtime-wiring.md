# Dependency Injection Runtime Wiring

**Last Updated**: 2026-04-27
**Context**: Read when executing `.plans/dependency-injection`, removing concrete repository allocation from queries/reports/helpers, or migrating controller specs from `mongoServer` to `installMemoryRepositories()`.

---

## Overview

The dependency-injection plan only works correctly on top of the post-`decouple-mongo` `main` branch, where injectable repositories and the memory test harness already exist.

When advancing the remaining DI work:
- query/report/helper classes should only receive repositories from callers
- route files, websocket entrypoints, and schedule scripts should own concrete wiring
- controller spec migration off `mongoServer` depends on the memory harness matching enough Mongoose query behavior

---

## The Problem

### Symptoms

- Query and report classes still hide `new *RepositoryDatabase()` calls inside constructors or helper functions.
- Runtime entrypoints such as websocket report modules and `schedule-*.js` scripts are not treated as composition roots, so wiring is split across layers.
- Controller specs cannot fully leave `mongoServer` when the memory harness does not emulate the Mongoose behavior those routes exercise.
- A stale feature branch can make the plan look blocked because it is missing the prerequisite repository-injection work already present on `main`.

### Root Cause

The original dependency-injection plan was written before the `decouple-mongo` work landed. Later repository abstractions and memory-repository helpers were added on `main`, but older plan branches still contained pre-requisite gaps. At the same time, some query/report code paths and controller tests still assumed concrete Mongoose-backed behavior.

---

## The Solution

### Key Files

| File | Role |
|------|------|
| `src/app/queries/BillingQuery.js` | Query now receives repositories from the caller instead of allocating them internally |
| `src/app/queries/LicenseeMessagesByDayQuery.js` | Same pattern for message/day aggregation |
| `src/app/reports/MessagesSendedYesterday.js` | Report now depends on injected repositories |
| `src/app/websockets/reports/billing/index.js` | Composition root for billing report wiring |
| `src/app/websockets/reports/message/index.js` | Composition root for message/day report wiring |
| `schedule-messages-sended-yesterday.js` | Schedule entrypoint wiring for the report |
| `src/app/repositories/testing.js` | Memory repository installer and Mongoose-like query adapter for controller specs |
| `src/app/repositories/repository.js` | Shared in-memory filter/sort matching used by the harness |

### Runtime Pattern

Remove concrete repository defaults from query/report classes and pass dependencies explicitly:

```js
class BillingQuery {
  constructor(reportDate, { licenseeRepository, messageRepository } = {}) {
    this.reportDate = reportDate
    this.licenseeRepository = licenseeRepository
    this.messageRepository = messageRepository
  }
}
```

Wire concrete implementations only in runtime entrypoints:

```js
const licenseeRepository = new LicenseeRepositoryDatabase()
const messageRepository = new MessageRepositoryDatabase()

const report = new MessagesSendedYesterday({
  licenseeRepository,
  messageRepository,
})
```

### Controller Spec Migration Pattern

Use the memory harness at the beginning of the suite and restore it at the end:

```js
beforeAll(() => {
  installMemoryRepositories()
})

afterAll(() => {
  resetMemoryRepositories()
})
```

Seed through models or repository classes as usual. During installation, database repository prototypes and selected model statics are patched to memory-backed adapters, so existing test code can often stay mostly unchanged.

---

## Gotchas

### Start From `main`, Not a Stale Plan Branch

If `.plans/dependency-injection` looks inconsistent with the current codebase, confirm the branch contains the `decouple-mongo` prerequisite work. The plan may need a fresh execution branch from `main` before more DI tasks are realistic.

### The Memory Harness Needs Mongoose-Like Chaining

Controller and query code often expects `find`, `findOne`, `findById`, `where`, `sort`, `skip`, `limit`, `populate`, `countDocuments`, `exec`, and promise-style `then`. Missing any of these can make a spec look like a DI failure when it is actually a harness gap.

### Filter Matching Must Handle Real Route Input Shapes

Route tests often pass booleans as query strings and use `RegExp` filters. The in-memory matcher must normalize those values or controller migrations will fail with false negatives.

### Aggregation Is a Separate Parity Problem

`LicenseeMessagesByDayQuery` relies on grouped message counts by licensee/day. The memory harness needs a custom aggregate adapter for that path; generic `find`/`where` support is not enough.

### Controller Migration Depends on Harness Parity

The full controller suite can run on `installMemoryRepositories()` once the harness covers:
- schema defaults and validation during create/update
- ObjectId cast failures for invalid route params
- relation population for controller paths that transform carts, templates, triggers, and nested report data
- repository-level seams for error-path tests that previously spied on raw Mongoose internals

If controller migrations regress later, check `src/app/repositories/testing.js` and `src/app/repositories/repository.js` first before assuming the controller DI wiring is wrong.

### Combined Jest Runs May Hang on Open Handles

Targeted suites can pass and still keep Jest alive. If the result is already understood and you only need a clean verification signal, rerun the targeted command with `--forceExit`. Use `--detectOpenHandles` when you need to trace the leak.

---

## Related

- [project-overview](project-overview.md)
- [express-conventions](express-conventions.md)
