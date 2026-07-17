---
name: framework
description: Framework management — evolve, upgrade, memory, hooks, session, list, drift, cleanup
argument-hint: "[evolve | upgrade | memory | bootstrap | save | hooks | list | drift | cleanup] [options]"
---

# Framework

Meta-skill for managing the AI dev framework installed in this project.
Consolidates framework management commands under one entry point to reduce menu noise.

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
- `/framework`
- `/framework evolve`
- `/framework upgrade`
- `/framework memory`
- `/framework bootstrap`
- `/framework save`
- `/framework hooks`
- `/framework list`
- `/framework drift`
- `/framework cleanup`

---

## Router

Identify the sub-command from the invocation, load the corresponding skill file, and follow its instructions.

| Sub-command | Skill to load | Description |
|---|---|---|
| `framework evolve [audit\|research\|suggest\|apply]` | `.agents/skills/evolve-framework/SKILL.md` | Audit health, research updates, suggest/apply improvements |
| `framework upgrade` | `.agents/skills/upgrade-framework/SKILL.md` | Pull latest skills from framework source |
| `framework memory [consolidate\|compress]` | `.agents/skills/consolidate-memory/SKILL.md` or `.agents/skills/memory-compress/SKILL.md` | Memory lifecycle operations |
| `framework bootstrap` | `.agents/skills/bootstrap-memory/SKILL.md` | Seed memory files from git history |
| `framework save` | `.agents/skills/save-session/SKILL.md` | Create a session handoff document |
| `framework hooks [status\|on\|off\|log]` | `.agents/skills/hooks/SKILL.md` | Hook lifecycle management |
| `framework list` | `.agents/skills/list-skills/SKILL.md` | Show all available skills |
| `framework drift` | `.agents/skills/check-agent-drift/SKILL.md` | Audit agent behaviour for drift from AGENTS.md |
| `framework cleanup` | `.agents/skills/cleanup-sessions/SKILL.md` | Archive or purge stale session handoff docs |

If invoked with no sub-command, print the router table above and ask which sub-command to run.

---

## Pin a sub-command as a shortcut

To create a top-level shortcut for a frequently used sub-command:

1. Create `.agents/skills/<shortcut>/SKILL.md`:
   ```markdown
   ---
   name: <shortcut>
   description: Shortcut → /framework <subcommand>
   ---
   # <shortcut>
   Load `.agents/skills/<target-skill>/SKILL.md` and follow its instructions.
   ```
2. Create `.agents/skills/<shortcut>/README.md`:
   ```markdown
   # <shortcut>
   Pinned shortcut for `/framework <subcommand>`.
   ```
3. Announce the shortcut to the user.

To unpin: delete the `.agents/skills/<shortcut>/` directory.
