---
name: setup-tests
description: Guides the developer through selecting and scaffolding a test runner for a repository that has none configured
argument-hint: "[test-runner-name]"
---

# Setup Tests

HIGH-CONTEXT: AGENTS.md, KB index, relevant codebase files

## Triggers

### Manual
- `/setup-tests [test-runner-name]`
- "setup tests", "add tests", "configure testing"
- "I have no tests", "bootstrap a test suite"
- Also triggered when setup.sh warns no test runner was detected

---

Helps bootstrap a test suite in a repository that has no testing infrastructure yet.

## Steps

### 1. Detect stack

Read the following files (whichever exist) to understand the project:
- `package.json` — Node/JS/TS project, available runners: Jest, Vitest, Mocha, Playwright, Cypress
- `Gemfile` — Ruby project, available runners: RSpec, Minitest
- `pyproject.toml` / `requirements.txt` / `setup.py` — Python project, available runners: pytest, unittest
- `go.mod` — Go project, runner: `go test` (built-in, no install needed)
- `Cargo.toml` — Rust project, runner: `cargo test` (built-in, no install needed)
- `mix.exs` — Elixir project, runner: ExUnit (built-in)
- `composer.json` — PHP project, available runners: PHPUnit, Pest
- `pom.xml` / `build.gradle` — JVM project, available runners: JUnit, TestNG

### 2. Present options

Show the developer which runners are appropriate for their stack and ask which to use:

```
## Test Setup

Detected stack: [detected languages/frameworks]

Recommended test runners:
1. [Runner A] — [one-line reason why it fits this stack]
2. [Runner B] — [one-line reason]

Which would you like to set up? (Enter number or name)
```

If only one option makes sense (e.g. Go, Rust, Elixir), skip the question and confirm before proceeding:
```
This is a Go project — go test is built-in and needs no installation.
I'll scaffold a sample test file. Proceed? (y/n)
```

### 3. Confirm before touching anything

Before generating or installing anything, show a summary:

```
## Plan

I will:
- [install command if needed, e.g. "npm install --save-dev vitest"]
- [config file to create, e.g. "vitest.config.ts"]
- [example test file, e.g. "src/example.test.ts"]

Proceed? (y/n)
```

### 4. Execute

Only after confirmation:

1. **Install** the runner if it requires a package (provide the exact command, do not run it — instruct the developer to run it)
2. **Create config file** if the runner needs one (e.g. `jest.config.js`, `vitest.config.ts`, `pytest.ini`)
3. **Create one example test file** that matches the project's existing file structure and naming conventions
4. **Update package.json scripts** if applicable (add `"test": "vitest"` etc.)

### 5. Report

```
## Test Setup Complete

Runner: [name]

Files created:
- [config file path]
- [example test path]

To run tests:
  [test command]

Next: replace the example test with real tests for your code.
```

## Rules

- Never run install commands — provide them for the developer to run
- Never create more than one example test file
- Match the existing file structure and naming conventions found in the repo
- If the stack is ambiguous (e.g. a monorepo with multiple languages), ask which part to set up first
- For built-in runners (Go, Rust, Elixir), skip install step entirely
