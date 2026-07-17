// Test stubs generated during planning for inbox-concept/phase-1/task-01-inbox-model-api
// Implement these during task execution — do not delete pending stubs

describe('InboxesController', () => {
  describe('POST /resources/inboxes', () => {
    // Story 1 / Scenario 1
    it.todo('creates an inbox with a unique inboxToken')
    // Story 1 / Scenario 4
    it.todo('returns 422 when name is missing')
    it.todo('returns 422 when kind is missing')
  })

  describe('GET /resources/inboxes', () => {
    // Story 1 / Scenario 2
    it.todo('returns all inboxes for the given licensee')
    it.todo('returns empty array when licensee has no inboxes')
  })

  describe('PUT /resources/inboxes/:id', () => {
    // Story 1 / Scenario 5
    it.todo('updates inbox name')
    it.todo('returns 404 when inbox not found')
  })

  describe('DELETE /resources/inboxes/:id', () => {
    // Story 1 / Scenario 6
    it.todo('removes the inbox')
    it.todo('returns 404 when inbox not found')
  })

  describe('GET /resources/inboxes/:id/baileys-qr', () => {
    it.todo('returns QR data for messenger inbox with whatsappDefault=baileys')
    it.todo('returns connected:false when inbox is not kind=messenger')
  })

  describe('GET /resources/inboxes/:id/baileys-status', () => {
    it.todo('returns connected:true when session has credentials')
    it.todo('returns connected:false when no session exists')
  })
})
