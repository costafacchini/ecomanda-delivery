# Baileys WhatsApp Plugin — Usage Guide

**Last Updated**: 2026-05-16
**Context**: Step-by-step guide for configuring a Licensee to use the Baileys WhatsApp plugin and consuming the application's API to send and receive messages.

---

## Overview

The Baileys plugin connects a Licensee to WhatsApp via the `@whiskeysockets/baileys` library — a direct WebSocket implementation of the WhatsApp Web protocol. No external API token or paid service is required. Authentication is done by scanning a QR code with a WhatsApp-linked phone.

---

## Step 1 — Configure the Licensee

Set `whatsappDefault` to `"baileys"` when creating or updating a Licensee.

**Unlike other messenger plugins (utalk, dialog, ycloud), Baileys does NOT require `whatsappToken` or `whatsappUrl`.** Those fields are only validated when `whatsappDefault` is set to a non-Baileys value.

### Minimum required payload

```json
{
  "whatsappDefault": "baileys"
}
```

### Example: create a Licensee via API

```http
POST /api/v1/resources/licensees
x-access-token: <jwt-token>
Content-Type: application/json

{
  "name": "My Store",
  "email": "store@example.com",
  "whatsappDefault": "baileys"
}
```

Or set it on an existing Licensee:

```http
PUT /api/v1/resources/licensees/:id
x-access-token: <jwt-token>
Content-Type: application/json

{
  "whatsappDefault": "baileys"
}
```

> **Note**: The `whatsappDefault` enum accepts: `"utalk"`, `"dialog"`, `"ycloud"`, `"pabbly"`, `"baileys"`, or empty string.

---

## Step 2 — Authenticate via QR Code

Before any message can be sent or received, the Licensee's WhatsApp account must be authenticated. This is done once (or whenever the session expires).

### Endpoint

```
POST /api/v1/resources/licensees/:id/baileys-qr
x-access-token: <jwt-token>
```

No request body is needed.

### What happens internally

1. The server loads (or creates) a `WhatsappSession` record for this Licensee.
2. A Baileys WebSocket is opened using stored credentials, or fresh ones if none exist.
3. WhatsApp sends a QR code via the socket.
4. The server returns the QR string; you render it so the user can scan it.
5. After scanning, credentials are persisted in `WhatsappSession` — the session survives restarts.

### Response shapes

| Condition | HTTP Status | Body |
|-----------|-------------|------|
| QR generated | `200` | `{ "qr": "<qr-string>" }` |
| Already authenticated | `200` | `{ "message": "Já conectado" }` |
| Licensee not using Baileys | `200` | `{ "message": "Licensee não usa Baileys" }` |
| Timeout (> 15 s, no QR) | `408` | `{ "message": "Timeout ao gerar QR Code" }` |

### Rendering the QR code

The `qr` value is a raw QR string. Use any QR-code renderer to display it.

**JavaScript example (browser):**

```js
import QRCode from 'qrcode'

const res = await fetch('/api/v1/resources/licensees/LICENSEE_ID/baileys-qr', {
  method: 'POST',
  headers: { 'x-access-token': jwtToken },
})
const data = await res.json()

if (data.qr) {
  const canvas = document.getElementById('qr-canvas')
  await QRCode.toCanvas(canvas, data.qr)
} else {
  console.log(data.message) // "Já conectado" or error hint
}
```

### Re-authenticating

If the session is invalidated (phone was logged out, credentials expired), simply call the endpoint again. A new QR will be generated and the session record will be updated after the user scans it.

---

## Step 3 — Sending a WhatsApp Message

The Baileys plugin does **not** expose a direct "send message" HTTP endpoint. Outgoing messages follow the application's existing message-queue flow:

1. A `Message` document is created in the database with `destination: 'to-messenger'`.
2. A background BullMQ job picks it up and calls `Baileys.sendMessage(messageId)`.
3. The plugin opens a socket, sends the message to the contact's WhatsApp JID, then closes the socket.

### 3.1 — Login to get an admin JWT

All `/resources/*` endpoints require a JWT passed as `x-access-token`. Tokens expire after **7 days**.

```http
POST http://127.0.0.1:5001/login
Content-Type: application/json

{
  "email": <email>,
  "password": <password>
}
```

Response:

```json
{ "token": "<jwt-token>" }
```

Error responses:

| HTTP | Meaning |
|------|---------|
| `401` | Wrong email or password |
| `422` | Email or password not provided |

Use this `token` as the `x-access-token` header in all subsequent admin requests.

### 3.2 — Create the outgoing message

