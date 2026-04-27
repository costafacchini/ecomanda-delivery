---
name: list-skills
description: Lists all available skills with descriptions and trigger conditions. Reads skill definitions from the skills directories and presents a formatted summary.
---

# List Skills

## Context Required
META: no project context needed

## Triggers

### Automatic
- None (manual only)

### Manual
- `/list-skills`
- "what skills?", "list skills"
- "what can you do?", "show available skills"
- "what automation do we have?"

## Instructions

### Step 1: Locate skill files
Read SKILL.md files from `.agents/skills/` or `.claude/skills/` directories.
If both directories exist, dedupe by skill `name` and prefer `.agents/skills/` as the primary source.

### Step 2: Extract metadata for each skill
- Skill name (from frontmatter `name` field)
- Description (from frontmatter `description` field)
- Trigger type (Automatic vs Manual from Triggers section)

### Step 3: Format and present

The output below is an **example** of what this skill generates at runtime. The actual list is read dynamically from SKILL.md files — do not treat this as a static template.

```text
Available Skills:

pre-commit-check
  Validates staged files against AGENTS.md standards before commit
  Triggers: Before any git commit/stage

log-mistake
  Logs correction patterns when user corrects agent
  Triggers: User provides correction (auto-detected)

document-solution
  Creates KB doc from complex problem solution
  Triggers: KB miss → solution, 3+ files, 5+ exchanges

check-kb-index
  Updates knowledge base README.md index
  Triggers: After any KB file created/modified/deleted

save-session
  Creates handoff doc for session continuity
  Triggers: Long session (20+ turns), user pauses work

check-agent-drift
  Verifies AGENTS.md matches codebase reality
  Triggers: Manual / periodic review

cleanup-sessions
  Deletes old session handoff documents
  Triggers: Manual / maintenance

session-end-checklist
  Safety net checklist before ending session
  Triggers: User says "done", "thanks", "bye"

list-skills
  Lists all available skills (this skill)
  Triggers: Manual only

add-defect
  Adds a defect task to an existing plan
  Triggers: Manual (/add-defect {plan-slug}, "add a bug to the plan")

create-plan
  Creates a git-native development plan with tasks, phases, and dependencies
  Triggers: Manual (/create-plan, "plan this feature")

execute-task
  Executes a single task from a development plan
  Triggers: Manual (/execute-task {plan-slug}/{task-path}, "work on {task-path} from {plan-slug}")

execute-plan
  Executes remaining plan tasks with parallel agent support
  Triggers: Manual (/execute-plan {plan-slug}, "run the plan")

promptcraft
  Generates optimized, structured prompts for development tasks
  Triggers: Manual (/promptcraft, "create a prompt", "generate prompt")

changelog-update
  Updates CHANGELOG.md based on merged PRs and commit messages
  Triggers: Manual (/changelog-update, "update changelog")

code-review
  Provides feedback on code quality, style, and best practices
  Triggers: Manual (/code-review, "review this code")

dependency-audit
  Analyzes project dependencies for vulnerabilities and outdated packages
  Triggers: Manual (/dependency-audit, "audit dependencies")

dev-environment
  Guides through setting up local dev environment with necessary tools and configs
  Triggers: Manual (/dev-environment, "help me set up my dev environment")

evolve-framework
  Provides structured approach to problem-solving and decision-making
  Triggers: Manual (/evolve-framework, "help me with a problem", "apply the evolve framework")

investigate-bug
  Full bug lifecycle — investigate, root cause, plan fix, document. For when something is broken and you need structured debugging, not ad-hoc poking
  Triggers: Manual (/investigate-bug, "help me investigate a bug", "debug this issue")

scaffold-feature
  Generates boilerplate files for a new feature following project conventions
  Triggers: Manual (/scaffold-feature, "scaffold a new feature", "generate boilerplate for {feature}")

setup-tests
  Creates test files and example test cases for a given module or feature
  Triggers: Manual (/setup-tests, "set up tests for {module/feature}")

upgrade-framework
  Guides through upgrading a major framework or library with best practices
  Triggers: Manual (/upgrade-framework, "help me upgrade {framework}", "guide me through a {framework} upgrade")

Invoke manual skills with `/skill-name` or natural language. Automatic skills fire on detected trigger phrases — do not invoke them manually.
```

## Output

- Formatted list of all available skills
- Each entry includes name, description, and trigger summary

## Examples

User: "what commands do we have?"

Agent reads skill definitions and displays the formatted list above.
