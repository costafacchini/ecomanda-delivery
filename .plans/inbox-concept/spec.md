# Feature Specification: Inbox Concept

**Plan**: inbox-concept
**Created**: 2026-07-17
**Status**: Final
**Input**: Issue #2977 — "Create the inbox concept in the app"

---

## User Stories

### Story 1 — Admin manages inboxes (P1)

As a licensee admin, I can create, edit, and delete inboxes — each with its own messenger or chat plugin configuration — so that a single licensee can operate multiple WhatsApp numbers or multiple chat system instances independently.

**Why this priority**: Core enabler of the feature. All other stories depend on inboxes existing.

**Independent Test**: Can be verified by hitting the CRUD API endpoints directly, independent of routing or frontend changes.

**Acceptance Scenarios**:

1. **Given** a licensee, **When** POST `/resources/inboxes` with `kind='messenger'` and valid `whatsappDefault`, **Then** an Inbox is created with status 201 and a unique `inboxToken`
2. **Given** two inboxes for the same licensee, **When** GET `/resources/inboxes?licensee=X`, **Then** both are returned
3. **Given** an inbox with `kind='messenger'` and licensee populated, **When** reading `inbox.webhookUrl`, **Then** it resolves to `/api/v1/messenger/message/?token={licensee.apiToken}&inbox={inboxToken}`
4. **Given** a POST body with no `name`, **When** the request is made, **Then** a 422 error with `name` validation message is returned
5. **Given** an inbox exists, **When** PUT `/resources/inboxes/:id` with a new name, **Then** the inbox is updated
6. **Given** an inbox exists, **When** DELETE `/resources/inboxes/:id`, **Then** it is removed and subsequent GET returns 404

---

### Story 2 — Department linked to messenger inbox (P1)

As a licensee admin, I can link a department to a messenger inbox so that the department uses that inbox's WhatsApp number for Baileys authentication.

**Why this priority**: Allows departments to retain multi-number WhatsApp routing via the new inbox abstraction.

**Independent Test**: Linkable via PUT on department; Baileys QR endpoint on department verifies delegation to inbox.

**Acceptance Scenarios**:

1. **Given** an inbox exists, **When** PUT `/resources/departments/:id` with `inbox` set, **Then** `department.inbox` is updated
2. **Given** a department with `inbox` linked, **When** GET `/resources/departments/:id/baileys-qr`, **Then** the response reflects the linked inbox's Baileys session
3. **Given** a department with no `inbox`, **When** GET `/resources/departments/:id/baileys-qr`, **Then** falls back to old department-scoped behavior

---

### Story 3 — Incoming webhook routes to correct inbox (P1)

As an external webhook sender, when I POST to the integration URL with `?inbox=<inboxToken>`, the message is processed using that inbox's plugin configuration instead of the licensee-level config.

**Why this priority**: The primary behavioral change — unlocks multi-account messaging.

**Independent Test**: Verifiable with direct HTTP POST to the integration API using a known inboxToken.

**Acceptance Scenarios**:

1. **Given** an inbox with `inboxToken='abc'`, **When** POST `/api/v1/messenger/message?token=X&inbox=abc`, **Then** `req.inbox` is resolved and `IngestMessengerMessage` receives `inboxId`
2. **Given** a licensee with one messenger inbox and no `inbox` param, **When** POST `/api/v1/messenger/message?token=X`, **Then** the system uses the first active messenger inbox for that licensee
3. **Given** an existing `?department=<departmentToken>` URL, **When** POST is made, **Then** the middleware still resolves the licensee correctly (backward compat)
4. **Given** an invalid or non-existent inbox token, **When** POST with `?inbox=bad`, **Then** response is 401

---

### Story 4 — Existing config migrated to inbox records (P2)

As an operator, when I run the migration script, each licensee's existing plugin config becomes one or more Inbox records, and existing Baileys department sessions are migrated to inbox-based sessions.

**Why this priority**: Required for system consistency — without migration, existing licensees have no inboxes and fallback breaks.

**Independent Test**: Run script against a seeded DB; verify inbox records and WhatsappSession.inbox are correct.

**Acceptance Scenarios**:

1. **Given** a licensee with `whatsappDefault='baileys'`, **When** migration runs, **Then** an Inbox with `kind='messenger'` and `whatsappDefault='baileys'` is created
2. **Given** a licensee with `chatDefault='local'`, **When** migration runs, **Then** an Inbox with `kind='chat'` and `chatDefault='local'` is created
3. **Given** a department with an existing `WhatsappSession` (department-scoped), **When** migration runs, **Then** a new Inbox is created, `WhatsappSession.inbox` is set, and `department.inbox` is set
4. **Given** a licensee with no plugin config set, **When** migration runs, **Then** no inbox is created for that licensee
5. **Given** migration has already run, **When** it runs again, **Then** no duplicate inboxes are created (idempotent)

