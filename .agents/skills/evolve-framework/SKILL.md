---
name: evolve-framework
description: >-
  Self-evolution skill. Audits the framework's health, detects improvement
  opportunities from usage patterns, researches community updates, and
  proposes concrete changes. Run periodically or when the framework feels stale.
trigger: User says "evolve", "improve framework", "update framework", "health check", or periodically after 50+ sessions
auto: false
argument-hint: "[audit | research | suggest | apply]"
---

# Evolve Framework

## Triggers

### Manual
- `/evolve-framework [audit|research|suggest|apply]`
- "evolve", "improve framework", "update framework"
- "health check", "framework audit"

Also consider running when:
- Mistake log has 5+ new entries since last evolution
- It's been 30+ days since last evolution run

---

The framework's self-improvement engine. Analyzes signals from daily usage,
researches external updates, and proposes concrete improvements.

Run with a specific phase or run all phases sequentially:
- `/evolve-framework` — run all phases
- `/evolve-framework audit` — just the diagnostic
- `/evolve-framework research` — just the external research
- `/evolve-framework suggest` — audit + research + suggestions
- `/evolve-framework apply` — apply previously approved suggestions

---

## Phase 1: Audit (Internal Health)

Analyze the framework's current state from internal signals.

### 1.1 Mistake Pattern Analysis

Read `docs/kb/ai-patterns/mistake-log.md` and look for:

- **Recurring mistakes (count 3+)** that aren't yet in AGENTS.md "Things to Avoid"
  → Propose adding them as rules
- **Mistake clusters** around a specific area (e.g., 4 mistakes all about testing)
  → Propose a new KB doc or skill for that area
- **Mistakes that a skill could prevent**
  → Propose a new auto-triggered skill

### 1.2 KB Coverage Gaps

```bash
# Find code directories with no matching KB docs
# Compare active development areas (recent git activity) vs KB coverage
git log --oneline -100 --name-only | grep -E '^\w' | sort -u | head -30
```

Cross-reference with `docs/kb/README.md`:
- **Hot areas with no KB** → Propose `document-solution` for each
- **KB docs not referenced in 90+ days** → Propose archive or refresh
- **Context map gaps** → Areas touched frequently but not mapped

### 1.3 Skill Usage Analysis

Check trigger-log for skill firing frequency:
- **Skills that never fire** → Are triggers misconfigured? Is the skill unnecessary?
- **Manual skills never invoked** → Should they be auto-triggered? Or removed?
- **Repeated manual workflows not captured as skills** → Propose new skill

### 1.4 Memory Health

- **project-profile.md** — Is it current? Compare detected stack vs actual
- **decisions.md** — Any decisions older than 6 months that should be reviewed?
- **preferences.md** — Is it growing? If empty after 20+ sessions, log-mistake isn't capturing enough
- **context-map.md** — Coverage: what % of KB docs are mapped to code areas?

### 1.5 AGENTS.md Drift

- Is AGENTS.md still under 200 lines? (compliance drops above this)
- Are all skills listed in AGENTS.md actually present in `.agents/skills/`?
- Are all KB keyword mappings still valid? (docs exist, names match)
- Is CLAUDE.md in sync with AGENTS.md?

### Audit Output

```markdown
## Framework Audit — YYYY-MM-DD

### Health Score: [A/B/C/D/F]

### Findings

#### Recurring Mistakes (not yet rules)
- [mistake] — seen N times — **propose rule**

#### KB Gaps (hot areas without docs)
- [directory/area] — N commits, no KB doc — **propose doc**

#### Stale KB Docs (90+ days untouched)
- [doc path] — last updated YYYY-MM-DD — **propose refresh or archive**

#### Skill Issues
- [skill] — never fires — **investigate trigger**
- [workflow pattern] — done manually N times — **propose skill**

#### Memory Issues
- [issue description] — **propose fix**

#### AGENTS.md Issues
- [issue] — **propose fix**

### Metrics
| Metric | Value |
|--------|-------|
| KB docs | N |
| Mistake log entries | N |
| Trigger log entries | N |
| Decisions logged | N |
| Preferences captured | N |
| Context map coverage | N% |
| AGENTS.md line count | N |
| Skills (auto/manual) | N/N |
```

---

## Phase 2: Research (External Updates)

Search for updates in the broader ecosystem.

### 2.1 AGENTS.md Spec Updates

