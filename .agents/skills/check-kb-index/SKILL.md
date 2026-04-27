---
name: check-kb-index
description: Updates docs/kb/README.md index after KB file changes
---

# Check KB Index

## Context Required
LOW-CONTEXT: AGENTS.md only

## Triggers

### Automatic

Trigger when you:
- Created any file in `docs/kb/`
- Modified any file in `docs/kb/`
- Deleted any file in `docs/kb/`
- Ran `document-solution`

### Manual
- `/check-kb-index`
- "update the KB index"
- "rebuild KB README"
- "sync the KB index"

---

## Steps

1. **Scan** `docs/kb/` for all `.md` files (exclude README.md, sessions/)
2. **Extract** title (first `#` heading) and Context line from each
3. **Compare** with current `docs/kb/README.md`
4. **Update** — Add new entries, remove deleted, fix outdated metadata
5. **Maintain** alphabetical order within each category table
