# AGENTS.md

---

## Quick Triggers

**Session Start**: Check `docs/kb/ai-patterns/mistake-log.md` for patterns to avoid.

**During Session**:
- User says "commit/stage" -> run `pre-commit-check`
- You get corrected -> run `log-mistake`
- KB lookup fails -> after solving, run `document-solution`
- You modify KB files -> run `check-kb-index`

**Session End** (user says "done/thanks/bye"): Run `session-end-checklist`

---

## Project Context

**Project**: ,

| Aspect | Value |
|--------|-------|
| Language/Framework | Express |
| Architecture | Frontend SPA |
| Main branch | `main` |
| Deployment | Heroku |
| Database | — |
| Package manager | yarn |

**Key commands**:
```bash
npx jest       # Run tests
npx eslint .       # Lint
yarn run dev        # Dev server
```

---

## Knowledge Base

Index: `docs/kb/README.md`

Load ONLY relevant docs. Do not load entire KB.

### KB-First Rule

Before exploring code: check `docs/kb/README.md` for a matching doc. If found,
read it before any grep/read. If not found, explore code, then run
`document-solution` if non-trivial.

---

## Memory

At session start, read `.agents/memory/project-profile.md` for cached context.
Check `.agents/memory/decisions.md` when making architectural choices.
Update `.agents/memory/preferences.md` when you learn how the user works.

---

## Critical Constraints

1. **No magic strings** - Use constants, enums, or config values
2. **No N+1 queries** - Use eager loading where applicable
3. **Sanitize inputs** - Validate at system boundaries
4. **Parameterized queries** - Never interpolate user input into queries

---

## Things to Avoid

1. Over-engineering - only make directly requested changes
2. Breaking existing tests - run tests before committing
3. Adding dependencies without evaluating alternatives
4. Large PRs - prefer small, focused changesets

---

## Auto-Triggers

| Trigger | Action |
|---------|--------|
| User says "commit", "stage", "push" | `pre-commit-check` |
| KB lookup fails -> solved via code | `document-solution` |
| User corrects you | `log-mistake` |
| Modified KB files | `check-kb-index` |
| User ending session | `session-end-checklist` |

---

## Skills

| Skill | When |
|-------|------|
| `pre-commit-check` | Before commit/staging |
| `code-review` | Self-review before PR |
| `dependency-audit` | Check for vulnerable/outdated deps |
| `document-solution` | Complex problem solved or KB miss |
| `log-mistake` | User corrects you |
| `check-kb-index` | After KB file changes |
| `save-session` | Long session or pausing work |
| `session-end-checklist` | Session ending |
| `create-plan` | Starting a multi-step feature |
| `execute-task` | Working on a plan task |
| `execute-plan` | Running remaining plan tasks |
| `scaffold-feature` | Bootstrapping a new feature |
| `investigate-bug` | Bug — investigate, root cause, fix, document |
| `dev-environment` | Start/stop/reset/doctor local dev (AI-configured during init) |
| `changelog-update` | Updating CHANGELOG.md from commits |
| `evolve-framework` | Self-improve: audit, research, suggest |
| `list-skills` | Show all available skills |

---

## Agents

`.agents/agents/`: Claude/tool-agnostic role specs.
`.codex/agents/`: Codex-native custom agents with the same roles.

---

## REMEMBER

Before responding, check:
1. **Am I being corrected?** -> `log-mistake`
2. **Is user committing?** -> `pre-commit-check`
3. **Is user ending session?** -> `session-end-checklist`
4. **Did I solve something complex without KB?** -> `document-solution`