```
WebSearch: "AGENTS.md specification changelog 2026"
WebSearch: "AGENTS.md v1.1 v2.0 new features"
```

Check for:
- New spec versions or proposals
- New tool support (new IDEs reading AGENTS.md)
- Breaking changes in the standard

### 2.2 SKILL.md Ecosystem

```
WebSearch: "SKILL.md new skills essential 2026"
WebSearch: "awesome agent skills most popular new"
```

Check for:
- Popular community skills this framework doesn't have
- Skills with 1000+ installs that solve common problems
- New skill patterns or conventions

### 2.3 Knowledge Pack Freshness

For each detected language/framework:

```
WebSearch: "[framework] best practices [current year] changes"
```

Check for:
- Major version releases that change conventions (e.g., React 20, Rails 8)
- Deprecated patterns in current knowledge packs
- New idiomatic patterns adopted by the community

### 2.4 Tool Updates

```
WebSearch: "Claude Code new features [current year]"
WebSearch: "Codex AGENTS.md skills subagents new features [current year]"
WebSearch: "Cursor rules new features [current year]"
```

Check for:
- New configuration options (new shim files needed?)
- New agent/skill capabilities
- Deprecated features

### Research Output

```markdown
## External Research — YYYY-MM-DD

### Spec Updates
- [update description] — **action: [update shim / no action]**

### New Skills Worth Adopting
- [skill name] — [what it does] — [community adoption] — **action: [adopt / skip]**

### Knowledge Pack Updates
- [pack name] — [what changed] — **action: [update / no action]**

### Tool Updates
- [tool] — [what changed] — **action: [update shim / add shim / no action]**
```

---

## Phase 3: Suggest (Concrete Proposals)

Combine audit + research findings into ranked proposals.

### Ranking Criteria

| Priority | Criteria |
|----------|----------|
| **P0 — Fix now** | Broken functionality, security issue, spec non-compliance |
| **P1 — High value** | Recurring mistake pattern, high-traffic KB gap, popular community skill |
| **P2 — Nice to have** | Stale doc refresh, minor optimization, edge case coverage |
| **P3 — Backlog** | Future consideration, low-impact improvement |

### Suggestion Format

For each proposal:

```markdown
### [P0/P1/P2/P3] [Title]

**Source**: Audit finding / Research finding / Both
**What**: [Concrete change description]
**Why**: [Evidence — mistake count, usage data, community adoption]
**Files affected**: [list]
**Effort**: Low / Medium / High
**Risk**: None / Low / Medium

**Proposed change**:
[Specific content to add/modify/remove, or skill YAML to create]
```

### Present to User

Show all proposals grouped by priority. Ask:

> Which proposals would you like me to apply? (all P0/P1, specific numbers, or none)

---

## Phase 4: Apply (Execute Approved Changes)

For each approved proposal:

1. **Make the change** (edit file, create skill, update KB doc)
2. **Run `check-kb-index`** if any KB files were touched
3. **Run `scripts/sync-shims.sh`** if AGENTS.md was modified
4. **Run `scripts/validate.sh`** to ensure nothing is broken
5. **Log the change** in `.agents/memory/decisions.md`:

```markdown
## [YYYY-MM-DD] Framework Evolution: [title]

**Context**: Identified by evolve-framework audit/research
**Change**: [what was changed]
**Evidence**: [why — data from audit]
**Rollback**: [how to undo if needed]
```

6. **Update trigger-log** with evolution event

---

## Signals That Suggest Running This Skill

- Mistake log has 5+ new entries since last evolution
- It's been 30+ days since last evolution
- A major framework/language version was released
- User says "the AI keeps getting X wrong" (systemic issue)
- KB feels incomplete for the work being done
- New team member or tool is being onboarded

---

## Self-Improvement Flywheel

```
mistakes & corrections
        |
        v
  mistake-log.md ──────> evolve-framework (audit)
        |                       |
        v                       v
  AGENTS.md rules         new skills / KB docs
        |                       |
        v                       v
  fewer mistakes          better context
        |                       |
        +───────> compound improvement <───────+
                        |
                        v
                 framework evolves
```

The framework gets smarter with every session:
1. **Mistakes** become **rules** (via log-mistake → evolve audit)
2. **KB gaps** become **docs** (via document-solution → evolve audit)
3. **Repetitive workflows** become **skills** (via evolve suggest)
4. **Community advances** become **updates** (via evolve research)
5. **All changes are logged** in decisions.md for traceability
