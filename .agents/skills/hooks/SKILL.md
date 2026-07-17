---
name: hooks
description: Manage Claude Code hook lifecycle — status, enable, disable, audit log
argument-hint: "[status | on | off | log] [hook-name]"
---

# Hooks

Manage the project's Claude Code hooks via the registry at `.claude/hooks/registry.json`.

## Context Required
LOW-CONTEXT: AGENTS.md only

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Manual
- `/hooks`
- "hook status"
- "enable hooks"
- "disable hooks"
- "turn on pre-commit-gate"
- "show hook log"

---

## Sub-commands

| Command | Action |
|---------|--------|
| `hooks status` | Show which hooks are active and their last description |
| `hooks on [name]` | Enable a hook (or all default hooks if no name given) |
| `hooks off [name]` | Disable a hook (or all hooks if no name given) |
| `hooks log` | Tail today's audit log from `.ai-memory/audit/` |

---

## Steps

### `hooks status`
```bash
node scripts/hooks-admin.js status
```

### `hooks on`

Before enabling, show the user this trust ceremony:

> Enabling hooks will modify `.claude/settings.json`.
>
> - **security-gate** — blocks force push to main/master, `rm -rf ~`, hardcoded secrets
> - **audit-log** — appends file write events to `.ai-memory/audit/` (local only, never committed)
>
> Run `hooks on pre-commit-gate` separately to also enable the opt-in debug-artifact scanner.

After user confirms:
```bash
node scripts/hooks-admin.js on [name]
```

### `hooks off`
```bash
node scripts/hooks-admin.js off [name]
```

### `hooks log`
```bash
node scripts/hooks-admin.js log
```

---

## Notes

- `pre-commit-gate` is opt-in — enable it only when the user explicitly requests it
- Hook scripts live in `.claude/hooks/`. Never edit them by hand — re-run setup or use `hooks on/off`
- To add a new hook type, edit `.claude/hooks/registry.json` and add the script to `.claude/hooks/`
