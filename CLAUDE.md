# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ecomanda Delivery is a WhatsApp-Chat-Chatbot integration platform that routes messages between WhatsApp (via providers like Dialog/360dialog), chat platforms (Crisp, etc.), and chatbot services (Landbot, etc.). The system handles e-commerce flows including cart management, order processing, and payment integrations (PagarMe, Pedidos10).

**Important Context**: This is a legacy codebase developed as a learning project. It lacks formal architecture, has tight coupling between controllers and MongoDB, and is currently used as a refactoring practice ground.

## Architecture

### Entry Points
- **server.js**: HTTP server (Express 5) serving REST API and Bull Board queue UI
- **worker.js**: BullMQ worker processing async jobs with Redis-based distributed locking (Trafficlight pattern)
- **schedule-*.js**: Maintenance scripts for backups, cart/chat resets, and cleanup tasks

### Core Structure
```
src/
├── app/
│   ├── controllers/     # Route handlers (bloated, tightly coupled to DB)
│   ├── models/          # Mongoose schemas (Contact, Licensee, Message, Cart, etc.)
│   ├── repositories/    # Partial abstraction layer over Mongoose models
│   ├── jobs/            # BullMQ job handlers (feature-flagged via env vars)
│   ├── plugins/         # Integration adapters
│   │   ├── messengers/  # WhatsApp providers (Dialog, Twilio, etc.)
│   │   ├── chats/       # Chat platforms (Crisp, Chatwoot, etc.)
│   │   ├── chatbots/    # Chatbot integrations (Landbot, etc.)
│   │   ├── carts/       # Cart formatting for different platforms
│   │   ├── payments/    # Payment gateways (PagarMe)
│   │   └── integrations/# External APIs (Pedidos10, Facebook)
│   ├── helpers/         # Utilities (phone normalization, emoji handling, fractional products)
│   ├── services/        # Business logic (limited usage due to controller bloat)
│   ├── routes/          # Express route definitions
│   └── websockets/      # Socket.io real-time updates
├── config/              # Database, Redis, Queue, HTTP server configs
└── setup/               # Test helpers (mongodb-memory-server, fixtures)
```

### Module Aliases
Import via `@models`, `@controllers`, `@helpers`, `@config`, `@plugins`, `@repositories`, `@queries`, `@reports` (configured in package.json `_moduleAliases` and jest.config.mjs).

### Job Queue System
All async work flows through BullMQ queues (src/config/queue.js):
- Jobs are feature-flagged via environment variables (see src/app/jobs/index.js)
- Worker uses **Trafficlight pattern**: distributed locking per contact/licensee to prevent concurrent message processing races
- Jobs can return arrays of follow-up jobs to chain workflows
- Bull Board UI at `/queue` for monitoring

### Plugin Architecture
Each integration type (messenger/chat/chatbot) has a plugin directory:
- Each plugin implements standard interfaces (e.g., `sendMessage`, `parseMessage`)
- Plugins are selected at runtime based on Licensee configuration fields (`whatsappDefault`, `chatDefault`, `chatbotDefault`)

## Development Commands

### Backend
```bash
# Setup
docker compose up -d                  # Start MongoDB, Redis
cp .env.example .env                 # Configure environment (see .env.example for required vars)

# Development
yarn dev                             # Start server + worker with nodemon + docker
yarn dev:server                      # Server only (stops docker on Ctrl+C)
yarn dev:worker                      # Worker only

# Testing
yarn test                            # Run Jest tests (uses mongodb-memory-server)
yarn test:ci                         # CI mode (includes coverage)
yarn test:coverage                   # Generate HTML coverage report
yarn watch                           # Interactive watch mode

# Linting
yarn linter                          # ESLint + Prettier on src/app, src/config, src/setup

# Production
yarn start                           # Production server (loads Sentry, New Relic if enabled)
```

### Frontend (React)
```bash
cd client
yarn start                           # Dev server at localhost:3000 (proxies to :5001)
yarn build                           # Production build
yarn test                            # React test suite
yarn jest:watch                      # Watch mode
```

### Running Single Tests
```bash
# Backend
NODE_ENV=test jest path/to/file.spec.js

# Frontend
cd client && yarn test --testPathPattern=ComponentName
```

## Key Technical Patterns

