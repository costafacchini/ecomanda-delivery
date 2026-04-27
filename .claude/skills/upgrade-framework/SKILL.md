---
name: upgrade-framework
description: >-
  Updates the AI dev framework installation in a consumer repo. Compares the
  installed skills against a source copy of ai-dev-framework, copies new and
  updated skills, adds new skill entries to AGENTS.md without touching
  project-specific customizations, syncs CLAUDE.md, and validates the result.
trigger: User says "upgrade framework", "update framework", "sync framework skills"
auto: false
argument-hint: "[--source <path-to-ai-dev-framework>]"
---

# Upgrade Framework

## Context Required
HIGH-CONTEXT: AGENTS.md, current skill state, framework changelog

## Triggers

### Manual
- `/upgrade-framework`
- `/upgrade-framework --source /path/to/ai-dev-framework`
- "upgrade framework", "update framework", "sync framework skills"
- "update my skills", "I want the latest skills"

### Automatic
Consider offering when:
- User reports a skill is missing that the framework now provides
- Session start finds `.agents/skills/` has fewer skills than expected

---

## What Is Safe to Overwrite

| Path | Action |
|------|--------|
| `.agents/skills/` | **Overwrite** — framework-owned, no project customization |
| `.claude/skills/` | **Overwrite** — shim, always mirrors `.agents/skills/` |
| `AGENTS.md` Skills table | **Additive only** — add new rows, never remove or edit existing |
| `CLAUDE.md` | **Overwrite** — always synced from `AGENTS.md` |
| `docs/kb/` content | **Never touch** — user-owned knowledge base |
| `docs/kb/ai-patterns/mistake-log.md` | **Never touch** |

---

## Steps

### Step 1: Locate the Source

Ask the user for the framework source path if not provided:

```
Where is your ai-dev-framework clone?
(e.g. ~/Developer/ai-dev-framework or /path/to/ai-dev-framework)
```

Validate the source:
```bash
ls {source}/template/.agents/skills/
```

If the path is invalid, stop and report.

### Step 2: Inventory Current Install

```bash
# Skills currently installed
ls .agents/skills/

# Skills available in source
ls {source}/template/.agents/skills/
```

Categorize:
- **New skills** — in source but not in `.agents/skills/`
- **Updated skills** — in both; compare `SKILL.md` content
- **Repo-specific skills** — in `.agents/skills/` but not in source (user-created — leave alone)

### Step 3: Show Diff and Confirm

Present findings:

```
## Framework Upgrade — Preview

Source: {source} (template/)

NEW skills to install (N):
  + create-plan       Creates structured plans for multi-step features
  + execute-task      Runs a specific task from a plan
  ...

UPDATED skills (N):
  ~ pre-commit-check  Triggers section added
  ~ log-mistake       Extended correction phrase list
  ...

REPO-SPECIFIC skills (kept as-is):
  = my-custom-skill

AGENTS.md: N new skill rows will be added to the Skills table.
CLAUDE.md: will be synced from AGENTS.md.
docs/kb/: not touched.

Proceed? (y/n)
```

Wait for confirmation before making any changes.

### Step 4: Copy Skills

For each new and updated skill:
```bash
cp -r {source}/template/.agents/skills/{skill-name} .agents/skills/
```

If `.claude/skills/` exists, mirror it:
```bash
cp -r {source}/template/.agents/skills/{skill-name} .claude/skills/
```

### Step 5: Update AGENTS.md — Additive Only

For each **new** skill installed:
1. Read its `SKILL.md` frontmatter (`name`, `description`, `auto`)
2. Find the Skills table in `AGENTS.md`
3. Append a new row — do NOT reorder or modify existing rows:

```markdown
| `skill-name` | auto/manual | Description from frontmatter |
```

Do NOT touch:
- Project Context section
- Critical Constraints
- Things to Avoid
- Any `<!-- CUSTOMIZE -->` sections
- Existing skill rows (even if description changed — user may have edited them)

### Step 6: Sync CLAUDE.md

```bash
cp AGENTS.md CLAUDE.md
```

### Step 7: Validate

If `scripts/validate.sh` exists:
```bash
bash scripts/validate.sh
```

Report any errors. Fix if straightforward (e.g. missing file that setup.sh should have created).

### Step 8: Commit

```bash
git add .agents/skills/ AGENTS.md CLAUDE.md
git commit -m "chore: upgrade AI dev framework skills"
```

Run `pre-commit-check` first.

### Step 9: Report

```
## Framework Upgrade — Complete

New skills installed (N): [list]
Updated skills (N): [list]
AGENTS.md: N rows added to Skills table
CLAUDE.md: synced
Validation: PASS / N warnings

Repo-specific skills (untouched): [list if any]

Next: review any updated skill SKILL.md files if you have
      custom workflows that depend on them.
```
