---
name: dev-environment
description: >-
  Two-phase dev environment skill. On first run (init), analyzes the actual
  project dependencies to generate Docker configuration and concrete commands.
  On subsequent runs, executes the concrete commands. Works with any language,
  any framework, any dependency — because the AI reads the actual project files,
  not a template.
trigger: "start dev", "spin up", "dev setup", "init environment", "reset environment", "dockerize", "containerize"
auto: false
argument-hint: "[init | start | stop | reset | status | doctor | regenerate]"
---

# Dev Environment

## Triggers

### Manual
- `/dev-environment [init|start|stop|reset|status|doctor|regenerate]`
- "start dev", "spin up", "dev setup"
- "init environment", "reset environment"
- "dockerize", "containerize"
- "set up local dev"

---

Two-phase skill: **init** generates everything from your actual project files,
then **start/stop/reset** use the concrete commands.

## Modes

| Command | Phase | What it does |
|---------|-------|-------------|
| `init` | Setup | Analyze repo, generate Docker files + concrete commands |
| `start` | Daily | Build, start, install deps, migrate, verify |
| `stop` | Daily | Graceful shutdown |
| `reset` | Rare | Tear down + rebuild from scratch |
| `status` | Daily | Show running services and health |
| `doctor` | Debug | Diagnose common problems |
| `regenerate` | Rare | Re-analyze project and regenerate everything |

Default (no argument): `start` if Docker files exist, `init` if they don't.

---

## Phase 1: Init (first run or regenerate)

This is where the AI does the heavy lifting. **Read the actual project files**
to understand what this specific repo needs.

### Step 1: Deep dependency analysis

Read ALL of these (whichever exist) and build a complete dependency map:

**Application dependencies:**
- `Gemfile` / `Gemfile.lock` — Ruby gems and their system requirements
- `package.json` / `yarn.lock` / `pnpm-lock.yaml` — Node packages
- `requirements.txt` / `pyproject.toml` / `Pipfile` — Python packages
- `go.mod` / `go.sum` — Go modules
- `Cargo.toml` / `Cargo.lock` — Rust crates
- `composer.json` / `composer.lock` — PHP packages
- `mix.exs` / `mix.lock` — Elixir packages
- `pom.xml` / `build.gradle` / `build.gradle.kts` — JVM dependencies

