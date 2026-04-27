---
name: eval-harness
description: Eval-driven development (EDD) — define pass/fail criteria before coding, measure reliability with pass@k metrics, track regressions. For AI-assisted feature development.
auto: false
argument-hint: "<feature name>"
---

# Eval Harness

## Triggers

### Manual
- `/eval-harness [feature]`
- "define evals for this", "set up eval-driven dev"
- "what are the success criteria?", "define pass/fail before we start"

---

Evals are the unit tests of AI-assisted development. Define expected behavior BEFORE implementation so you know exactly when the work is done and when a change introduces a regression.

## Philosophy

- **Define before you build** — forces clarity on what "done" means
- **Run continuously** — catch regressions immediately
- **Measure reliability** — pass@k tells you if behavior is consistent, not just occasionally correct
- **Code graders over model graders** — deterministic checks are more trustworthy

## Eval Types

### Capability Eval
Tests that Claude / the code can do something new:
```markdown
[CAPABILITY EVAL: feature-name]
Task: [what must be accomplished]
Success Criteria:
  - [ ] [criterion 1]
  - [ ] [criterion 2]
Expected Output: [description of what correct looks like]
```

### Regression Eval
Ensures a change doesn't break existing behavior:
```markdown
[REGRESSION EVAL: feature-name]
Baseline: [commit SHA or checkpoint]
Tests:
  - [existing-test-1]: PASS/FAIL
  - [existing-test-2]: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## Grader Types

### 1. Code Grader (preferred)
Deterministic — run a command, check the output:
```bash
# File contains expected pattern
grep -q "export function handleAuth" src/auth.ts && echo "PASS" || echo "FAIL"

# Tests pass
npm test -- --testPathPattern="auth" && echo "PASS" || echo "FAIL"

# Build succeeds
npm run build && echo "PASS" || echo "FAIL"

# API returns expected status
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200" && echo "PASS" || echo "FAIL"
```

### 2. Model Grader
Use when output requires judgment — ask Claude to evaluate:
```markdown
[MODEL GRADER]
Evaluate the following output:
1. Does it solve the stated problem? (yes/no)
2. Are edge cases handled? (yes/no)
3. Is the error handling appropriate? (yes/no)
Score: PASS (all yes) / FAIL (any no)
```

### 3. Human Review
For security, compliance, or high-stakes decisions:
```markdown
[HUMAN REVIEW REQUIRED]
Change: [description]
Reason: [why automation is insufficient]
Risk: LOW / MEDIUM / HIGH
```

## Reliability Metrics

**pass@k** — "at least one success in k attempts"
- `pass@1`: First-attempt success rate
- `pass@3`: Success within 3 attempts
- Target for new features: `pass@3 > 90%`

**pass^k** — "all k attempts succeed"
- Higher bar: consistent reliability
- Target for critical paths: `pass^3 = 100%`

## Workflow

### Phase 1: Define (before coding)

Create `.agents/evals/<feature-name>.md`:

```markdown
## EVAL DEFINITION: [feature-name]

### Capability Evals
1. [What the system must now be able to do]
2. [Another new capability]

### Regression Evals
1. [Existing behavior that must not break]
2. [Another existing behavior]

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```

### Phase 2: Implement

Write code to satisfy the defined evals. Reference the eval file, not just the ticket.

### Phase 3: Run Evals

Execute each eval. For code graders, run the commands. For model graders, evaluate. Record results in `.agents/evals/<feature-name>.log`.

### Phase 4: Report

```markdown
EVAL REPORT: [feature-name]
===========================

Capability Evals:
  [eval-1]:  PASS (pass@1)
  [eval-2]:  PASS (pass@2)
  [eval-3]:  PASS (pass@1)
  Overall:   3/3 passed

Regression Evals:
  [existing-1]:  PASS
  [existing-2]:  PASS
  Overall:       2/2 passed

Metrics:
  pass@1: 67% (2/3 on first attempt)
  pass@3: 100% (all passed within 3 attempts)

Status: READY FOR REVIEW
```

## Eval Storage

```
.agents/
  evals/
    <feature-name>.md      # Eval definition (version controlled)
    <feature-name>.log     # Run history
    baseline.json          # Regression baselines
```

Commit eval definitions alongside the feature. They are first-class artifacts.

## Best Practices

1. **Define evals before coding** — if you can't write the eval, you don't understand the requirement
2. **Prefer code graders** — deterministic beats probabilistic
3. **Keep evals fast** — slow evals don't get run
4. **One eval file per feature** — keeps scope clear
5. **Human review for security** — never fully automate security checks
6. **Version evals with code** — evals rot when code changes; update them together

## Example

```markdown
## EVAL: add-user-authentication

### Capability Evals
- [ ] Unauthenticated request to /api/profile returns 401
- [ ] Valid credentials return JWT in httpOnly cookie
- [ ] Invalid credentials return 401 (not 500)
- [ ] Expired token returns 401 with clear message

### Regression Evals
- [ ] Public routes (/api/health, /api/docs) still return 200
- [ ] Existing user data endpoints unchanged (same response shape)

### Success Metrics
- pass@3 > 90% for capability evals
- pass^3 = 100% for regression evals
```
