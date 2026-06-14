# CortexPrism Website

The official website and marketplace for the [CortexPrism](https://github.com/CortexPrism/cortex) project — an open-source agentic harness system.

## Architecture

```
Browser → nginx :443 → Next.js SSR :3001 → Prisma → SQLite
                          │
                          ├── Marketing / Docs pages (SSG/ISR)
                          ├── Marketplace UI (client-side, SWR)
                          ├── Auth (JWT + bcrypt)
                          ├── Admin Panel (role-gated)
                          └── REST API (/api/marketplace/*)
                              └── External Cortex instances (plugin install)
```

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Database | SQLite via Prisma 5 |
| Auth | JWT + bcryptjs |
| Content | Markdown (react-markdown) |
| Search | Fuse.js (client-side) |
| API Docs | swagger-ui-react + OpenAPI 3.1 |
| Deployment | Docker / systemd + nginx |

## Development

```bash
npm install
npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts
npm run dev
```

The dev server runs on `http://localhost:3001`.

## Production Build

```bash
npm run build        # standalone output + static assets + DB
systemctl restart cortexprism-web.service
```

## API Overview

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

## Project Structure

```
content/           # MDX documentation files
prisma/            # Schema + seed data + SQLite DB
public/            # Static assets (images, favicon)
src/
  app/
    api/           # REST API routes
    admin/         # Admin panel
    changelog/     # Changelog page
    contribute/    # Contribute page
    dashboard/     # User dashboard
    docs/          # Documentation pages
    features/      # Features page
    getting-started/ # Getting started pages
    login/         # Login page
    marketplace/   # Marketplace pages
    openapi/       # Swagger UI
    register/      # Register page
  components/      # React components
  lib/             # Utilities (prisma, auth, openapi, github, markdown)
  middleware.ts    # CORS middleware
```

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./prisma/marketplace.db` | SQLite database path |
| `JWT_SECRET` | (auto-generated) | Secret for JWT token signing |
| `NEXT_PUBLIC_SITE_URL` | `https://cortexprism.io` | Canonical site URL |
| `NEXT_PUBLIC_GITHUB_REPO` | `CortexPrism/cortex` | GitHub repo for stats |

## Default Admin

After seeding: `admin@cortexprism.io` / `admin12345`

## License

MIT
