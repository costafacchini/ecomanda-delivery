---
name: bootstrap-memory
description: Seeds memory files from existing project history. Solves cold-start for mid-project AI adoption. Run once after installing the framework.
---

# Bootstrap Memory

## Context Required
LOW-CONTEXT: Just needs shell access to the project

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Manual (run once)
- `/bootstrap-memory`
- "bootstrap memory"
- "seed memory from history"
- "initialize memory from existing project"

### Automatic
- When `.agents/memory/decisions.md` is empty and `git log` shows 20+ commits

---

## When
- First time installing this framework on an existing project
- Memory files are empty but project has significant history
- Run ONCE — skip if `log.md` contains a `bootstrap_run` entry

## Steps

### 1. Check if already bootstrapped
```bash
grep -q "bootstrap_run" .agents/memory/log.md 2>/dev/null && echo "ALREADY_DONE"
```
If already done, ask user before re-running.

### 2. Collect project context
Run the bootstrap data collector:
```bash
scripts/bootstrap-memory.sh
```
This outputs a structured summary to `.agents/memory/_bootstrap-context.md`.

If the script is unavailable, collect manually:
```bash
git log --oneline -50
cat README.md
find . -maxdepth 2 -name "*.md" | head -20
```

### 3. Analyze and seed memory files

Read `.agents/memory/_bootstrap-context.md` (or manual output), then:

**Seed `decisions.md`** — extract architectural decisions from:
- Significant commits ("switch to X", "replace Y with Z", "use X for Y")
- README architectural descriptions
- Dependency choices (why Postgres not MySQL, why React not Vue)

**Seed `preferences.md`** — extract working style signals from:
- Commit message style (conventional commits? emoji? imperative?)
- Code patterns visible in file structure
- Test framework choices

**Seed `context-map.md`** — map code areas to likely KB docs:
- `app/models/*` → future auth/data-model docs
- `app/services/*` → future service-layer docs
- Key integration points

### 4. Clean up and log
```bash
rm -f .agents/memory/_bootstrap-context.md
```

Append to `.agents/memory/log.md`:
```
## [ISO8601] bootstrap_run | Seeded from N commits + README
```

### 5. Report
Show the user a summary of what was seeded into each file, and recommend:
> "Run `consolidate-memory` after a few sessions to merge new learnings into these bootstrapped decisions."

## Boundaries

- Never invent decisions — only extract what's demonstrably present in git/README
- If ambiguous, write a comment `<!-- Inferred from git log — verify -->` next to the entry
- Never overwrite non-empty memory files without asking
- `project-profile.md` is `slot_kind: invariant` — never write to it (setup.sh owns that)
