---
name: document-solution
description: Creates a KB doc from a complex solution discovered during development
trigger: KB miss solved via code exploration, or complex solution (3+ files, 5+ exchanges)
auto: true
---

# Document Solution

## Triggers

### Automatic

Trigger when ALL of these are true:
1. You checked KB for a relevant doc
2. No relevant doc existed
3. You searched code/investigated to solve
4. You successfully solved the problem

Also trigger when:
- Bug fix required reading 3+ files
- Solution used a non-obvious pattern
- 5+ back-and-forth exchanges to resolve

### Manual
- `/document-solution`
- "document this"
- "save this solution"
- "add this to the KB"
- "user says document this"

---

## When
- KB lookup failed but solved via code search
- Complex solution (3+ files or 5+ exchanges)
- User explicitly asks

## Steps

1. **Identify the gap** — What area? Which KB category?
2. **Create doc** at `docs/kb/{category}/{kebab-case-name}.md`:

```markdown
# [Title]

**Last Updated**: YYYY-MM-DD
**Context**: [When to read — keyword triggers]

## Overview
[Brief summary]

## Key Concepts
[Core patterns, models, services]

## How It Works
[Step-by-step with file:line references]

## Common Pitfalls
[Things that trip people up]

## Related
[Links to related docs]
```

3. **Run `check-kb-index`** to update docs/kb/README.md
4. **Update AGENTS.md** KB section if it's a frequently needed pattern
