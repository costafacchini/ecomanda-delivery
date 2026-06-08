# Add Defect

Adds a defect task to an existing plan. Use when QA, a reviewer, or a developer finds a bug in a plan's deliverables that the plan must fix before it can ship. Creates the defect task directory, updates the plan overview Defects table and Task Summary, and commits to main. The defect can optionally block an existing task.

**Trigger**: `/add-defect {plan-slug} "{bug description}"`

See `SKILL.md` for the full skill definition used by AI agents.
