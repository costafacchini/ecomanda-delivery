---
name: dependency-audit
description: Checks for security vulnerabilities and outdated dependencies
---

# Dependency Audit

## Context Required
HIGH-CONTEXT: AGENTS.md, KB index, relevant codebase files, and project conventions

## Setup

1. Load `.agents/memory/project-profile.md` (always)
2. Load `.agents/memory/decisions.md` if this skill touches architecture
3. Check `docs/kb/README.md`; read any matching doc before grepping code
4. Explore codebase patterns only after steps 1–3

Skip steps not relevant to this skill's scope.

## Triggers

### Manual
- `/dependency-audit`
- "audit dependencies", "audit deps"
- "check for vulnerabilities", "check security"
- "any outdated packages?", "before a release"

---

## Steps

1. **Detect package manager** from project files:
   - `package.json` -> npm/yarn/pnpm
   - `Gemfile` -> bundler
   - `requirements.txt` / `pyproject.toml` -> pip/poetry
   - `Cargo.toml` -> cargo
   - `go.mod` -> go
   - `composer.json` -> composer

2. **Run security audit**:
   ```bash
   # Node
   npm audit --json 2>/dev/null || yarn audit --json 2>/dev/null

   # Ruby
   bundle audit check --update 2>/dev/null

   # Python
   pip audit 2>/dev/null || safety check 2>/dev/null

   # Rust
   cargo audit 2>/dev/null

   # Go
   govulncheck ./... 2>/dev/null

   # PHP
   composer audit 2>/dev/null
   ```

3. **Check for outdated packages**:
   ```bash
   # Node
   npm outdated 2>/dev/null || yarn outdated 2>/dev/null

   # Ruby
   bundle outdated 2>/dev/null

   # Python
   pip list --outdated 2>/dev/null
   ```

4. **Report**:

   ```
   ## Dependency Audit

   ### Critical Vulnerabilities
   - [package]: [CVE] — [description] — fix: upgrade to [version]

   ### High Vulnerabilities
   - ...

   ### Outdated (major version behind)
   - [package]: current [x.x] -> latest [y.y]

   ### Summary
   - Vulnerabilities: X critical, Y high, Z moderate
   - Outdated: N packages
   - Action required: [yes/no]
   ```

5. **Suggest fixes** — specific upgrade commands for critical/high vulns
