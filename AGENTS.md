# Repository Guidelines

## Project Structure & Module Organization
Backend code lives in `src/`: `app/` hosts controllers, services, repositories, and models wired through `_moduleAliases`; `config/` centralizes DB, queue, and auth settings; `setup/` keeps shared bootstrap helpers. Entry points are `server.js` (HTTP), `worker.js` (BullMQ), and the `schedule-*.js` maintenance scripts. The React app resides in `client/` with its own `package.json`. Store new Jest suites alongside their targets as `*.spec.js`.

## Build, Test, and Development Commands
- `yarn start`: production-style server boot.
- `yarn dev`, `yarn dev:server`, `yarn dev:worker`: start Docker plus nodemon-watched API and worker; `Ctrl+C` stops compose.
- `yarn build`: install and build the React bundle in `client/`.
- `cd client && yarn start`: run the React dev server against the local API.
- `docker compose up --build`: seed Mongo, Redis, and supporting services used by the scripts.
- `yarn linter`: apply ESLint/Prettier to `src/app`, `src/config`, and `src/setup`.

## Coding Style & Naming Conventions
Target Node 24.x with native ES modules. ESLint 9 (Standard + Prettier) enforces 2-space indents, single quotes, no semicolons, camelCase for functions/variables, PascalCase for classes, and kebab-case for scripts. Prefer async/await, push heavy logic into services or repositories, and import via aliases such as `@models/ChatMessage.js`. Run `yarn linter` before publishing work.

## Testing Guidelines
Jest powers backend suites. `yarn test` is the local loop, `yarn test:ci` matches the pipeline, and `yarn test:coverage` refreshes the HTML report in `coverage/`. Name files with the `.spec.js` suffix (e.g., `ResetChats.spec.js`) beside the code under `src/app/...`. Use helpers in `src/setup/` to launch `mongodb-memory-server`, seed fixtures, and await queue flushes or fake timers before asserting asynchronous flows.

## Commit & Pull Request Guidelines
Use the established imperative format with optional PR references, e.g., `Fix location message render (#2386)` or `Update dependency mongodb-memory-server to v10.4.0 (#2383)`. Keep commits scoped, update tests, and confirm `yarn linter` plus `yarn test` succeed. Pull requests must summarize the change, note impacted surfaces (`server`, `worker`, `client`), link to tickets, and attach screenshots or payload samples when altering chat flows.

## Environment & Security Tips
Copy `.env.example` to `.env`, fill only what you need, and avoid committing credentials. Run `docker compose up -d` before dev or test work so Mongo, Redis, and queues are reachable. Cron scripts (`schedule-*.js`) depend on those services and on consistent timezone variables, so document any additions inside `.env.example`.
