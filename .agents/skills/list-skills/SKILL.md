---
name: list-skills
description: Lists all available skills with descriptions
trigger: User asks "what skills?", "list skills", "what can you do?"
auto: false
---

# List Skills

## Triggers

### Manual
- `/list-skills`
- "what skills?", "list skills"
- "what can you do?", "show available skills"

---

Scan `.agents/skills/` for all SKILL.md files, extract name/description/trigger
from frontmatter, and present as:

```
## Available Skills

### Auto-Triggered
| Skill | Trigger |
|-------|---------|
| pre-commit-check | commit/stage/push |
| log-mistake | User corrects AI |
| document-solution | KB miss + solved |
| check-kb-index | KB files changed |
| session-end-checklist | Session ending |

### Manual
| Skill | Description |
|-------|-------------|
| code-review | Self-review before PR |
| investigate-bug | Full bug lifecycle: investigate, root cause, fix, document |
| dependency-audit | Security/outdated deps check |
| changelog-update | Update CHANGELOG.md from commits |
| scaffold-feature | Bootstrap new feature boilerplate |
| dev-environment | Start/stop/reset/doctor local dev (AI-configured during init) |
| save-session | Handoff doc for resuming later |
| create-plan | Plan a multi-step feature |
| execute-task | Run a specific plan task |
| execute-plan | Run remaining plan tasks |
| evolve-framework | Self-audit, research updates, suggest improvements |
| verification-loop | Full pre-PR check: build, types, lint, tests, security, diff |
| tdd-workflow | Red-green-refactor TDD cycle for features and bug fixes |
| security-review | OWASP security checklist for auth, inputs, secrets, APIs |
| eval-harness | Define pass/fail evals before coding; track reliability with pass@k |
| strategic-compact | Compact context at logical boundaries, not mid-task |

Invoke with `run skill-name` or natural language. Slash forms depend on the tool.
```
