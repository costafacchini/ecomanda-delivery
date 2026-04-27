---
name: document-solution
description: Creates a KB doc from a complex solution discovered during development. Use when KB lookup missed then solved via code search, bug fix required 3+ files, solution used non-obvious pattern, or 5+ exchanges to resolve. Captures patterns, gotchas, and key files for future reference.
---

# Document Solution

## Context Required
FULL-CONTEXT: AGENTS.md + relevant KB

## Triggers

### Automatic (CRITICAL - KB Fallback-Update Rule)

Trigger when ALL of these are true:
1. You checked KB for a relevant doc
2. No relevant doc existed
3. You searched code/investigated to solve
4. You successfully solved the problem

Also trigger when:
- Bug fix required reading 3+ files
- Solution used a non-obvious pattern
- 5+ back-and-forth exchanges to resolve
- Integration with external system

### Manual
- `/document-solution`
- "run document-solution"
- "document this"
- "save this solution"
- "add this to the KB"
- "this should be documented"

## Instructions

### Step 1: Analyze the solution
- What was the root problem?
- What files/models were involved?
- What was the non-obvious part?
- What gotchas did we encounter?

### Step 2: Determine category
- `architecture/` - System design, data flow, model relationships
- `features/` - User-facing functionality, UI behavior
- `integrations/` - External systems
- `api/` - API endpoints, serialization, authentication
- `bugfixes/` - Specific bug patterns and fixes

### Step 3: Generate filename
- Format: `kebab-case-topic.md`
- Example: `servicetrade-appointment-aggregation.md`

### Step 4: Create document

Use the template in `.agents/skills/document-solution/references/kb-template.md` or follow this structure:

```markdown
# [Topic Title]

**Last Updated**: [Month Year]
**Context**: Read when [trigger conditions].

---

## Overview
[Brief summary]

---

## The Problem

### Symptoms
- [How this manifests]

### Root Cause
[Why it happens]

---

## The Solution

### Key Files

| File | Role |
|------|------|
| `path/to/file` | [What it does] |

### Code Pattern

[The correct approach with code example]

---

## Gotchas

### [Gotcha 1]
[What to watch out for]

---

## Related

- [Link to related KB doc]
```

### Step 5: Save document
Save to `docs/kb/[category]/[filename].md`

### Step 6: Run check-kb-index
Update the knowledge base index.

### Step 7: Confirm to user
```text
Solution documented: docs/kb/[category]/[filename].md

Knowledge base index updated.

Future agents will find this when working on: [trigger keywords]
```

## Output

- New file: `docs/kb/[category]/[filename].md`
- Updated: `docs/kb/README.md` (via check-kb-index)
- Confirmation with document location

## Examples

After fixing a complex sync bug, agent creates the KB doc and reports:
```text
Solution documented: docs/kb/integrations/servicetrade-job-aggregation.md

Knowledge base index updated.

Future agents will find this when working on: ServiceTrade, job sync, appointment aggregation
```
