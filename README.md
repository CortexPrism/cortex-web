# CortexPrism

**Open-source agentic harness — CLI, API, web UI, and marketplace.**

CortexPrism is a runtime for building, deploying, and managing AI agents. It provides a unified interface to 24 LLM providers, a 5-tier memory system with hybrid retrieval, sandboxed code execution, defense-in-depth security, and a plugin marketplace — all running locally on your machine.

- **Agent Loop** — Multi-turn reasoning with tool orchestration, memory injection, and reflection
- **Multi-Provider** — Anthropic, OpenAI, Google, Groq, Mistral, DeepSeek, Ollama, and more
- **Memory** — 5 tiers: episodic, semantic, reflection, graph, skills with FTS5 + vector hybrid retrieval
- **Security** — Parallax 3-stage validation gate, encrypted vault, audit logging
- **Plugins** — Extend via ESM modules, MCP servers, or WebAssembly
- **Marketplace** — Discover and publish plugins and agent configs
- **Web UI** — Dashboard, chat interface, memory browser, audit lens
- **REST API** — Full HTTP API with OpenAPI 3.1 specification and Swagger UI

---

## Quick Start

```bash
git clone https://github.com/CortexPrism/cortex.git
cd cortex
deno run --allow-all src/main.ts setup
cortex chat
```

