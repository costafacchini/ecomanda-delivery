---
name: consolidate-memory
description: LLM-rewrites accumulated session docs into memory files. Merges learnings into decisions.md and preferences.md.
---

# Consolidate Memory

## Context Required
MEDIUM-CONTEXT: All session docs + current memory files

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Automatic
- After 5+ session docs accumulate in `docs/kb/sessions/`
- Token pressure from bloated memory files
- User says "consolidate memory", "merge sessions", "clean up memory"

### Manual
- `/consolidate-memory`
- "consolidate sessions"
- "merge memory"

---

## When
- Multiple session docs have accumulated (5+)
- Memory files are growing large and redundant
- Starting a new major phase of work

## Steps

### 1. Collect source material
Read in order:
- All session docs in `docs/kb/sessions/` (newest first)
- `.agents/memory/decisions.md`
- `.agents/memory/preferences.md`
- `.agents/memory/context-map.md`

### 2. Extract and deduplicate

From session docs, identify:
- **New decisions** not yet in `decisions.md`
- **Superseded decisions** — old entries that contradict newer ones
- **New preferences** not yet in `preferences.md`
- **New context mappings** not yet in `context-map.md`

### 3. Rewrite memory files

**`decisions.md`** — merge new decisions; mark old ones superseded:
```markdown
## [OLD-DATE] Old Decision [SUPERSEDED by: NEW-DATE]
...original content...

## [NEW-DATE] New Decision [SUPERSEDES: OLD-DATE]
...new content...
```

**`preferences.md`** — merge new patterns; remove contradicted ones

**`context-map.md`** — add new code-area → KB doc mappings

Do NOT modify `project-profile.md` (tier: semantic, slot_kind: invariant).

### 4. Append to audit log
Add to `.agents/memory/log.md`:
```
## [ISO8601] consolidation_run | Merged N sessions → decisions.md, preferences.md
```

### 5. Report and offer cleanup
Show the user:
- What was added/superseded in each file
- List of session docs now consolidated

Ask: "These N session docs have been consolidated. Run `cleanup-sessions --days 0` on them?"

## Boundaries

- Never delete session docs directly — offer `cleanup-sessions` instead
- Never rewrite `project-profile.md` — it is `slot_kind: invariant`
- Never invent decisions not present in the source material
- If a session doc was already consolidated (check log.md), skip it
- Prefer merging into existing sections over creating new top-level sections
