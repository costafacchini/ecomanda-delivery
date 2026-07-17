# Feature Specification: [FEATURE NAME]

**Plan**: [plan-slug]
**Created**: [DATE]
**Status**: Draft | Final
**Input**: [Original feature description as provided by the user]

---

## User Stories *(mandatory)*

<!--
  Each story must be independently testable — implementing just one should
  deliver a viable MVP slice. Assign P1 to the most critical.
-->

### Story 1 — [Brief Title] (P1)

[Describe this user journey in plain language — who does what and why]

**Why this priority**: [Value delivered and rationale for rank]

**Independent Test**: [Describe how this story can be verified standalone — "Can be fully tested by [action] and delivers [value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### Story 2 — [Brief Title] (P2)

[Describe this user journey]

**Why this priority**: [Value and rationale]

**Independent Test**: [Standalone verification approach]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### Story N — [Brief Title] (PN)

[Add more stories as needed. Each gets its own priority and scenarios.]

---

### Edge Cases

- What happens when [boundary condition]?
- How does the system handle [error scenario]?
- What if [concurrent / race condition]?

---

## Functional Requirements *(mandatory)*

- **FR-001**: System MUST [specific capability]
- **FR-002**: Users MUST be able to [key interaction]
- **FR-003**: System MUST [data / persistence requirement]
- **FR-004**: System MUST [security / validation rule]

*Mark unclear requirements explicitly:*

- **FR-005**: System MUST [thing] via [NEEDS CLARIFICATION: detail not specified]

---

## Success Criteria *(mandatory)*

- **SC-001**: [Measurable outcome — e.g., "Users complete onboarding in < 2 min"]
- **SC-002**: [Performance / scale metric]
- **SC-003**: [User satisfaction or business metric]

---

## Assumptions

- [Assumption about target users or environment]
- [Assumption about scope boundaries — what is explicitly out of scope]
- [Dependency on existing system or service]