Visit [cortexprism.io](https://cortexprism.io) to explore the marketplace and full documentation.

---

## Features

### Interactive Chat
Chat with 24 LLM providers through a unified interface. Switch providers mid-session, configure fallback chains, stream responses.

```
cortex chat --model claude-sonnet-4-20250514
```

### Tool Use & Approval Gates
Agents use tools (code execution, file I/O, web search) through configurable approval gates. Audit every call.

```
cortex chat --tools all
```

### 5-Tier Memory System
Episodic → Semantic → Reflection → Graph → Skills. Hybrid FTS5 keyword search + cosine vector similarity with exponential time decay.

```
cortex memory search --query "deployment config" --tier semantic
```

### Parallax Security
3-stage validation: tool name → shell command → domain rules. AES-256-GCM encrypted vault. Full audit trail via Cortex Lens.

```
cortex policy add --allow code.execute.python
```

### Sandboxed Code Execution
Run Python, JavaScript, Wasm, and shell commands in isolated Docker sandboxes (subprocess fallback). Resource limits enforced.

```
cortex run --sandbox python --script analyze.py
```

### Model Router (RouteLLM)
Automatic model selection by task complexity with cost optimization and graceful failover across providers.

```
cortex chat --router cost-optimized
```

### Plugin System
Three plugin architectures: ESM modules (JS/TS), MCP servers (stdin/stdio or HTTP/SSE), WebAssembly (Rust, Go, C). Plugin marketplace for discovery.

```
cortex plugin install marketplace:cortexprism.io/plugins/python-executor
```

### Daemon Supervisor & Jobs
Persistent background daemon with validator, executor, and scheduler processes. CRON job scheduling with auto-restart.

```
cortex daemon start && cortex jobs add --schedule "0 9 * * 1" --task weekly-report
```

### Web UI & REST API
Dark-theme web dashboard with chat, Lens, Memory, and Jobs tabs. REST API + WebSocket for real-time streaming.

```
cortex serve --port 8080
```

### Agent Manager
Multiple agent profiles with custom souls, system prompts, tool assignments, and provider configurations. Agent-to-agent collaboration.

```
cortex agent create --name code-reviewer --model claude-sonnet-4-20250514
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CortexPrism                             │
│                                                                 │
│   CLI (cortex chat / run / serve / ...)                         │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────────────────────────────────────┐              │
│   │              agent/loop.ts                  │              │
│   │  userMessage → [memory inject] → LLM call   │              │
│   │  → [tool parse] → [validator] → [execute]   │              │
│   │  → [re-prompt loop] → response              │              │
│   │  → [episodic write] → [reflection]          │              │
│   └─────────────────────────────────────────────┘              │
│          │                                                      │
│   ┌──────┼──────────────────────────────────────┐              │
│   │      │         Subsystems                   │              │
│   │  memory/   tools/   sandbox/   security/    │              │
│   │  llm/      server/  scheduler/              │              │
│   └──────────────────────────────────────────────┘             │
│                                                                 │
│   SQLite databases (WAL mode)                                   │
│   cortex.db · memory.db · lens.db · vault.db · sess_*.db       │
└─────────────────────────────────────────────────────────────────┘
```

| Component | Description |
|-----------|-------------|
| **Agent Loop** | Core reasoning + tool loop — LLM calls, tool execution, memory, reflection |
| **Memory System** | 5-tier memory with hybrid FTS5 + vector embedding retrieval |
| **LLM Layer** | 24 providers with unified interface and CascadeRouter |
| **Tool System** | Extensible registry for file I/O, shell, web, code execution |
| **Security (Parallax)** | 3-stage policy gate, encrypted vault, audit logging |
| **Sandbox** | Docker containers with resource limits and auto-fix loop |
| **Daemon Supervisor** | Background process manager with auto-restart |
| **HTTP Server** | REST API + WebSocket + web UI dashboard |
| **Scheduler** | SQLite-persisted CRON job scheduler with retry |

---

## Website

This repository hosts [cortexprism.io](https://cortexprism.io) — the official CortexPrism website. It includes:

### Documentation

| Section | Path | Pages | Description |
|---------|------|-------|-------------|
| Getting Started | [/getting-started](/getting-started) | 4 | Quickstart, installation, first run, configuration |
| CLI Reference | [/docs/cli](/docs/cli) | 12 | Every `cortex` command documented |
| Architecture | [/docs/architecture](/docs/architecture) | 8 | Agent loop, memory, security, router, daemon, plugins, databases |
| Developer Guide | [/docs/developer-guide](/docs/developer-guide) | 10 | Plugin types, ESM/MCP/WASM dev, API, agents, publishing, standards |
| Knowledge Base | [/docs/knowledge-base](/docs/knowledge-base) | 9 | FAQ, troubleshooting, best practices, provider guide, security, performance |
| Design Docs | [/docs/design-docs](/docs/design-docs) | 1 | Links to design specifications in the main repository |

### Marketplace

Discover, publish, and manage plugins and agent configurations.

| Path | Description |
|------|-------------|
| [/marketplace](/marketplace) | Browse approved plugins and agents |
| [/marketplace/plugins](/marketplace/plugins) | Plugin listing with search, category filters, pagination |
| [/marketplace/plugins/:id](/marketplace/plugins/[id]) | Plugin detail with screenshots, reviews, install instructions |
| [/marketplace/agents](/marketplace/agents) | Agent configuration listing |
| [/marketplace/agents/:id](/marketplace/agents/[id]) | Agent detail with reviews and download |
| [/marketplace/publish/plugin](/marketplace/publish/plugin) | Submit a plugin to the marketplace |
| [/marketplace/publish/agent](/marketplace/publish/agent) | Submit an agent configuration |

### Other Pages

| Path | Description |
|------|-------------|
| [/](/page.tsx) | Landing page with GitHub stats, marketplace counts, features |
| [/features](/features) | Detailed feature breakdown with CLI examples |
| [/about](/about) | About CortexPrism |
| [/security](/security) | Security overview and disclosure |
| [/use-cases](/use-cases) | Use case examples |
| [/install](/install) | Installation instructions |
| [/login](/login) | User login |
| [/register](/register) | User registration |
| [/dashboard](/dashboard) | User dashboard (submissions, profile) |
| [/admin](/admin) | Admin panel (approve/reject submissions) |
| [/changelog](/changelog) | Release history |
| [/contribute](/contribute) | Contributing guide |
| [/docs](/docs) | Documentation hub |
| [/getting-started](/getting-started) | Getting started guide |
| [/openapi](/openapi) | Swagger UI for the REST API |
| [/profile/:username](/profile/[username]) | Public user profile |

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| UI Components | Radix UI (Dialog, Dropdown, Select, Tabs), Lucide icons |
| Database | SQLite via Prisma 5 |
| Auth | JWT + bcryptjs |
| Content | MDX with react-markdown + remark-gfm |
| Search | Fuse.js (client-side) |
| Charts | Recharts |
| API Docs | swagger-ui-react + OpenAPI 3.1 |
| Data Fetching | SWR |
| Validation | Zod |
| Deployment | Docker / systemd + nginx |

---

## API

The marketplace exposes a REST API consumed by the web UI and external Cortex instances. Full documentation is available via Swagger UI at [/openapi](/openapi) or the raw spec at `/api/docs/openapi.json`.

### Marketplace (public)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/marketplace/plugins` | List approved plugins (search, filter, paginate) |
| `GET` | `/api/marketplace/plugins/:id` | Plugin detail |
| `GET` | `/api/marketplace/plugins/:id/download` | Download manifest (increments counter) |
| `POST` | `/api/marketplace/plugins` | Submit a plugin (requires auth) |
| `GET` | `/api/marketplace/agents` | List approved agent configs |
| `GET` | `/api/marketplace/agents/:id` | Agent detail |
| `GET` | `/api/marketplace/agents/:id/download` | Download agent config |
| `POST` | `/api/marketplace/agents` | Submit an agent (requires auth) |
| `GET` | `/api/marketplace/categories` | List categories |
| `GET` | `/api/marketplace/stats` | Marketplace statistics |
| `GET` | `/api/docs/openapi.json` | OpenAPI 3.1 spec |

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create account (email, username, password) |
| `POST` | `/api/auth/login` | Login, returns JWT token |
| `GET` | `/api/auth/me` | Get current user (requires Bearer token) |

### User (requires auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/user/submissions` | User's plugins and agents with status |

### Admin (requires admin role)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/submissions/plugins?status=pending` | List pending plugins |
| `PUT` | `/api/admin/submissions/plugins` | Approve or reject a plugin |
| `GET` | `/api/admin/submissions/agents?status=pending` | List pending agents |
| `PUT` | `/api/admin/submissions/agents` | Approve or reject an agent |

---

## Project Structure

```
content/           # MDX documentation files (42 pages across 6 sections)
prisma/            # Schema + seed data + SQLite database
public/            # Static assets (images, favicon)
src/
  app/
    api/           # REST API routes (auth, marketplace, admin, user)
    admin/         # Admin panel (submission review)
    changelog/     # Release history
    contribute/    # Contributing guide
    dashboard/     # User dashboard
    docs/          # Documentation pages (MDX-rendered)
    features/      # Features page
    getting-started/ # Getting started guides (MDX-rendered)
    login/         # Login page
    marketplace/   # Marketplace (plugins, agents, publish forms)
    openapi/       # Swagger UI
    register/      # Register page
  components/      # React components (29 components)
    layout/        # Navbar, Footer, Sidebar
    landing/       # Hero, FeatureGrid, StatsBar, CTA
    docs/          # MdxContent, TableOfContents, DocSearch, CodeBlock
    marketplace/   # Cards, details, forms, search, reviews
    shared/        # Badge, Button, Card, Pagination, StarRating
  lib/             # Utilities (prisma, auth, openapi, github, markdown)
  middleware.ts    # CORS middleware
```

---

## Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

### Start Dev Server

```bash
npm run dev
```

The dev server runs on `http://localhost:3001`.

### Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to SQLite
npm run db:seed        # Seed with default admin user and categories
npm run db:studio      # Open Prisma Studio
```

### Lint

```bash
npm run lint
```

---

## Production Build

### Next.js Standalone

```bash
npm run build
```

The build script produces a standalone `.next` directory with static assets and the SQLite database bundled.

### systemd Service

```bash
systemctl restart cortexprism-web.service
```

### Discord Bot

The Discord bot is a standalone service in `discord-bot/`:

```bash
cd discord-bot
npm install          # also runs db:generate (generates Prisma client and copies it locally)

# Register slash commands (run once)
npx tsx src/deploy-commands.ts

# Start bot
npx tsx src/index.ts
```

### Docker

```bash
docker compose up --build -d
```

The `Dockerfile` uses multi-stage build with Next.js standalone output. The `docker-compose.yml` includes nginx reverse proxy on port 443.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./prisma/marketplace.db` | SQLite database path |
| `JWT_SECRET` | (auto-generated) | Secret for JWT token signing |
| `NEXT_PUBLIC_SITE_URL` | `https://cortexprism.io` | Canonical site URL |
| `NEXT_PUBLIC_GITHUB_REPO` | `CortexPrism/cortex` | GitHub repo for stats |
| `NEXT_PUBLIC_CORTEX_VERSION` | (auto-detected) | Override displayed CortexPrism version |
| `DISCORD_CLIENT_ID` | — | Discord OAuth app client ID |
| `DISCORD_CLIENT_SECRET` | — | Discord OAuth app client secret |
| `NEXT_PUBLIC_DISCORD_CLIENT_ID` | — | Discord OAuth app client ID (public) |
| `DISCORD_BOT_TOKEN` | — | Discord bot token for slash commands |
| `DISCORD_GUILD_ID` | — | Guild ID for guild-specific command registration |
| `DISCORD_SUBMISSION_WEBHOOK_URL` | — | Webhook URL for marketplace submission notifications |
| `DISCORD_ADMIN_IDS` | — | Comma-separated Discord user IDs with bot admin access |

---

## Default Admin

After seeding: `admin@cortexprism.io` / `admin12345`

---

## Marketplace Integration

Cortex instances consume the marketplace API to discover and install plugins. The `MARKETPLACE-INTEGRATION.md` document details:

- `marketplace:` URI scheme for plugin references
- Plugin manifest and agent config data contracts
- Installation and download flows
- CORS policy

---

## Contributing

Contributions of all kinds are welcome — bug reports, feature requests, documentation improvements, and plugin development.

- **Issues**: [github.com/CortexPrism/cortex/issues](https://github.com/CortexPrism/cortex/issues)
- **Pull Requests**: [github.com/CortexPrism/cortex/pulls](https://github.com/CortexPrism/cortex/pulls)
- **Discord**: [Join the community](https://discord.gg/y7DkaEbPQC)
- **Plugin Development**: See the [Developer Guide](/docs/developer-guide) and [Submission Standards](/docs/developer-guide/submission-standards)

---

## License

MIT
