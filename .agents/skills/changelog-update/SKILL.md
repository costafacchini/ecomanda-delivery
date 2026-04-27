---
name: changelog-update
description: Updates CHANGELOG.md from git history following Keep a Changelog format
---

# Changelog Update

## Context Required
FULL-CONTEXT: AGENTS.md + relevant KB

## Triggers

### Manual
- `/changelog-update`
- "update changelog", "update the CHANGELOG"
- "generate changelog", "what changed since last release?"

---

## Steps

1. **Find last version tag** (or last changelog entry):
   ```bash
   git tag --sort=-version:refname | head -5
   ```

2. **Gather commits since last version**:
   ```bash
   git log [last-tag]..HEAD --oneline --no-merges
   ```

3. **Categorize** each commit into Keep a Changelog sections:
   - **Added** — new features
   - **Changed** — changes to existing functionality
   - **Deprecated** — soon-to-be-removed features
   - **Removed** — removed features
   - **Fixed** — bug fixes
   - **Security** — vulnerability fixes

4. **Update CHANGELOG.md** (create if missing):

   ```markdown
   # Changelog

   All notable changes documented here.
   Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

   ## [Unreleased]

   ### Added
   - [description from commit]

   ### Fixed
   - [description from commit]

   ## [x.y.z] - YYYY-MM-DD
   ...
   ```

5. **Present diff** to user for review before writing

## Rules
- Write human-readable descriptions, not raw commit messages
- Group related commits into single entries
- Skip chore/CI commits unless significant
- Maintain reverse chronological order
