---
name: code-review
description: Structured self-review of changes before creating a PR
---

# Code Review

## Context Required
HIGH-CONTEXT: Plan overview, task definition, dependency status files, AGENTS.md, recent commits, and relevant KB articles on coding standards and architecture

## Triggers

### Manual
- `/code-review`
- "review my changes"
- "review the code"
- "prepare for PR"
- "check my changes before I PR"

---

Self-review your changes against project standards before creating a PR.

## Steps

1. **Gather changes**:
   ```bash
   git diff --stat
   git diff [base-branch]...HEAD
   ```

2. **Run 5-category checklist** on every changed file:

   ### 1. Conventions
   - [ ] Follows project naming, style, structure
   - [ ] No magic strings — constants/enums used
   - [ ] No debug statements left in

   ### 2. Quality
   - [ ] No code duplication introduced
   - [ ] Functions/methods are focused (single responsibility)
   - [ ] Error handling is appropriate (not swallowed, not excessive)

   ### 3. Testing
   - [ ] New logic has tests
   - [ ] Edge cases covered
   - [ ] Tests assert behavior, not implementation

   ### 4. Security & Performance
   - [ ] Inputs validated at boundaries
   - [ ] No N+1 queries, no unbounded selects
   - [ ] No SQL injection, XSS, or auth bypass vectors
   - [ ] Secrets not hardcoded

   ### 5. Architecture
   - [ ] Follows existing patterns (don't invent new paradigms)
   - [ ] No unnecessary abstractions or premature optimization
   - [ ] Dependencies justified

3. **Report findings** grouped by severity:
   - **BLOCK** — Must fix before PR
   - **WARN** — Should review
   - **INFO** — Suggestions

4. **Suggest PR title and description** based on changes
