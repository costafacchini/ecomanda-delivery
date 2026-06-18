# Product

## Register

product

## Users

Two distinct usage patterns on the same application:

**Support agents** — operators handling day-to-day WhatsApp communications. Their primary screen is Chat: reading incoming messages, replying, managing conversation rooms. They live in high-frequency, repetitive workflows where speed and clarity are critical. Typically working in a call-center or remote-support context, often multitasking across multiple conversations.

**Admins** — less frequent users who configure the system: managing licensees, users, sectors, triggers, and templates. More technical and deliberate in their actions. They care about reliability, correctness, and understanding what changed.

Both roles are internal operators, never end-users of the product being supported.

## Product Purpose

Ecomanda Delivery is a WhatsApp / chat operations hub. It receives inbound webhooks from WhatsApp providers, persists and routes messages through BullMQ workers, and provides a management interface for the full communication lifecycle. Success means agents can handle conversations without friction, and admins can configure the system without confusion.

## Brand Personality

Friendly · Approachable · Clear

Warm but professional. The vivid orange (`#fa5619`) carries energy and confidence; the rest of the design should balance that with calm, legible structure. Not a consumer chat app — an operational tool built for real people doing real work.

## Anti-references

- **Heavy enterprise gray (Salesforce / SAP)**: Dense, cold, committee-built. This product should feel personal and direct, not bureaucratic.
- **Hyped SaaS (Intercom / Notion-style)**: Gradient-heavy, big hero metrics, performative polish. Substance over show.

## Design Principles

1. **Clarity over cleverness** — every screen should be self-evident. Agents should not have to think about the UI while managing live conversations.
2. **Warm without being casual** — the orange brand color carries the energy; the surrounding design provides the calm. Not a messaging app, not a cold ops console.
3. **Role-aware surfaces** — agents live in Chat, admins live in configuration screens. Design for both flows distinctly without cross-contamination.
4. **Operationally honest** — surface real system state (unread counts, connection status, queue health) without dramatizing or hiding it.
5. **Speed for the frequent path** — optimize for the things support agents do dozens of times a day: reading a room, sending a reply, scanning unread conversations.

## Accessibility & Inclusion

No formal WCAG compliance target. Good-faith accessibility: readable contrast ratios, keyboard navigation for primary flows, meaningful ARIA labels on interactive elements. Portuguese (Brazilian) is the primary UI language.
