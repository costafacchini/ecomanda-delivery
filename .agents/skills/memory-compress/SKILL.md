---
name: memory-compress
description: Compress memory/KB/CLAUDE.md files to reduce input tokens. Preserves all technical substance, code, URLs, and structure.
---

# Memory Compress

## Context Required
LOW-CONTEXT: just the target file path

## Triggers

### Manual
- `/memory-compress <filepath>`
- User says "compress memory file", "compress this doc", "shrink CLAUDE.md"

### Automatic
- Prompted by token pressure warnings
- After `strategic-compact` identifies large memory files as a contributor

---

## Process

1. Read the target file completely
2. Apply compression rules below — compress in place
3. Save the original as `<filename>.original.md` before overwriting
4. Write the compressed version to the original path
5. Report: original size, compressed size, estimated token reduction

If the file already has a `.original.md` backup, skip backup creation (already compressed once).
Never compress `.original.md` files themselves.

---

## Compression Rules

### Remove
- Articles: a, an, the
- Filler: just, really, basically, actually, simply, essentially, generally
- Pleasantries: "sure", "certainly", "of course", "happy to", "I'd recommend"
- Hedging: "it might be worth", "you could consider", "it would be good to"
- Redundant phrasing: "in order to" → "to", "make sure to" → "ensure"
- Connective fluff: "however", "furthermore", "additionally", "in addition"
- Trailing explanation that restates what code already shows

### Preserve EXACTLY — never modify
- Code blocks (fenced ``` and indented)
- Inline code (`backtick content`)
- URLs and markdown links
- File paths (`/src/components/...`, `./config.yaml`)
- Shell commands (`npm install`, `git commit`)
- Technical terms, library names, API names, protocols
- Proper nouns: project names, people, companies
- Dates, version numbers, numeric values
- Environment variables (`$HOME`, `NODE_ENV`)
- Frontmatter/YAML headers

### Preserve Structure
- All markdown headings (compress body, not heading text)
- Bullet and numbered list hierarchy
- Tables (compress cell prose, keep structure)
- Code block fences and indentation

### Compress Prose
- Short synonyms: "big" not "extensive", "fix" not "implement a solution for"
- Fragments OK: "Run tests before commit" not "You should always run tests before committing"
- Drop "you should", "make sure to", "remember to" — just state the action
- Merge redundant bullets that say the same thing
- Keep one example where multiple examples show the same pattern

---

## Pattern

**Original:**
> You should always make sure to run the test suite before pushing any changes to the main branch. This is important because it helps catch bugs early and prevents broken builds from being deployed to production.

**Compressed:**
> Run tests before push to main. Catch bugs early, prevent broken prod deploys.

---

## Boundaries

- ONLY compress natural language files: `.md`, `.txt`, `.typ`, `.typst`, `.tex`, extensionless
- NEVER modify: `.py`, `.js`, `.ts`, `.json`, `.yaml`, `.yml`, `.toml`, `.env`, `.lock`, `.css`, `.html`, `.xml`, `.sql`, `.sh`
- If file has mixed content (prose + code): compress ONLY the prose sections
- If unsure whether something is code or prose: leave it unchanged
- Never compress a file that is already under 500 bytes

## Priority targets (highest token impact)

1. `.agents/memory/project-profile.md`
2. `.agents/memory/preferences.md`
3. `.agents/memory/decisions.md`
4. `CLAUDE.md` / `AGENTS.md`
5. `docs/kb/*.md` files with `## Background` or long narrative sections
