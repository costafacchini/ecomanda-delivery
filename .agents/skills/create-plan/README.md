# Create Plan

Spec-driven, git-native planning for multi-step features. Explores the codebase, generates a feature spec (user stories + Given/When/Then acceptance scenarios), breaks work into dependency-ordered tasks, generates test stubs from acceptance scenarios, and produces the full `.plans/` directory structure.

**Trigger**: `/create-plan`

**Workflow**:
1. Gather requirements and classify plan type
2. Explore codebase and detect test framework
3. **Generate `spec.md`** — user stories (P1/P2/P3), acceptance scenarios, FR-XXX requirements, SC-XXX success criteria. User confirms before proceeding.
4. Break into tasks — each task references its spec stories and gets test stubs generated from its acceptance scenarios
5. Commit plan + stubs to a branch, open PR for review before execution

See `SKILL.md` for the full skill definition used by AI agents.