```http
POST http://127.0.0.1:5001/resources/messages
x-access-token: <jwt-token>
Content-Type: application/json

{
  "licensee": <licensee-id>,
  "contact": <contact-id>, you can use it or phone
  "phone": <phone-number or group JID>,
  "kind": <"text" | "file">,
  "fileName": <required if kind is "file">,
  "url": <required if kind is "file">,
  "text": <text>,
  "destination": "to-messenger"
}
```

Once persisted with `destination: "to-messenger"`, the job queue handles delivery automatically.

### Supported message types

| Type | Supported |
|------|-----------|
| `text` | Yes |
| `image` | No (not yet implemented in plugin) |
| `audio` | No |
| Other | No |

---

## Step 4 — Receiving Incoming Messages via the Webhook

### Webhook endpoint

```
POST https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=<licensee.apiToken>
Content-Type: application/json
```

The `token` query parameter is the Licensee's `apiToken` field. No other authentication is needed. The body is stored raw and then processed by the Baileys plugin.

### What the endpoint does internally

```
POST /messenger/message → body saved as Body.content
→ "messenger-message" BullMQ job queued
→ Baileys.responseToMessages(body.content)
   → parseContactData(body)  — extracts phone number and name
   → parseMessage(body)      — extracts text
→ Contact created/updated in DB
→ Message created with destination "to-chat" or "to-chatbot"
```

### Required body shape

The body must follow the raw **Baileys socket message event** format. The top-level object is a single message entry (not the full `messages.upsert` event array).

#### Plain text message

```json
{
  "key": {
    "remoteJid": "5511999990000@s.whatsapp.net",
    "fromMe": false,
    "id": "BAILEYS_MSG_ID"
  },
  "message": {
    "conversation": "Olá, quero fazer um pedido!"
  },
  "pushName": "Nome do Contato",
  "messageTimestamp": 1715000000
}
```

#### Extended text message

```json
{
  "key": {
    "remoteJid": "5511999990000@s.whatsapp.net",
    "fromMe": false,
    "id": "BAILEYS_MSG_ID"
  },
  "message": {
    "extendedTextMessage": {
      "text": "Mensagem com formatação ou link"
    }
  },
  "pushName": "Nome do Contato",
  "messageTimestamp": 1715000000
}
```

### Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `key.remoteJid` | Yes | Sender's WhatsApp JID — must end in `@s.whatsapp.net` (individual) or `@g.us` (group). The suffix is stripped to derive the contact's phone number. |
| `key.fromMe` | No | Set `false` for messages received from a contact. |
| `key.id` | Yes | Unique message ID — stored as `messageWaId` on the created Message record. |
| `message.conversation` | Yes* | Plain text body. Use this **or** `extendedTextMessage.text`. |
| `message.extendedTextMessage.text` | Yes* | Alternative text field for formatted/long messages. |
| `pushName` | No | Contact's display name. Falls back to the phone number if omitted. |
| `messageTimestamp` | No | Unix timestamp of the message. Not stored, used by Baileys internally. |

> Non-text payloads (`imageMessage`, `audioMessage`, etc.) are **not parsed** — the message is silently dropped.

### Phone number extraction

`remoteJid` `5511999990000@s.whatsapp.net` → strips `@s.whatsapp.net` → `NormalizePhone("5511999990000")` → contact `number` + `type` used to find or create the Contact record.

### Example curl

```bash
curl -X POST \
  "https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": {
      "remoteJid": "5511999990000@s.whatsapp.net",
      "fromMe": false,
      "id": "TEST_MSG_001"
    },
    "message": {
      "conversation": "Olá!"
    },
    "pushName": "Fulano"
  }'
```

Response (always `200` if the token is valid):

```json
{ "body": "Solicitação de mensagem para a plataforma de messenger agendado" }
```

---

## Session Persistence

Baileys session data (credentials and encryption keys) is stored in the `WhatsappSession` collection:

```
{
  licensee: ObjectId,   // one session per licensee (unique index)
  creds:    Object,     // Baileys auth credentials
  keys:     Object,     // Baileys encryption keys
  createdAt: Date,
  updatedAt: Date
}
```

Sessions survive server restarts. You only need to re-scan the QR code if:
- The phone account is explicitly logged out from WhatsApp's "Linked Devices" menu.
- The session record is deleted from the database.

---

## Full Flow Summary