**Configuration files:**
- `config/database.yml`, `config/cable.yml`, `config/redis.yml` — service connections
- `.env.example`, `.env.sample`, `.env.development` — environment variables
- `docker-compose.yml` (if exists already — read and improve, don't start from scratch)
- `Procfile`, `Procfile.dev` — process definitions
- `config/storage.yml`, `config/queue.yml` — infrastructure config
- Framework-specific config (Rails initializers, Django settings, etc.)

**For each dependency, determine:**
1. Does it need a system package? (e.g., `pg` gem → `libpq-dev`, `mini_magick` → `imagemagick`)
2. Does it need an external service? (e.g., `redis` gem → Redis container)
3. Does it need a specific version? (e.g., PostgreSQL 14 vs 16)
4. Does it need a background worker? (e.g., `sidekiq` → worker process)

### Common dependency → system package mappings

Use this as a reference, but ALWAYS verify by reading the actual dependency docs:

**Ruby gems:**
| Gem | System packages |
|-----|----------------|
| `pg` | `libpq-dev` |
| `mysql2` | `default-libmysqlclient-dev` |
| `nokogiri` | `libxml2-dev libxslt-dev` |
| `mini_magick` / `image_processing` | `imagemagick` or `libvips` |
| `wicked_pdf` / `pdfkit` | `wkhtmltopdf` |
| `grpc` | `protobuf-compiler` |
| `sassc` | `libsass-dev` |
| `ffi` | `libffi-dev` |

**Python packages:**
| Package | System packages |
|---------|----------------|
| `psycopg2` | `libpq-dev` |
| `mysqlclient` | `default-libmysqlclient-dev` |
| `Pillow` | `libjpeg-dev zlib1g-dev` |
| `lxml` | `libxml2-dev libxslt-dev` |
| `cryptography` | `libssl-dev libffi-dev` |
| `weasyprint` | `libpango-1.0-0 libgdk-pixbuf2.0-0` |

**Node packages:**
| Package | System packages |
|---------|----------------|
| `sharp` | `libvips-dev` |
| `canvas` | `libcairo2-dev libjpeg-dev libpango1.0-dev` |
| `bcrypt` | `python3 make g++` |
| `puppeteer` | `chromium` + many libs |

**This list is NOT exhaustive.** The AI should:
- Read the actual dependency lock files
- Check for native extensions or C bindings
- When unsure, search the web for "[package name] dockerfile system dependencies"
- Ask the user if something is ambiguous

### Step 2: Service detection

From the dependency analysis, determine which external services are needed:

| Signal | Service | Default |
|--------|---------|---------|
| PostgreSQL adapter in config | PostgreSQL container | `postgres:16-alpine` |
| MySQL adapter in config | MySQL container | `mysql:8.0` |
| MongoDB driver in deps | MongoDB container | `mongo:7` |
| Redis in deps or config | Redis container | `redis:7-alpine` |
| Elasticsearch/OpenSearch in deps | Search container | `elasticsearch:8.x` |
| RabbitMQ/AMQP in deps | RabbitMQ container | `rabbitmq:3-management` |
| Memcached in deps | Memcached container | `memcached:1.6-alpine` |
| MinIO/S3 with localstack reference | LocalStack or MinIO | `minio/minio` |
| Sidekiq/Celery/Shoryuken/Bull | Worker process | Same image as app |
| ActionCable/channels with Redis | Redis (already above) | — |
| Mailhog/Mailcatcher reference | Mail catcher | `mailhog/mailhog` |

**Also check for:**
- Multiple databases (read + write replicas)
- Custom services mentioned in README or docker-compose (if one exists)
- `.env.example` for service URLs the project expects

### Step 3: Detect versions

| Source | What it tells you |
|--------|-------------------|
| `.ruby-version` | Ruby version for base image |
| `.nvmrc` / `.node-version` / `package.json` engines | Node version |
| `.python-version` / `pyproject.toml` requires-python | Python version |
| `go.mod` go directive | Go version |
| `rust-toolchain.toml` | Rust version |
| `config/database.yml` / docker-compose (if exists) | Database version |

### Step 4: Ask the user

Before generating, present findings and ask about anything unclear:

```
## Dev Environment Analysis

**App**: Rails 7.2 (Ruby 3.3.0)
**Services detected**: PostgreSQL 16, Redis 7, Sidekiq worker
**System packages needed**: libpq-dev, imagemagick, libvips, curl, git

**Questions:**
1. I see `wkhtmltopdf` is used for PDFs — should I include it in the Dockerfile?
   (It's large, ~300MB. Some teams mount it as a volume instead.)
2. The .env.example references `AWS_ACCESS_KEY_ID` — do you want LocalStack
   for local S3 emulation, or do you use real AWS in dev?
3. I don't see a seed file — does `bin/rails db:seed` work for this project?

Please answer and I'll generate the Docker files.
```

### Step 5: Generate Docker files

Generate these files with the **exact** configuration this project needs:

1. **Dockerfile** — with the right base image, system packages, build steps
2. **docker-compose.yml** — with detected services, health checks, volumes
3. **.env.example** — with all required environment variables
4. **.dockerignore** — excluding what shouldn't be in the image

**Rules for generation:**
- Health checks on every service (use `condition: service_healthy` in depends_on)
- Pin major versions (e.g., `postgres:16-alpine`, not `postgres:latest`)
- Dev-optimized: bind mounts, hot reload, debugger ports
- Include stdin_open + tty for debugger attachment
- Volume for dependency directory to prevent bind mount overwrite
- Never include secrets in generated files — use .env.example with placeholders

### Step 6: Update this skill with concrete commands

After generating, **rewrite the "Concrete Commands" section below** with the
actual commands for this project. Replace the placeholder section with real values.

---

## Phase 2: Concrete Commands

<!-- ================================================================== -->
<!-- THIS SECTION IS UPDATED BY THE AI AFTER RUNNING `init`.            -->
<!-- It starts as a placeholder and gets replaced with real commands.    -->
<!-- If you see this placeholder text, run: dev-environment init        -->
<!-- ================================================================== -->

### Start
```bash
# Placeholder — run "dev-environment init" to generate real commands
echo "Run dev-environment init first"
```

### Stop
```bash
docker compose down
```

### Reset
```bash
# WARNING: destroys all local data
docker compose down -v
docker compose down --rmi local
docker compose up -d --build
# [setup commands will be filled in by init]
```

### Status
```bash
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### Access
| Service | URL |
|---------|-----|
| App | http://localhost:[port] |
<!-- Filled in by init -->

### Useful Commands
```bash
# Logs
docker compose logs -f app

# Shell
docker compose exec app [shell]

# Tests
docker compose exec app [test command]
```

---

## Doctor (troubleshooting)

Run these checks when something isn't working:

1. **Docker running?** — `docker info > /dev/null 2>&1`
2. **Port conflicts?** — `lsof -i :[port]`
3. **Container health?** — `docker compose ps` then `docker compose logs --tail 50 [service]`
4. **Disk space?** — `docker system df`
5. **Stale deps?** — Remove local dep directory, `docker compose build --no-cache`
6. **DB connection?** — Check container health, verify .env matches compose config
7. **Permission issues?** — Try `user: "${UID}:${GID}"` in compose

---

## Rules

- **init asks before generating** — always present findings and get confirmation
- **Never overwrite without asking** — if Docker files exist, show diff and ask
- **Read the actual code** — don't use templates, read THIS project's files
- **Ask about ambiguities** — better to ask than to guess wrong
- **Update this skill after init** — replace the "Concrete Commands" section
- **Document in KB** — after init, create `docs/kb/architecture/dev-environment.md`
