# Knowledge Base

Curated docs to reduce token usage and improve agent accuracy.
Load ONLY documents relevant to your current task.

## How to Use

1. Read this index
2. Identify matching documents for your task
3. Load only those documents
4. Undocumented pattern discovered? Run `document-solution`

## Index

### Architecture

| Document | When to Read |
|----------|--------------|
| [project-overview](architecture/project-overview.md) | Any task — covers project purpose, folder layout, entry points, plugin system, API, deployment |
| [job-queue-system](architecture/job-queue-system.md) | Working on async jobs, message ordering, worker logic, or feature flags |
| [express-conventions](architecture/express-conventions.md) | Working with Express routes, middleware, or configuration |
| [typescript-conventions](architecture/typescript-conventions.md) | Writing TypeScript code |

### Features

| Document | When to Read |
|----------|--------------|
| | |

### Integrations

| Document | When to Read |
|----------|--------------|
| [bl-v7-bufferliststream-upgrade](integrations/bl-v7-bufferliststream-upgrade.md) | Upgrading `bl` to v7 in this repo or fixing backup/archive code that Jest loads |
| [cra-to-vite-migration](integrations/cra-to-vite-migration.md) | Migrating from CRA (`react-scripts`) to Vite/Vitest, or debugging JSX parse errors / mock failures in Vitest on a `.js`-extension codebase |

### API

| Document | When to Read |
|----------|--------------|
| | |

### Bug Fixes

| Document | When to Read |
|----------|--------------|
| | |

### AI Patterns

| Document | When to Read |
|----------|--------------|
| [mistake-log](ai-patterns/mistake-log.md) | Session start — avoid repeated errors |
| [trigger-log](ai-patterns/trigger-log.md) | Observability for trigger executions |
| [TRIGGER-CHECKLIST](TRIGGER-CHECKLIST.md) | Quick reference: when to fire each skill, session-start checklist |
| [UPGRADING](UPGRADING.md) | Upgrading the framework in a consumer repo |

### Sessions

| Document | When to Read |
|----------|--------------|
| [sessions/](sessions/) | Continuing paused work |

## Adding Documents

Kebab-case filenames. Place in appropriate category folder.
Each doc must include: **Last Updated**, **Context**, and content sections.

Categories: `architecture/`, `features/`, `integrations/`, `api/`, `bugfixes/`, `ai-patterns/`, `sessions/`