```
1. Configure Licensee: whatsappDefault = "baileys"

2. Authenticate:
   POST /api/v1/resources/licensees/:id/baileys-qr
   → render QR → user scans → session saved in DB

3. Receive an incoming message (contact → app):
   POST /api/v1/messenger/message/?token=<apiToken>
   Body: Baileys socket event shape (key + message + pushName)
   → Body saved → "messenger-message" job queued
   → Baileys.responseToMessages(body)
      → Contact created/updated
      → Message created with destination "to-chat" or "to-chatbot"

4. Send an outgoing message (app → contact):
   Create Message with destination "to-messenger" via DB/API
   → "send-message-to-messenger" BullMQ job
   → Baileys.sendMessage(messageId)
   → socket.sendMessage(jid, { text }) → delivered to WhatsApp
```

---

---

## Step 5 — Group Sync & Directory

This feature allows a connected Baileys licensee to import their WhatsApp group memberships into the app's `Contact` records. Once synced, groups can be targeted with outbound messages the same way individual contacts are.

> Note: This feature was delivered across branches `task-01-baileys-groups-directory-plugin-core`, `task-02-baileys-groups-directory-directory-sync-api`, and `task-03-baileys-groups-directory-admin-sync-surface`.

### 5.1 — What gets synced

Only **groups the linked WhatsApp account belongs to** are synced. The operation uses `groupFetchAllParticipating()` from the Baileys SDK, which does not read or import any chat/message history. Contact discovery (syncing individual contacts from the phone's address book) is explicitly **not** part of this feature.

Each imported group becomes a `Contact` record with:

| Field | Value |
|-------|-------|
| `type` | `@g.us` |
| `isGroup` | `true` |
| `waId` | Full group JID, e.g. `120363012345678901@g.us` |
| `name` | Group subject (display name) |
| `number` | Group JID with the `@g.us` suffix stripped |
| `talkingWithChatBot` | `false` |
| `licensee` | The licensee's ObjectId |

### 5.2 — Idempotent matching strategy

The sync use case (`SyncBaileysDirectory`) is idempotent. For each group returned from WhatsApp:

1. Attempt to find an existing contact by `licensee + waId`.
2. If not found, fall back to `licensee + number + type`.
3. If found: update in place (`updatedGroups` counter increments).
4. If not found: create a new record (`importedGroups` counter increments).

Repeated syncs will not create duplicate records.

### 5.3 — Triggering sync via admin endpoint

```http
POST /resources/licensees/:id/baileys-sync
x-access-token: <jwt-token>
```

No request body is required. The endpoint requires the same admin JWT used by other `/resources/*` endpoints.

**Response (200)**:

```json
{
  "importedContacts": 0,
  "updatedContacts": 0,
  "importedGroups": 3,
  "updatedGroups": 1,
  "skipped": 0
}
```

- `importedGroups`: new group Contact records created
- `updatedGroups`: existing group Contact records updated
- `importedContacts` / `updatedContacts` / `skipped`: always `0` in this implementation (contact-level sync is not implemented)

**Error cases**:

| Condition | Response |
|-----------|----------|
| Licensee `whatsappDefault` is not `"baileys"` | `200` with `{ "message": "Licensee não usa Baileys" }` |
| Invalid licensee ID | `500` with error message |

> The endpoint does not return `404` for an invalid licensee — a Mongoose `CastError` bubbles as `500`. A `422` is not returned because no request body validation is performed.

### 5.4 — Triggering sync via admin UI

In the Licensee form (WhatsApp panel), when `whatsappDefault` is `"baileys"` and the session is **connected** and the Licensee record has been **persisted** (has an `id`), a "Sincronizar Grupos" button appears.

- While syncing, the button label changes to "Sincronizando..." and is disabled.
- On success, the panel shows: `Grupos importados: N | Grupos atualizados: N`
- On failure, an error message is displayed: `Erro ao sincronizar grupos`

### 5.5 — Querying group contacts via API

After sync, imported groups appear as normal `Contact` records. Use the existing contacts index endpoint with the new filter parameters:

**Filter by group contacts only**:

```http
GET /resources/contacts?isGroup=true
x-access-token: <jwt-token>
```

**Filter by updatedAt range** (ISO 8601 datetime strings):

```http
GET /resources/contacts?updatedAtStart=2026-05-01T00:00:00.000Z&updatedAtEnd=2026-05-31T23:59:59.999Z
x-access-token: <jwt-token>
```

**Combine filters**:

```http
GET /resources/contacts?isGroup=true&licensee=<licensee-id>
x-access-token: <jwt-token>
```

Both `updatedAtStart` and `updatedAtEnd` are optional. If only `updatedAtStart` is supplied, the query returns all records updated on or after that date. If only `updatedAtEnd` is supplied, it returns all records updated before or on that date.

### 5.6 — Inspecting groups in the Contacts UI

On the Contacts index page, a toggle button appears in the filter bar:

- Default state: **"Todos os Contatos"** (all contacts shown)
- After clicking: **"Apenas Grupos"** (sends `?isGroup=true` to the backend)

Clicking the highlighted button again resets the filter to show all contacts.

### 5.7 — How group sends work

When an outbound message is sent to a contact whose `waId` ends with `@g.us`, the Baileys plugin bypasses the `socket.onWhatsApp()` person-number resolution lookup and sends directly to the stored group JID.

The detection is based on the constant `JID_GROUP_SUFFIX = '@g.us'` defined in `Baileys.js`:

```
if (rawId.endsWith('@g.us')) {
  // send directly to stored group JID — no lookup needed
} else {
  // resolve canonical JID via onWhatsApp() for individual contacts
}
```

This means:
- For individual contacts: `socket.onWhatsApp(number)` resolves the canonical JID (handles Brazilian 9th-digit normalization).
- For group contacts: the stored `waId` is used verbatim as the destination JID.

### 5.8 — Known limitations and constraints

- **No message history**: The sync uses only `groupFetchAllParticipating()`. No chat messages are read, imported, or persisted at any point.
- **No contact discovery**: Only groups are synced. The phone's address book contacts are not imported.
- **No group management**: Group creation, join/leave, participant management are not supported.
- **Live session required**: The sync endpoint requires an active Baileys socket connection. If the session is disconnected, the sync will fail with a socket error. Re-authenticate via the QR code flow first.
- **Request timeout**: The sync completes within a single HTTP request window. For large group memberships, ensure the HTTP client timeout is generous enough (the Baileys `groupFetchAllParticipating()` call is synchronous within the request).

### 5.9 — Manual verification checklist

Live WhatsApp verification requires a real linked account and cannot be automated in CI. Before shipping this feature to production, complete the following steps manually:

- [ ] QR code endpoint still works: `POST /resources/licensees/:id/baileys-qr` returns a QR or "Já conectado"
- [ ] Status endpoint still works: `GET /resources/licensees/:id/baileys-status` returns `{ "connected": true/false }`
- [ ] Sync returns counts: `POST /resources/licensees/:id/baileys-sync` returns `{ importedGroups, updatedGroups, ... }`
- [ ] Imported `@g.us` groups appear in the Contacts screen
- [ ] `GET /resources/contacts?isGroup=true` returns only group contacts
- [ ] `GET /resources/contacts?isGroup=false` returns only non-group contacts
- [ ] `GET /resources/contacts?updatedAtStart=<ISO>` filters correctly
- [ ] A text message created with `destination: "to-messenger"` for an imported group contact is delivered to the WhatsApp group
- [ ] Repeated sync calls do not create duplicate Contact records
- [ ] No chat or message history is read or persisted as part of any sync operation

---

---

## Step 6 — Persistent Socket Monitor

> Feature added: 2026-06-02  
> Gated by environment variable: `ENABLE_BAILEYS_SOCKET=true`

### What it enables

When `ENABLE_BAILEYS_SOCKET=true` is set, the server maintains a **persistent WebSocket per Baileys licensee** that stays open for the lifetime of the process. This removes the need for the licensee's app (or any external relay) to push messages to the HTTP webhook for inbound flow.

Two event streams are consumed:

| Event | What it does |
|-------|-------------|
| `messages.upsert` | Captures inbound messages (`fromMe: false`) and feeds them directly into the `messenger-message` BullMQ pipeline — identical to the existing HTTP webhook flow |
| `messages.update` | Captures delivery receipts and updates `Message.sendedAt`, `Message.deliveredAt`, and `Message.readAt` via `Baileys.responseToMessages()` |

### Boot behavior

On server start, `BootBaileysSocketSessions` is called as a fire-and-forget hook:

1. All `Licensee` records with `whatsappDefault === 'baileys'` are loaded.
2. For each licensee, the corresponding `WhatsappSession` record is checked.
3. If `session.creds` is non-empty (i.e., the account has been authenticated), `startBaileysSocket(licensee)` is called.
4. Licensees with empty or missing `creds` are logged and skipped — no socket is opened until they re-authenticate via QR.
5. Errors for any single licensee are caught and logged; boot continues for the remaining licensees.

### Post-QR behavior

When `POST /api/v1/resources/licensees/:id/baileys-qr` is called:

- If `ENABLE_BAILEYS_SOCKET=true`, `startBaileysSocket(licensee)` is triggered as a fire-and-forget call regardless of whether the response is a new QR string or `"Já conectado"`.
- This ensures the persistent socket is started (or reconnected) after every QR interaction without requiring an app restart.

### How inbound messages reach the DB

The persistent socket calls `IngestMessengerMessage.execute({ body: msg, licenseeId })`, which is the same entry point used by the HTTP webhook. The full pipeline is:

```
socket messages.upsert event
→ IngestMessengerMessage.execute({ body, licenseeId })
  → Body record saved
  → "messenger-message" BullMQ job queued
  → Baileys.responseToMessages(body.content)
     → parseContactData(body)  — extracts phone number and name
     → parseMessage(body)      — extracts text
  → Contact created/updated
  → Message created with destination "to-chat" or "to-chatbot"
```

### How delivery receipts update message timestamps

The `messages.update` event carries a `status` code per message key. `parseMessageStatus(statusCode)` maps these to timestamp fields:

| Status code | Field updated |
|-------------|--------------|
| `2` (server received) | `sendedAt` |
| `3` (delivered to device) | `deliveredAt` |
| `4` (read by recipient) | `readAt` |

`Baileys.responseToMessages(update)` is called from the socket's `onReceiptUpdate` callback, which delegates to the existing `responseToMessages` flow.

### HTTP webhook fallback

The HTTP webhook endpoint (`POST /v1/messenger/message/?token=<apiToken>`) **remains active** and is not removed. It serves as:

- A fallback for environments where `ENABLE_BAILEYS_SOCKET` is not set.
- A compatibility path for non-Baileys messengers (`utalk`, `dialog`, `ycloud`, `pabbly`).
- A manual override if the persistent socket is not running.

When both the persistent socket and the HTTP webhook are active for the same licensee, duplicate messages are possible if the external relay also sends to the webhook. Use only one inbound path per licensee.

### Manual verification checklist

Before enabling `ENABLE_BAILEYS_SOCKET=true` in production:

- [ ] Set `ENABLE_BAILEYS_SOCKET=true` in the environment and restart the server
- [ ] Confirm server logs show `"Baileys boot: iniciando socket para licensee <id>"` for each authenticated licensee
- [ ] Send a text message from a real WhatsApp account to the licensee's number — confirm a `Message` record appears in the DB without hitting the HTTP webhook
- [ ] Confirm delivery receipt (`delivered`) updates `message.deliveredAt` on the corresponding record
- [ ] Confirm read receipt updates `message.readAt`
- [ ] Call `POST /api/v1/resources/licensees/:id/baileys-qr` on a connected licensee — confirm logs show socket start and no duplicate messages appear
- [ ] Restart the server — confirm sockets reconnect automatically at boot for all licensees with active sessions
- [ ] Confirm the HTTP webhook (`POST /v1/messenger/message`) still works for non-Baileys licensees

---

## Troubleshooting

| Symptom | Likely cause | Action |
|---------|-------------|--------|
| `/baileys-qr` returns `408` | Server couldn't open socket or WhatsApp didn't respond in 15 s | Retry; check server logs for socket errors |
| `/baileys-qr` returns `"Licensee não usa Baileys"` | `whatsappDefault` is not `"baileys"` | Update Licensee config (Step 1) |
| Message `sended: true` but not received | Brazilian 9th-digit JID mismatch | The plugin calls `socket.onWhatsApp()` to resolve the canonical JID — if this returns "not found", the number is not on WhatsApp or the stored number format is wrong |
| Message stuck as `sended: false` | Socket error during send | Check `message.error` field; verify session is still valid |
| QR generated but scanning fails | Stale credentials in session | Delete the `WhatsappSession` record for the licensee and re-call the endpoint |
| Messages not delivered after restart | Session should auto-restore from DB | If not, check `WhatsappSession.creds` is populated (not empty object) |
| `/baileys-sync` returns `"Licensee não usa Baileys"` | Licensee `whatsappDefault` is not set to `"baileys"` | Update Licensee config |
| `/baileys-sync` fails with socket error | Session disconnected | Re-authenticate via QR code, then retry sync |
| "Sincronizar Grupos" button not visible | Session not connected, or licensee not yet persisted | Check connection status; ensure licensee has been saved (has an `id`) |
| Groups appear in sync count but not in Contacts list | `isGroup` filter not applied | Verify `GET /resources/contacts?isGroup=true` — no filter means all contacts including groups are returned |
