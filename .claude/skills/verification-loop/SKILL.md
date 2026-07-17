---
name: verification-loop
description: Multi-phase pre-PR verification — build, types, lint, tests, security scan, diff review. Produces a structured VERIFICATION REPORT.
trigger: User says "verify", "run verification", "check before PR", "is this ready to ship"
auto: false
---

# Verification Loop

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Manual
- `/verification-loop`
- "verify my changes", "run verification"
- "is this ready for PR?", "check before PR"
- "full check", "run all checks"

---

Comprehensive pre-PR quality gate. Runs deeper than `pre-commit-check` — covers build, types, lint, tests, security, and diff review in sequence. Stop on FAIL in phases 1-2; continue and report in phases 3-6.

## Phase 1: Build

Run the project build command from AGENTS.md. If not configured, try common defaults:

```bash
# Detect from AGENTS.md key commands, then try:
npm run build   # or: pnpm build / yarn build
bundle exec rake assets:precompile  # Rails
cargo build     # Rust
go build ./...  # Go
python -m py_compile **/*.py  # Python
```

**STOP if build fails.** Fix before continuing.

## Phase 2: Type Check

```bash
# TypeScript
npx tsc --noEmit

# Python
pyright .  # or: mypy .

# Other typed languages: use the project's type checker
```

Report all errors. Fix critical ones before continuing.

## Phase 3: Lint

```bash
# Use the lint command from AGENTS.md, or detect:
npm run lint           # JS/TS
bundle exec rubocop    # Ruby
ruff check .           # Python
cargo clippy           # Rust
golangci-lint run      # Go
```

Report warnings. Auto-fix only if the linter supports it and AGENTS.md permits it.

## Phase 4: Test Suite

```bash
# Use the test command from AGENTS.md, or detect common runners
npm test               # JS/TS
bundle exec rspec      # Ruby
pytest                 # Python
cargo test             # Rust
go test ./...          # Go
```

Report:
- Total tests / Passed / Failed
- Coverage % (if available)
- Any skipped or pending tests

## Phase 5: Security Scan

Quick targeted checks — not a full `security-review`, just fast signal:

```bash
# Secrets in source
grep -rn --include="*.{js,ts,rb,py,go,rs}" \
  -e "sk-[a-zA-Z0-9]" \
  -e "api_key\s*=\s*['\"]" \
  -e "password\s*=\s*['\"]" \
  -e "secret\s*=\s*['\"]" \
  . 2>/dev/null | grep -v ".env" | head -10

# Debug statements left in
grep -rn --include="*.{js,ts,rb,py}" \
  -e "console\.log" -e "binding\.pry" -e "byebug" \
  -e "debugger" -e "print(" \
  src/ app/ lib/ 2>/dev/null | head -10
```

Flag any hits as WARN. Secrets are BLOCK.

## Phase 6: Diff Review

```bash
git diff --stat HEAD
git diff --name-only HEAD
```

Review each changed file for:
- Unintended changes (files that shouldn't have changed)
- Missing error handling on new code paths
- Edge cases not covered by the test report

## Output

Produce this report after all phases:

```
VERIFICATION REPORT
===================

Build:     [PASS/FAIL]
Types:     [PASS/FAIL] (N errors)
Lint:      [PASS/WARN] (N warnings)
Tests:     [PASS/FAIL] (N/M passed, Z% coverage)
Security:  [PASS/WARN/BLOCK] (N issues)
Diff:      [N files changed, N insertions, N deletions]

Overall:   [READY / NOT READY] for PR

Issues to Fix:
1. [phase] — [description]
2. ...

Skipped phases (reason):
- ...
```

## Snapshot Regression Check

Before starting a major refactor, capture a baseline with:

```bash
./scripts/snapshot before --label pre-refactor
```

After the refactor, run `compare` as part of the verification loop:

```bash
./scripts/snapshot compare --threshold 20
```

This reports percentage changes in file count, test file count, and source line
count, and exits 1 if any metric drops beyond the threshold. Wire this step
between Phase 4 (tests) and Phase 5 (security) for automated CI gates.

## Relationship to Other Skills

- `pre-commit-check` — fast gate before every commit (linter + conventions + KB check)
- `verification-loop` — full gate before opening a PR (all phases + structured report)
- `security-review` — deep security audit when touching auth, payments, user data
