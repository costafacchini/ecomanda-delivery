# Task: Add App Service to docker-compose

**Plan**: Ecomanda Docker Containerization
**Phase**: 2
**Task ID**: task-04
**Task Path**: phase-2/task-04-compose-dev
**Spec References**: Story 1 (P1), FR-002, FR-003, SC-001
**Depends On**: phase-1/task-01-dockerfile
**JIRA**: N/A

## Objective

Add the `app` service to `docker-compose.yml` so that `docker-compose up` starts the full local stack (MongoDB + Redis + ecomanda) with local storage, no external services required.

## Context

`docker-compose.yml` currently defines `mongo`, `mongo-express`, and `redis` services. The ecomanda app itself is missing. Adding it completes the local dev setup.

The `app` service must:
- Build from the `Dockerfile` created in task-01
- Set `STORAGE_PROVIDER=local` and `APP_URL=http://localhost:5000` for local dev
- Mount an `uploads` volume at `/app/uploads`
- Set `MONGODB_URI` pointing to the local `mongo` container
- Set `REDIS_URL` pointing to the local `redis` container
- Set `ENABLE_BAILEYS_SOCKET=false` (no inbound socket in dev by default)
- Expose port `5000`
- Depend on `mongo` and `redis`

Env vars that require secrets (`SECRET`, `DEFAULT_USER`, `DEFAULT_PASSWORD`) should be loaded from a `.env` file — `docker-compose` reads `.env` automatically. Document this in `.env.example`.

**Repo**: `/Users/alan/Developer/pessoal/ecomanda-delivery`

## Before You Start

- [ ] Confirm task-01 is `complete` — `Dockerfile` must exist at repo root
- [ ] `cd /Users/alan/Developer/pessoal/ecomanda-delivery && git switch main && git pull`
- [ ] Read current `docker-compose.yml` in full to understand the existing service names and network
- [ ] Mark this task `in-progress` in `status.md`

## File Ownership

| File | Action | Notes |
|------|--------|-------|
| `docker-compose.yml` | modify | Add `app` service + `uploads` volume |
| `.env.example` | modify | Add docker-compose usage instructions |

### Do NOT Modify

- `Dockerfile` — owned by task-01
- `src/app/plugins/storage/Local.ts` — owned by task-02
- `src/app/plugins/messengers/Base.ts` — owned by task-03

## Implementation Steps

### Step 1: Add `app` service and `uploads` volume to `docker-compose.yml`

The full updated file should look like:

```yaml
services:
  mongo:
    image: mongo
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: pwk372ew
      MONGO_INITDB_DATABASE: ecomanda-delivery
    ports:
      - 27017:27017
    volumes:
      - mongo_data:/var/lib/mongodb/data
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro

  mongo-express:
    image: mongo-express
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: root
      ME_CONFIG_MONGODB_ADMINPASSWORD: pwk372ew
      ME_CONFIG_BASICAUTH_USERNAME: root
      ME_CONFIG_BASICAUTH_PASSWORD: pwk372ew
      ME_CONFIG_MONGODB_URL: mongodb://root:pwk372ew@mongo:27017/ecomanda-delivery?authSource=admin
    depends_on:
      - mongo

  redis:
    image: redis:6
    ports:
      - "6381:6379"
    volumes:
      - redis_data:/var/lib/redis/data

  app:
    build: .
    ports:
      - "5000:5000"
    depends_on:
      - mongo
      - redis
    environment:
      NODE_ENV: production
      PORT: "5000"
      MONGODB_URI: mongodb://root:pwk372ew@mongo:27017/ecomanda-delivery?authSource=admin
      REDIS_URL: redis://redis:6379
      STORAGE_PROVIDER: local
      LOCAL_STORAGE_PATH: /app/uploads
      APP_URL: http://localhost:5000
      ENABLE_BAILEYS_SOCKET: "false"
      # Loaded from .env file:
      # SECRET, DEFAULT_USER, DEFAULT_PASSWORD
    env_file:
      - .env
    volumes:
      - uploads:/app/uploads

volumes:
  mongo_data:
  redis_data:
  uploads:
```

> Note: `env_file: .env` loads additional vars (SECRET, DEFAULT_USER, DEFAULT_PASSWORD) without hardcoding them in docker-compose. The `.env` file is git-ignored.

### Step 2: Update `.env.example` with docker-compose usage note

Add a section:

```
# --- Docker Compose (local dev) ---
# Copy this file to .env and fill in the secrets below.
# docker-compose reads .env automatically.
SECRET=change-me
DEFAULT_USER=admin@example.com
DEFAULT_PASSWORD=changeme123

# Storage (set in docker-compose.yml for local dev; override here only if needed)
# STORAGE_PROVIDER=local
# LOCAL_STORAGE_PATH=/app/uploads
# APP_URL=http://localhost:5000
```

### Step 3: Verify local stack starts

```bash
# Copy .env.example to .env and fill in SECRET, DEFAULT_USER, DEFAULT_PASSWORD
cp .env.example .env

docker-compose up --build
```

Check:
- `http://localhost:5000/login` returns HTTP 200
- `http://localhost:8081` (mongo-express) is accessible
- App logs show MongoDB and Redis connected

### Step 4: Smoke test local file upload (if a Baileys session exists)

With `STORAGE_PROVIDER=local`, trigger a file message send and confirm:
- File appears under the `uploads` Docker volume
- Returned URL is `http://localhost:5000/uploads/...`

## Testing

**Spec scenarios covered**:
- [ ] Scenario 1.1 — Full stack boots: `docker-compose up` — all services running, app at port 5000
- [ ] Scenario 1.2 — App connects to local MongoDB and Redis: app logs confirm both connections

**Additional verification**:
- [ ] `docker-compose up --build` exits without errors
- [ ] `docker-compose ps` shows all 4 services as `running`
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/login` returns `200`

## Documentation / KB Updates

No KB/doc updates required — this is configuration for ecomanda, not a ticketmaker pattern.

## Completion Criteria

- [ ] `docker-compose.yml` has `app` service, `uploads` volume
- [ ] `.env.example` documents secrets needed for docker-compose
- [ ] `docker-compose up --build` starts all 4 services successfully
- [ ] App is reachable at `http://localhost:5000`
- [ ] Changes committed on `plan/ecomanda-docker/phase-2/task-04-compose-dev` branch
- [ ] Status updated in `status.md`
