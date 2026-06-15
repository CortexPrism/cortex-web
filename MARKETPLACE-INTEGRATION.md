# Marketplace API — CortexPrism System Integration

This document describes how the CortexPrism CLI (`cortex`) connects to the marketplace website at `https://cortexprism.io` for discovering, installing, and publishing plugins and agent configurations.

## Table of Contents

1. [Plugin Installation Flow](#1-plugin-installation-flow)
2. [Agent Import Flow](#2-agent-import-flow)
3. [Discovering Plugins & Agents](#3-discovering-plugins--agents)
4. [Publishing to the Marketplace](#4-publishing-to-the-marketplace)
5. [Authentication](#5-authentication)
6. [API Reference](#6-api-reference)
7. [Data Contracts](#7-data-contracts)

---

## 1. Plugin Installation Flow

The CLI already supports the `marketplace:` URI scheme. The full flow is:

```
User runs:  cortex plugin install marketplace:cortexprism.io/plugins/python-executor

CLI parses:  host=cortexprism.io, slug=python-executor
CLI calls:   GET https://cortexprism.io/api/marketplace/plugins/python-executor/download
Marketplace: increments download counter, returns PluginManifest JSON
CLI:         passes manifest to installPlugin() and saves to local SQLite database
```

### Marketplace URI Format

```
marketplace:<host>/plugins/<slug>
```

| Part | Example | Description |
|------|---------|-------------|
| `<host>` | `cortexprism.io` | Marketplace hostname |
| `<slug>` | `python-executor` | Plugin slug from marketplace listing |

### Download Endpoint

**`GET /api/marketplace/plugins/:slug/download`**

The `:slug` parameter accepts either the plugin's slug or its UUID.

Response body (`PluginManifest`):

```json
{
  "id": "cmpxyz...",
  "name": "example-plugin",
  "version": "1.0.0",
  "description": "An example plugin manifest.",
  "kind": "esm",
  "entryPoint": "plugins/example-plugin/mod.ts",
  "capabilities": ["example:action"],
  "author": "CortexPrism",
  "homepage": "https://github.com/CortexPrism/cortex"
}
```

### CLI Handling (existing code)

In `src/cli/plugins-cmd.ts`, the `cortex plugin install` command:

```typescript
if (source.startsWith('marketplace:')) {
  const rest = source.slice('marketplace:'.length);
  const match = rest.match(/^([^/]+)\/plugins\/(.+)$/);
  const host = match[1];
  const slug = match[2];
  const url = `https://${host}/api/marketplace/plugins/${slug}/download`;
  const res = await fetch(url);
  manifest = await res.json();
}
await installPlugin(manifest);
```

The `installPlugin()` function in `src/plugins/registry.ts` expects:

```typescript
{
  id: string;
  name: string;
  version: string;
  description: string;
  kind: "esm" | "mcp" | "wasm";
  entryPoint: string;
  capabilities: string[];
  author?: string;
  homepage?: string;
}
```

---

## 2. Agent Import Flow

There is no `cortex agent import` command yet. When implemented, it should follow the same pattern:

```
User runs:  cortex agent import marketplace:cortexprism.io/agents/code-reviewer

CLI calls:  GET https://cortexprism.io/api/marketplace/agents/code-reviewer/download
Marketplace: increments download counter, returns AgentConfig JSON
CLI:         saves agent configuration to local database
```

### Suggested URI Format

```
marketplace:<host>/agents/<slug>
```

### Download Endpoint

**`GET /api/marketplace/agents/:slug/download`**

Response body:

```json
{
  "id": "cmqabc...",
  "name": "example-agent",
  "version": "1.0.0",
  "description": "An example agent configuration.",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.2,
  "tools": ["codebase_search", "read", "grep"],
  "tags": ["example"],
  "systemPrompt": "You are a helpful assistant.",
  "author": "CortexPrism",
  "createdAt": "2026-06-14T00:00:00.000Z",
  "updatedAt": "2026-06-14T00:00:00.000Z"
}
```

### Suggested Agent import implementation

The CLI would need a new command (or extend `cortex agent import`). The download response maps directly to the `AgentConfig` interface in `src/config/config.ts`:

```typescript
interface AgentConfig {
  id: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  temperature?: number;
  tools?: string[];
  tags?: string[];
  systemPrompt?: string;
  // ...other fields
}
```

---

## 3. Discovering Plugins & Agents

### List Plugins

**`GET /api/marketplace/plugins`**

Query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search across name and description |
| `category` | string | — | Filter by category slug |
| `kind` | string | — | Filter by plugin kind (`esm`, `mcp`, `wasm`) |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 50) |

Response:

```json
{
  "plugins": [
    {
      "id": "cmpxyz...",
      "name": "Example Plugin",
      "slug": "example-plugin",
      "version": "1.0.0",
      "description": "An example plugin.",
      "kind": "esm",
      "author": "CortexPrism",
      "icon": null,
      "downloads": 1423,
      "rating": 4.8,
      "category": "Code Execution",
      "createdAt": "2026-06-14T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### List Agents

**`GET /api/marketplace/agents`**

Query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Search across name and description |
| `category` | string | — | Filter by category slug |
| `provider` | string | — | Filter by LLM provider |
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 50) |

Response:

```json
{
  "agents": [
    {
      "id": "cmqabc...",
      "name": "Example Agent",
      "slug": "example-agent",
      "version": "1.0.0",
      "description": "An example agent.",
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514",
      "author": "CortexPrism",
      "icon": null,
      "downloads": 892,
      "rating": 4.6,
      "tags": ["example"],
      "category": "Developer Tools",
      "createdAt": "2026-06-14T00:00:00.000Z"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### List Categories

**`GET /api/marketplace/categories`**

Response:

```json
[
  { "id": "cmq...", "name": "Code Execution", "slug": "code-execution", "pluginCount": 2, "agentCount": 0 },
  { "id": "cmq...", "name": "Developer Tools", "slug": "developer-tools", "pluginCount": 0, "agentCount": 1 }
]
```

### Get Marketplace Stats

**`GET /api/marketplace/stats`**

Response:

```json
{
  "totalPlugins": 6,
  "totalAgents": 4,
  "totalDownloads": 12890,
  "categories": 8
}
```

---

## 4. Publishing to the Marketplace

Submissions require authentication (JWT token) and are reviewed by admins before going live.

### Authentication

First, register or login to get a token:

```bash
# Register
curl -X POST https://cortexprism.io/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"myuser","password":"securepassword123"}'

# Response:
{ "token": "eyJhbG...", "user": { "id": "...", "email": "...", "role": "user" } }
```

Store the token and include it in subsequent requests as a Bearer token:

```http
Authorization: Bearer eyJhbG...
```

### Submit a Plugin

**`POST /api/marketplace/plugins`** (requires auth)

```json
{
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Does something useful",
  "kind": "esm",
  "entryPoint": "plugins/my-plugin/mod.ts",
  "capabilities": ["my:action"],
  "categoryId": "cmq..."
}
```

The submission starts with `status: "pending"`. It will not appear in public listings until an admin approves it.

### Submit an Agent

**`POST /api/marketplace/agents`** (requires auth)

```json
{
  "name": "My Agent",
  "version": "1.0.0",
  "description": "A specialized agent",
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.3,
  "tools": ["codebase_search", "read"],
  "tags": ["developer", "tools"],
  "systemPrompt": "You are a helpful agent...",
  "categoryId": "cmq..."
}
```

### Import from GitHub Repository

**`POST /api/marketplace/import`** (requires auth)

Automatically imports a plugin or agent from a public GitHub repository. The endpoint fetches the manifest, README, and metadata (stars, forks, topics, license) from the repo.

```json
{
  "repository": "https://github.com/owner/my-plugin",
  "branch": "main",
  "autoApprove": false,
  "manifestPath": "cortex.json",
  "categoryId": "cmq..."
}
```

The endpoint auto-detects the type:
- **Plugin** if manifest contains `kind` (esm/mcp/wasm) or `capabilities`
- **Agent** if manifest contains `provider`, `model`, `systemPrompt`, or `soulContent`

Response (201 Created):
```json
{
  "success": true,
  "type": "plugin",
  "plugin": {
    "id": "cmpxyz...",
    "name": "my-plugin",
    "slug": "my-plugin",
    "version": "1.0.0",
    "kind": "esm",
    "status": "pending"
  }
}
```

Will return `409 Conflict` if a plugin or agent with the same name already exists.

### Check Submission Status

**`GET /api/user/submissions`** (requires auth, returns user's own items)

```json
{
  "plugins": [{ "name": "My Plugin", "status": "pending", ... }],
  "agents": [{ "name": "My Agent", "status": "approved", ... }]
}
```

---

## 5. Authentication

All public endpoints (`GET` for listings, downloads, stats, categories) require **no authentication**.

Write endpoints (`POST`, `PUT`, `DELETE`) for submissions require a **Bearer token**:

```http
Authorization: Bearer <token>
```

### Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Login, returns token |
| `GET` | `/api/auth/me` | Yes | Get current user |

### User Endpoints (requires any token)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/user/submissions` | List own plugins and agents with status |

### Admin Endpoints (requires admin role)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/submissions/plugins?status=pending` | List pending plugin submissions (paginated, searchable) |
| `PUT` | `/api/admin/submissions/plugins` | Approve/reject plugin with review notes |
| `GET` | `/api/admin/submissions/agents?status=pending` | List pending agent submissions (paginated, searchable) |
| `PUT` | `/api/admin/submissions/agents` | Approve/reject agent with review notes |
| `GET` | `/api/admin/users` | List users with role assignment (paginated, searchable) |
| `PUT` | `/api/admin/users` | Update user role, status |
| `GET` | `/api/admin/users/[id]` | Get user details |
| `DELETE` | `/api/admin/users/[id]` | Soft-delete (deactivate) user |
| `GET` | `/api/admin/roles` | List all roles with permissions |
| `POST` | `/api/admin/roles` | Create a new role |
| `PUT` | `/api/admin/roles` | Update role name, description, permissions |
| `DELETE` | `/api/admin/roles` | Delete a custom role |
| `GET` | `/api/admin/permissions` | List all permissions |
| `POST` | `/api/admin/permissions` | Create a new permission |
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/audit-logs` | Activity log with filters |
| `GET` | `/api/admin/github-connections` | List connected repos |
| `POST` | `/api/admin/github-connections` | Connect a repository |
| `PUT` | `/api/admin/github-connections` | Update connection config |
| `DELETE` | `/api/admin/github-connections` | Remove connection |
| `POST` | `/api/admin/github-connections/[id]/sync` | Trigger import sync |
| `GET` | `/api/admin/github-topic-scanner` | List topic scans |
| `POST` | `/api/admin/github-topic-scanner` | Trigger a topic scan |
| `GET` | `/api/admin/github-topic-scanner/[id]` | Get scan results |
| `POST` | `/api/admin/github-topic-scanner/[id]/import` | Import a discovered repo |
| `GET` | `/api/admin/settings` | List runtime settings |
| `PUT` | `/api/admin/settings` | Update a setting value |

Admin approve/reject body:

```json
{ "id": "cmq...", "action": "approved", "notes": "Looks good!" }
```

---

## 6. API Reference

### Complete Endpoint Table

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/marketplace/plugins` | No | List approved plugins |
| `GET` | `/api/marketplace/plugins/:id` | No | Plugin detail |
| `GET` | `/api/marketplace/plugins/:id/download` | No | Download plugin manifest |
| `POST` | `/api/marketplace/plugins` | Yes | Submit a plugin |
| `PUT` | `/api/marketplace/plugins/:id` | Yes | Update a plugin |
| `DELETE` | `/api/marketplace/plugins/:id` | Yes | Delete a plugin |
| `GET` | `/api/marketplace/agents` | No | List approved agents |
| `GET` | `/api/marketplace/agents/:id` | No | Agent detail |
| `GET` | `/api/marketplace/agents/:id/download` | No | Download agent config |
| `POST` | `/api/marketplace/agents` | Yes | Submit an agent |
| `PUT` | `/api/marketplace/agents/:id` | Yes | Update an agent |
| `POST` | `/api/marketplace/import` | Yes | Import plugin/agent from GitHub repo |
| `DELETE` | `/api/marketplace/agents/:id` | Yes | Delete an agent |
| `GET` | `/api/marketplace/categories` | No | List categories |
| `GET` | `/api/marketplace/stats` | No | Marketplace statistics |
| `POST` | `/api/auth/register` | No | Create account |
| `POST` | `/api/auth/login` | No | Login |
| `GET` | `/api/auth/me` | Yes | Current user (enriched profile) |
| `PUT` | `/api/auth/me` | Yes | Update profile, account, preferences |
| `DELETE` | `/api/auth/me` | Yes | Delete account (with confirmation) |
| `GET` | `/api/user/submissions` | Yes | User's submissions |
| `GET` | `/api/admin/submissions/plugins` | Admin | List plugins with status filter |
| `PUT` | `/api/admin/submissions/plugins` | Admin | Approve/reject plugin |
| `GET` | `/api/admin/submissions/agents` | Admin | List agents with status filter |
| `PUT` | `/api/admin/submissions/agents` | Admin | Approve/reject agent |
| `GET` | `/api/admin/users` | Admin | List users |
| `PUT` | `/api/admin/users` | Admin | Update user role/status |
| `GET` | `/api/admin/users/[id]` | Admin | User details |
| `GET/POST/PUT/DELETE` | `/api/admin/roles` | Admin | Manage roles |
| `GET/POST` | `/api/admin/permissions` | Admin | Manage permissions |
| `GET` | `/api/admin/stats` | Admin | Dashboard stats |
| `GET` | `/api/admin/audit-logs` | Admin | Activity log |
| `GET/POST/PUT/DELETE` | `/api/admin/github-connections` | Admin | Manage repo connections |
| `POST` | `/api/admin/github-connections/[id]/sync` | Admin | Trigger repo sync |
| `GET/POST` | `/api/admin/github-topic-scanner` | Admin | Manage topic scans |
| `GET` | `/api/admin/github-topic-scanner/[id]` | Admin | Scan results |
| `POST` | `/api/admin/github-topic-scanner/[id]/import` | Admin | Import discovered repo |
| `GET/PUT` | `/api/admin/settings` | Admin | Runtime settings |
| `GET` | `/api/docs/openapi.json` | No | OpenAPI 3.1 spec |

### Base URL

Production: `https://cortexprism.io`
Development: `http://localhost:3001`

---

## 7. Data Contracts

### PluginManifest (download response → installPlugin input)

```typescript
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  kind: "esm" | "mcp" | "wasm";
  entryPoint: string;
  capabilities: string[];
  author?: string;
  homepage?: string;
}
```

### AgentConfig (download response → agent import input)

```typescript
interface AgentConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  provider?: string;
  model?: string;
  temperature?: number;
  tools?: string[];
  tags?: string[];
  systemPrompt?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}
```

### PluginInput (POST body for submission)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Plugin name |
| `version` | Yes | string | Semver version |
| `description` | Yes | string | Short description |
| `kind` | Yes | `esm` | `mcp` | `wasm` | Plugin type |
| `entryPoint` | Yes | string | Main module path |
| `capabilities` | No | string[] | Tool capability identifiers |
| `author` | No | string | Author name |
| `authorUrl` | No | string | Author website |
| `homepage` | No | string | Project homepage |
| `repository` | No | string | Source repository URL |
| `license` | No | string | SPDX license identifier |
| `icon` | No | string | Icon URL |
| `readme` | No | string | Full README markdown |
| `categoryId` | No | string | Category UUID |

### AgentInput (POST body for submission)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Agent name |
| `version` | Yes | string | Semver version |
| `description` | Yes | string | Short description |
| `provider` | No | string | LLM provider (e.g. `anthropic`) |
| `model` | No | string | Model identifier |
| `temperature` | No | number | Sampling temperature (0–2) |
| `tools` | No | string[] | Tool names to enable |
| `tags` | No | string[] | Categorization tags |
| `systemPrompt` | No | string | System prompt text |
| `soulContent` | No | string | Agent soul/identity |
| `author` | No | string | Author name |
| `authorUrl` | No | string | Author website |
| `repository` | No | string | Source repository |
| `icon` | No | string | Icon URL |
| `readme` | No | string | Full README markdown |
| `categoryId` | No | string | Category UUID |

### GitHubImport (POST body for `/api/marketplace/import`)

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `repository` | Yes | string | Public GitHub repo URL (`https://github.com/owner/repo`) |
| `branch` | No | string | Git branch (default: `main`, auto-detects from repo) |
| `autoApprove` | No | boolean | Skip review queue (admin only, default: `false`) |
| `manifestPath` | No | string | Custom manifest path (default: auto-detects `cortex.json`, `manifest.json`) |
| `categoryId` | No | string | Category UUID |

The import endpoint:
1. Fetches repo metadata (stars, forks, topics, license, default branch)
2. Reads the manifest from the repository
3. Auto-detects plugin vs agent from manifest content
4. Fetches README.md and icon (icon.png/icon.svg) from the repo
5. Creates a marketplace submission with all metadata

---

## Example: Full CLI Integration

### Plugin Installation (already implemented)

```bash
# The CLI determines the download URL from the marketplace: prefix
cortex plugin install marketplace:cortexprism.io/plugins/python-executor
# → fetches https://cortexprism.io/api/marketplace/plugins/python-executor/download
# → installs plugin locally
```

### Agent Import (proposed — not yet implemented in CLI)

```bash
# When implemented, the CLI would parse the marketplace: prefix similarly
cortex agent import marketplace:cortexprism.io/agents/code-reviewer
# → fetches https://cortexprism.io/api/marketplace/agents/code-reviewer/download
# → saves agent configuration locally
```

### Scripted GitHub Import (curl example)

```bash
# Import a plugin from a GitHub repository
curl -X POST https://cortexprism.io/api/marketplace/import \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"repository": "https://github.com/owner/my-cortex-plugin"}'

# Import with auto-approve (admin only)
curl -X POST https://cortexprism.io/api/marketplace/import \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "repository": "https://github.com/owner/my-plugin",
    "autoApprove": true
  }'
```

### Scripted Discovery (curl/jq example)

```bash
# Search for MCP plugins
curl -s "https://cortexprism.io/api/marketplace/plugins?kind=mcp&search=web" | jq '.plugins[] | {name, slug, version}'

# Get download URL for top agent
SLUG=$(curl -s "https://cortexprism.io/api/marketplace/agents?limit=1" | jq -r '.agents[0].slug')
echo "cortex agent import marketplace:cortexprism.io/agents/$SLUG"
```

---

## CORS Policy

The marketplace API includes a CORS middleware that allows cross-origin requests from any origin:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

This enables external Cortex instances (or any client) to consume the API directly.
