# Architectural Decisions

Append-only log of significant decisions made during development.
AI agents should check this before making architectural choices.

**Format**: Each entry records what was decided, why, and what was rejected.

---

<!-- Entries appended by AI during sessions. Example:

## [2026-03-29] Use JWT for authentication instead of session cookies

**Context**: Needed stateless auth for the API
**Decision**: JWT tokens in httpOnly cookies
**Rejected**: Server-side sessions (didn't want Redis dependency)
**Consequences**: Need token refresh logic, 24h expiry

-->
