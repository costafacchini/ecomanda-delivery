---
name: strategic-compact
description: Compact context at logical task boundaries before auto-compaction fires mid-task. Preserves what matters, clears what doesn't.
auto: false
---

# Strategic Compact

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Manual
- `/strategic-compact`
- "should I compact?", "compact context"
- "context is getting large", "running out of context"

### Suggested (not automatic — propose to user)
When you notice:
- Session has been long and responses are becoming less coherent
- A major phase just completed (research done, plan finalized, milestone shipped)
- About to switch to a completely different task in the same session
- A failed approach was just abandoned — dead-end reasoning is polluting context

---

Auto-compaction triggers at arbitrary points with no awareness of task boundaries — often mid-implementation, losing variable names, file paths, and partial state at the worst possible moment. Compact deliberately instead.

## When to Compact

| Phase Transition | Compact? | Why |
|---|---|---|
| Research → Planning | Yes | Research is bulky; the plan is the distilled output |
| Planning → Implementation | Yes | Plan is saved to a file/tasks; free up context for code |
| Implementation → Testing | Maybe | Keep if tests reference recent code; compact if switching focus |
| Debugging → Next feature | Yes | Debug traces pollute context for unrelated work |
| After a failed approach | Yes | Clear dead-end reasoning before trying something new |
| Mid-implementation | No | Losing variable names, file paths, and partial state is costly |

## What Survives Compaction

Know this before compacting — save anything that won't survive if you need it.

| Survives | Lost |
|---|---|
| CLAUDE.md / AGENTS.md instructions | Intermediate reasoning and analysis |
| Task list (TodoWrite / `.plans/`) | File contents previously read into context |
| Memory files (`.agents/memory/`) | Multi-step conversation context |
| Git state (commits, branches, stash) | Tool call history |
| All files on disk | Nuanced preferences stated verbally in-session |

## How to Compact

```
/compact
```

Optionally include a focus hint to anchor the new context:
```
/compact Focus on implementing the auth middleware — plan is in .plans/auth.md
```

The hint becomes the summary headline. Use it to carry forward the most important next step.

## Best Practices

1. **Save before compacting** — write important context to `.agents/memory/` or a plan file first
2. **Compact after planning** — once the plan is in a file, compact to start fresh for execution
3. **Compact after debugging** — clear the error-resolution trail before continuing feature work
4. **Don't compact mid-implementation** — preserve context for related changes in the same area
5. **One compact per phase** — more than that and you're losing continuity unnecessarily

## Auto-Suggest Hook (Claude Code only)

The framework's `PostToolUse` hook (`template/.claude/hooks/post-tool-use.sh`) automatically tracks tool call count per session. When the count reaches **50**, it prints to the conversation:

```
Context pressure: 50 tool calls this session.
Consider /strategic-compact at the next phase boundary.
```

The reminder repeats every **10** calls after the threshold. The counter resets each hour (keyed by `YYYY-MM-DD-HH`), so it stays calibrated to active work blocks. The suggestion is advisory — you decide whether and when to compact.

The hook is wired via `settings.local.json` (see `scripts/hooks-admin.js` to enable). No additional configuration needed once the hooks are active.