---

### Story 5 — Chat inbox picker on new conversation (P2)

As a chat agent whose licensee has multiple active local chat inboxes, when I open the "Nova conversa" flow, I am asked to select which inbox the conversation originates from.

**Why this priority**: Required for correct outbound routing when multiple chat systems are active.

**Independent Test**: Visible in the chat UI when the licensee has >1 active chat inbox; Room.inbox is set correctly on creation.

**Acceptance Scenarios**:

1. **Given** a licensee with 2 active `kind='chat'` inboxes, **When** agent clicks "Nova conversa", **Then** an inbox selector modal is shown before the contact search step
2. **Given** a licensee with 1 active `kind='chat'` inbox, **When** agent clicks "Nova conversa", **Then** no selector is shown and inbox is auto-selected
3. **Given** agent selects an inbox from the modal, **When** the conversation is created, **Then** `Room.inbox` is set to the selected inbox's `_id`

---

### Edge Cases

- What if an inbox is deleted while it has active Rooms? → `Room.inbox` becomes a stale ref; treat as nullable (rooms still visible).
- What if `licensee.whatsappDefault` is set but no inboxes exist after migration runs? → Fallback: factory uses licensee config directly (ultimate backward compat).
- What if a department links to a non-messenger inbox? → Validation prevents it: `department.inbox` must reference a `kind='messenger'` inbox belonging to the same licensee.
- What if two inboxes share the same `inboxToken`? → Prevented by unique index on `inboxToken`.

---

## Functional Requirements

- **FR-001**: An Inbox MUST belong to exactly one Licensee and have `kind` of `'messenger'` or `'chat'`
- **FR-002**: An Inbox MUST have a unique `inboxToken` (UUID) auto-generated on create; a virtual `webhookUrl` MUST be derived from it
- **FR-003**: Messenger inboxes MUST support: `whatsappDefault`, `whatsappToken`, `whatsappUrl`; chat inboxes MUST support: `chatDefault`, `chatUrl`, `chatKey`, `chatIdentifier`
- **FR-004**: Auth middleware MUST parse `?inbox=<inboxToken>`, validate it belongs to the requesting licensee, and attach it to `req.inbox`
- **FR-005**: When no `inbox` param is provided, the system MUST fall back to the first active inbox matching the endpoint type for that licensee
- **FR-006**: `?department=<departmentToken>` routing MUST remain backward-compatible; if `department.inbox` is set, that inbox is used; otherwise old department-scoped logic applies
- **FR-007**: `Department` MUST support an optional `inbox: ObjectId` field; the referenced inbox MUST be `kind='messenger'` and belong to the same licensee
- **FR-008**: `WhatsappSession` MUST replace the `department` field with `inbox: ObjectId`; unique index changes from `{ licensee, department }` to `{ licensee, inbox }`
- **FR-009**: `Room` and `Message` MUST store a nullable `inbox: ObjectId` reference
- **FR-010**: Plugin factories MUST use inbox config when an inbox is provided; MUST fall back to licensee config when no inbox exists
- **FR-011**: The migration script MUST be idempotent — running it multiple times does not create duplicate inboxes
- **FR-012**: When a licensee has >1 active `kind='chat'` inbox with `chatDefault='local'`, the chat screen MUST present an inbox selector before creating a new Room

---

## Success Criteria

- **SC-001**: A licensee can have multiple active messenger inboxes (different WhatsApp accounts) and multiple chat inboxes — all functioning independently
- **SC-002**: Webhook URLs with `?inbox=<inboxToken>` route to the correct inbox's plugin config
- **SC-003**: Old webhook URLs (`?token=` only, or `?token=&department=`) continue to work via backward-compat fallback
- **SC-004**: Migration creates correct Inbox records for all licensees; existing Baileys department sessions are migrated to inbox sessions
- **SC-005**: Chat screen shows inbox picker when multiple local chat inboxes exist for a licensee
- **SC-006**: All existing tests pass; new tests added for all new behavior; `npx eslint .` returns no new errors

---

## Assumptions

- Chatbot config (`useChatbot`, `chatbotDefault`, etc.) remains licensee-level — out of scope for inboxes
- `Licensee` plugin fields (`whatsappDefault`, `chatDefault`, etc.) are kept on the model for backward compat; inboxes become the authoritative source of truth after migration runs
- The existing `?department=` auth middleware path is preserved with backward compat handling
- Inbox for `kind='chat'` does not require a Baileys-style session — only messenger inboxes have WhatsappSession records
- The `Body` model (async job bridge) will also carry `inbox: ObjectId` to preserve context through the job queue
