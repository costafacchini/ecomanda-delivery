---
name: strategic-compact
description: Guide for compacting context at logical task boundaries rather than letting auto-compaction fire mid-task. Preserves what matters, clears what doesn't.
auto: false
---

# Strategic Compact

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

## Optional Hook (Claude Code only)

To get a suggestion after 50 tool calls, add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "node ~/.claude/skills/strategic-compact/suggest-compact.js" }]
      }
    ]
  }
}
```

The script tracks tool calls and prints a suggestion when the threshold is reached — you still decide whether to compact.
