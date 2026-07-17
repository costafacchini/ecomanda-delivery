# Execute Plan

Run all remaining tasks in a plan. Dependency DAG, parallel agent support, wave execution, formal phase gates — with spec-driven acceptance validation at each gate.

**Trigger**: `/execute-plan`

**Phase gate includes**:
- All acceptance scenario stubs from `spec.md` for completed tasks must pass (no pending tests remain)
- SC-XXX success criteria verified at plan completion

See `SKILL.md` for the full skill definition used by AI agents.