### Message Flow
1. External webhook (WhatsApp/Chat/Chatbot) hits `/api/v1/{type}/message?token=LICENSEE_TOKEN`
2. Controller validates token, enqueues job to BullMQ
3. Worker acquires Trafficlight lock (contact or licensee scoped)
4. Job handler processes message, may route to other platforms
5. Follow-up jobs (send replies, update chat state) queued automatically
6. Lock released after job completion

### Trafficlight Locking
- Purpose: Prevent message reordering when webhooks arrive concurrently
- Implementation: MongoDB unique index on `{key, token}` with TTL
- Lock keys: `contact:{id}` or `licensee:{id}` (see src/app/helpers/Trafficlight.js)
- Jobs retry with exponential backoff if lock acquisition fails

### Cart Management
- Carts store products, delivery address, payment status
- Reset scheduled jobs clear abandoned carts after configurable timeout
- Formatting plugins convert cart data to platform-specific schemas (WhatsApp catalog format, etc.)

### Environment-Based Feature Flags
Jobs are conditionally loaded based on env vars:
- `INTEGRATE_PEDIDOS10=true` → Enable Pedidos10 order sync
- `INTEGRATE_PAGARME=true` → Enable payment processing
- `ENABLE_CHATBOTS=true` → Enable chatbot routing
- `ENABLE_RESET_JOBS=true` → Enable scheduled cleanup tasks
- `DONT_SEND_MESSAGE_TO_CHAT=true` → Disable outbound chat messages (testing)

## Testing Guidelines

### Test File Organization
- Place `.spec.js` files next to the code under test
- Use factories from `src/app/factories/` for test data (Fishery library)
- Helpers in `src/setup/` bootstrap mongodb-memory-server and seed fixtures

### Common Test Patterns
```javascript
// Setup memory DB before tests
import { connect, disconnect } from '@config/database'
beforeAll(async () => { await connect() })
afterAll(async () => { await disconnect() })

// Use factories instead of manual object creation
import { ContactFactory } from '@factories/Contact'
const contact = await ContactFactory.create({ number: '5511999999999' })
```

### Mock External Services
- Tests should not call real WhatsApp/Chat/Payment APIs
- Mock HTTP requests in plugin tests
- Use `jest-date-mock` for time-dependent logic

## API Structure

### Resource API (`/resources/*`)
Admin endpoints requiring JWT auth (`x-access-token` header):
- Users, Licensees, Contacts, Triggers, Templates, Messages
- See API_DOCUMENTATION.md for full reference

### Integration API (`/api/v1/*`)
Webhook endpoints authenticated via `?token=LICENSEE_TOKEN`:
- `/chat/message`, `/chatbot/message`, `/messenger/message` → Receive messages
- `/carts/*` → Cart CRUD operations
- `/orders/*` → Pedidos10 integration
- `/backgroundjobs` → Async job submission (e.g., PIX generation)

## Deployment Notes

### Heroku Procfile
- `web`: Single server process
- `scaler`: Dynamic worker scaling based on queue depth
- `worker` × 15: Multiple worker processes for job concurrency

### Required Environment Variables
```bash
MONGODB_URI              # MongoDB connection string
REDIS_URL                # Redis for BullMQ
SECRET                   # JWT signing secret
AWS_*                    # S3 credentials for file storage
PORT                     # HTTP server port (default 5000)
```

## Known Issues & Refactoring Goals

1. **Controller Bloat**: Business logic mixed with routing, tightly coupled to Mongoose
   - Goal: Extract use cases, introduce repositories consistently
2. **Database Coupling**: Direct Mongoose calls throughout, hard to test
   - Goal: Abstract data layer behind repository interfaces
3. **No TypeScript**: Prone to runtime type errors
   - Goal: Gradual migration to TS
4. **Inconsistent Error Handling**: Some routes throw, others return JSON errors
5. **PDV Module**: Point-of-sale code mixed in, should be extracted

## Debugging Tips

- **Queue Issues**: Check Bull Board at `http://localhost:5000/queue`
- **Lock Timeouts**: Adjust `JOB_LOCK_TTL_MS` (default 120s) if jobs timeout
- **Message Not Routing**: Verify Licensee configuration (`whatsappDefault`, `chatDefault`, etc.) and check job feature flags
- **Tests Failing**: Ensure `MONGOMS_DEBUG=0` to suppress mongodb-memory-server logs
