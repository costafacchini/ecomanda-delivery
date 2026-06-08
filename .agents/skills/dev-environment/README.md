# Dev Environment

Two-phase dev environment skill. On first run (init), analyzes the actual project dependencies to generate Docker configuration and concrete commands. On subsequent runs, executes the concrete commands. Works with any language, any framework, any dependency — because the AI reads the actual project files, not a template.

**Trigger**: `/dev-environment [init|start|stop|reset|status|doctor|regenerate]`

See `SKILL.md` for the full skill definition used by AI agents.
