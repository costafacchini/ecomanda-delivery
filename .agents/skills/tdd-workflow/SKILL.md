---
name: tdd-workflow
description: Full red-green-refactor TDD cycle. Write tests first, implement to pass, refactor, verify coverage. Stack-agnostic.
trigger: User is writing a new feature, fixing a bug, or refactoring and wants to follow TDD
auto: false
argument-hint: "<feature or bug description>"
---

# TDD Workflow

## Triggers

### Manual
- `/tdd-workflow [feature]`
- "use TDD for this", "write tests first"
- "follow TDD", "red-green-refactor"

---

Tests before code. Always. This skill enforces the full TDD cycle: define expected behavior, write failing tests, implement to pass, refactor, verify.

## Core Rules

1. **Tests before implementation** — write tests first, then make them pass
2. **One failing test at a time** — don't write 10 tests then implement; go step by step
3. **Minimal implementation** — write just enough code to make the test pass
4. **Refactor only on green** — clean up only when all tests pass

## Step 1: Define the Behavior

Before writing any code, write down what the feature must do:

```
As a [role], I want to [action], so that [benefit].

Acceptance criteria:
- [ ] Given [context], when [action], then [outcome]
- [ ] Handles edge case: [case]
- [ ] Fails gracefully when: [error scenario]
```

## Step 2: Write Failing Tests

Translate acceptance criteria into test cases. Start with the happy path:

```
describe '[Feature]' do
  it '[expected behavior]'        # happy path
  it 'handles [edge case]'        # edge case
  it 'raises/returns error when [condition]'  # error path
end
```

Use your project's existing test framework (detected from AGENTS.md or test files in repo).

**Run tests — they MUST fail.** If they pass without implementation, the test is wrong.

## Step 3: Implement to Pass

Write the minimal code that makes the failing test pass. No more.

- Do not implement features not yet tested
- Do not add abstractions "for later"
- If you catch yourself writing uncovered code, stop and write the test first

**Run tests — they MUST pass now.**

## Step 4: Refactor

With tests green, improve the code:
- Remove duplication
- Improve naming
- Extract functions/methods if the logic is complex
- Improve error messages

**Run tests after each refactor step** — stay green throughout.

## Step 5: Next Acceptance Criterion

Return to Step 2 for the next criterion. Repeat until all are covered.

## Step 6: Verify Coverage

```bash
# Check coverage using the project's configured tool
# Look in AGENTS.md for the test command, then add --coverage flag

npm test -- --coverage
pytest --cov
bundle exec rspec --format documentation
go test ./... -cover
cargo test  # use tarpaulin for coverage: cargo tarpaulin
```

Target: 80%+ for new code. Flag uncovered branches for review.

## Test Types

### Unit Tests
- Single function or class in isolation
- Mock/stub external dependencies
- Should be fast (< 50ms each)
- Cover: happy path, edge cases, error paths

### Integration Tests
- Multiple components working together
- Test the actual integration points (DB, external service boundary)
- Prefer real dependencies over mocks when practical

### End-to-End Tests
- Complete user-facing flows
- Use only for critical paths (login, checkout, core workflows)
- These are slow — keep the count low

## Common Mistakes to Avoid

| Wrong | Right |
|-------|-------|
| Test passes without implementation | Check: did you assert the right thing? |
| Testing implementation details | Test observable behavior and outputs |
| Brittle selectors in E2E (`div > span:nth-child(2)`) | Use semantic selectors (`[data-testid=...]`, roles) |
| Tests depending on each other | Each test creates its own data/state |
| Mocking everything | Mock at the boundary (external services, not internal logic) |
| Writing all tests then all code | One test → implement → pass → next test |

## Output at Each Step

After each red-green-refactor cycle, confirm:

```
TDD Cycle: [feature name] — criterion N/M
Red:    [test name] — FAIL (as expected)
Green:  [test name] — PASS
Refactor: [what was cleaned up, or "none needed"]
Coverage: N% (target: 80%)
```
