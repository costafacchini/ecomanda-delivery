# Plan: Client Type Narrowing

**Status**: not-started
**Created**: 2026-05-31
**Last Updated**: 2026-05-31
**Estimated Demo Date**: N/A
**Assigned Dev**: Alan Costa Facchini
**Assigned QA**: unassigned

## Objective

Replace the `any` types in the React client with specific interfaces and prop types, working from the API service layer inward through contexts, pages, and shared components.

## Scope

### In Scope
- API service layer types in `client/src/services/` (api, auth, licensee, contact, message, template, trigger, user, dashboard)
- Context types in `client/src/contexts/`
- Page component prop types in `client/src/pages/`
- Shared component prop types in `client/src/components/`
- Shared client-side entity interfaces (response shapes from the backend API)

### Out of Scope
- **Backend model interfaces** — covered by the companion `type-backend` plan; client interfaces for API responses may share shape but are defined independently (no import from `src/types/`)
- **Test files** — spec files retain `any` freely
- **Third-party component prop types** — only custom component interfaces; library component types are handled by their own `@types/*` packages

## Kill Criteria

- If the client is migrated to a different framework (e.g., Next.js), reassess scope before proceeding.

## Phases

| Phase | Name | Tasks | Dependencies | Description |
|-------|------|-------|--------------|-------------|
| 1 | Services & API Types | task-01, task-02 | None | Define shared entity interfaces and type all service functions — foundation for page components |
| 2 | Components & Pages | task-03, task-04, task-05, task-06 | Phase 1 | Type React component props, context values, and page-level state using Phase 1 interfaces |

## Task Summary

| Task Path | Title | Phase | Status | Depends On |
|-----------|-------|-------|--------|------------|
| phase-1/task-01-api-service-types | API Base & Shared Interfaces | 1 | not-started | — |
| phase-1/task-02-entity-services | Entity Service Types | 1 | not-started | — |
| phase-2/task-03-context-types | Context Types | 2 | not-started | phase-1/task-01-api-service-types |
| phase-2/task-04-licensee-pages | Licensee Page Types | 2 | not-started | phase-1/task-02-entity-services |
| phase-2/task-05-message-contact-pages | Message & Contact Page Types | 2 | not-started | phase-1/task-02-entity-services |
| phase-2/task-06-template-trigger-user-pages | Template, Trigger & User Page Types | 2 | not-started | phase-1/task-02-entity-services |

## Branch Convention

Pattern: `plan/type-client/{task-path}`

Example branches:
- `plan/type-client/phase-1/task-01-api-service-types`
- `plan/type-client/phase-2/task-04-licensee-pages`

Base branch: `main`

## Key Files

| File/Directory | Relevance |
|----------------|-----------|
| `client/src/services/api.ts` | Axios base client — typed request/response wrappers |
| `client/src/services/*.ts` | One file per entity — 218 `any` occurrences here |
| `client/src/contexts/` | React contexts — typed context values and providers |
| `client/src/pages/` | Page components — prop types and local state |
| `client/src/components/` | Shared components — SelectContactsWithFilter, form components |
| `client/src/types/` | New directory for shared client interfaces (created in Phase 1) |

## Risks

- **API response shape drift** — client interfaces must match what the backend actually returns. Mitigation: derive shapes from existing service calls and spot-check against running API during development.
- **Formik integration** — several pages use Formik with heavily `any`-typed field handlers. Mitigation: use Formik's built-in generics (`useFormik<IFormValues>`) rather than replacing Formik's internal types.

## Success Criteria

- [ ] `client/src/types/` directory created with shared entity interfaces
- [ ] All service functions have typed parameters and return types (no `any` in function signatures)
- [ ] All React contexts have typed values (no `createContext<any>`)
- [ ] All page components have typed props and state
- [ ] All shared components have typed props
- [ ] `cd client && npx tsc --noEmit` passes with no new errors
- [ ] All existing client tests pass
- [ ] No regressions in existing UI functionality

## References

- **JIRA Epic**: N/A
- **Weekly Plan Brief**: N/A
- **Related Plans**: [Backend Type Narrowing](../type-backend/overview.md) (companion plan — defines backend interfaces; client defines its own mirrored API response types independently)
