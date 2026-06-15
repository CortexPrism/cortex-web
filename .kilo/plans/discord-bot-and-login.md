# Discord Bot & OAuth Login Integration

## Overview

Two major additions to cortex-web:
1. **Discord OAuth Login** — "Sign in with Discord" for authentication + account linking
2. **Discord Bot Service** — Standalone Node.js service with slash commands, notifications, and moderation

**Note**: The website runs directly via `npm run dev` / `npm run build && npm start`, not in Docker. The Discord bot also runs as a standalone Node.js process (Docker optional, documented separately).

---

## 1. Prisma Schema Changes (`prisma/schema.prisma`)

Add to `User` model:
```prisma
discordId        String?   @unique
discordUsername  String?
```

Then run: `npx prisma db push`

---

## 2. Environment Variables (`.env`)

Add:
```
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_GUILD_ID=your_guild_id
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id
```

---

## 3. Discord OAuth Login (Inside Next.js App)

### 3a. New API Route: `POST /api/auth/discord/callback`
- **File**: `src/app/api/auth/discord/callback/route.ts`
- Accepts `{ code: string }` from Discord OAuth flow
- Exchanges code for access token via `POST https://discord.com/api/oauth2/token`
- Fetches Discord user info via `GET https://discord.com/api/users/@me`
- If `discordId` found in DB → sign in (return JWT + user)
- If not → create new user with generated username from Discord username, sign in
- Returns `{ token, user, isNew: boolean }`

### 3b. New API Route: `POST /api/auth/discord/link`
- **File**: `src/app/api/auth/discord/link/route.ts`
- Requires auth (Bearer token)
- Accepts `{ code: string }` — Discord OAuth code
- Exchanges code, fetches Discord profile, links `discordId` to the current user
- Returns updated user with `discordUsername`

### 3c. Update Login Page (`src/app/login/page.tsx`)
- Add "Sign in with Discord" button below the email/password form
- Button links to Discord OAuth URL:
  `https://discord.com/api/oauth2/authorize?client_id=${NEXT_PUBLIC_DISCORD_CLIENT_ID}&redirect_uri=${SITE_URL}/api/auth/discord/callback&response_type=code&scope=identify`

### 3d. Update Settings Page (`src/app/dashboard/settings/page.tsx`)
- Add "Linked Accounts" section after "Change Password"
- Show Discord username if linked, with "Unlink" button
- Show "Link Discord Account" button if not linked
- Link flow: redirect to Discord OAuth → callback calls `/api/auth/discord/link` → redirect back

### 3e. AuthContext (`src/lib/AuthContext.tsx`)
- Add `discordUsername?: string` to `AuthUser` interface

### 3f. Auth Me API (`src/app/api/auth/me/route.ts`)
- Update GET response to include `discordUsername` in returned user object

---

## 4. Discord Bot Service (`discord-bot/`)

### 4a. Structure
```
discord-bot/
├── package.json
├── tsconfig.json
├── Dockerfile              (optional, for containerized deployment)
└── src/
    ├── index.ts             # Bot entry, event handlers (ready, interactionCreate)
    ├── deploy-commands.ts   # Registers slash commands (run separately)
    └── commands/
        ├── stats.ts         # /stats — marketplace stats
        ├── plugin.ts        # /plugin search <query> /plugin info <name>
        ├── agent.ts         # /agent search <query> /agent info <name>
        └── review.ts        # Admin: /review list, /review approve <id>, /review reject <id> <reason>
```

### 4b. Database Access
- Bot uses `@prisma/client` with the same `prisma/schema.prisma` as the web app
- References the SQLite database file directly (same `DATABASE_URL` env var)
- Read-only for non-admin commands, read-write for review actions

### 4c. Dependencies (`discord-bot/package.json`)
- `discord.js` ^14
- `@prisma/client` ^5
- `zod` ^3 (for input validation)
- Dev: `prisma`, `typescript`, `tsx`

### 4d. Running the Bot
```bash
cd discord-bot
npm install
npx prisma generate --schema=../prisma/schema.prisma

# Register slash commands (run once)
npx tsx src/deploy-commands.ts

# Start bot
npx tsx src/index.ts
```

Or build + run:
```bash
npm run build
node dist/index.js
```

### 4e. Bot Commands Detail

| Command | Description | Auth |
|---------|-------------|------|
| `/stats` | Show total plugins, agents, downloads | None |
| `/plugin search <query>` | Search plugins by name/keyword | None |
| `/plugin info <name\|id>` | Show plugin details | None |
| `/agent search <query>` | Search agents | None |
| `/agent info <name\|id>` | Show agent details | None |
| `/review list` | List pending submissions | Admin only |
| `/review approve <id>` | Approve a submission | Admin only |
| `/review reject <id> <reason>` | Reject a submission | Admin only |

Admin check: compares Discord user ID against a configured admin list env var (`DISCORD_ADMIN_IDS`) or checks the website user role via DB (look up user by discordId).

---

## 5. Submission Notifications (Discord Webhook)

- Add `DISCORD_SUBMISSION_WEBHOOK_URL` env var
- In submission API routes (`src/app/api/marketplace/plugins/route.ts`, `src/app/api/marketplace/agents/route.ts`), after successful POST:
  - POST to the webhook URL with embed message containing: type (plugin/agent), name, author, link

---

## 6. Files to Create

| File | Purpose |
|------|---------|
| `src/app/api/auth/discord/callback/route.ts` | Discord OAuth callback |
| `src/app/api/auth/discord/link/route.ts` | Link Discord to existing account |
| `discord-bot/package.json` | Bot dependencies |
| `discord-bot/tsconfig.json` | Bot TypeScript config |
| `discord-bot/Dockerfile` | Bot container (optional) |
| `discord-bot/src/index.ts` | Bot entry point |
| `discord-bot/src/deploy-commands.ts` | Slash command registration |
| `discord-bot/src/commands/stats.ts` | /stats command |
| `discord-bot/src/commands/plugin.ts` | /plugin command |
| `discord-bot/src/commands/agent.ts` | /agent command |
| `discord-bot/src/commands/review.ts` | /review commands |

---

## 7. Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `discordId`, `discordUsername` to User |
| `.env` | Add Discord env vars |
| `package.json` | Add optional `discord-bot:dev` script reference in docs |
| `src/app/login/page.tsx` | Add "Sign in with Discord" button |
| `src/app/dashboard/settings/page.tsx` | Add Discord linking section |
| `src/app/api/auth/me/route.ts` | Include `discordUsername` in GET response |
| `src/lib/AuthContext.tsx` | Add `discordUsername` to AuthUser |
| Submission API routes | Add webhook notification on publish |

---

## 8. OAuth Flow Details

**Sign in with Discord** (new or returning user):
1. User clicks "Sign in with Discord" → redirected to Discord authorize URL
2. Discord redirects to `/api/auth/discord/callback?code=...`
3. Backend exchanges code for Discord access token, fetches `/users/@me`
4. If `discordId` exists in DB → sign in with existing account
5. If not → create new User (username = discord username, no password set), sign in
6. Return HTML page that stores JWT + user in localStorage (matching existing auth pattern), then redirects to `/dashboard`

**Link Discord to existing account**:
1. Settings → "Link Discord Account" → redirect to Discord OAuth
2. Callback detects it's a link (via query param or differen route), requires Bearer token
3. Validates Discord user isn't already linked to another account
4. Updates current user's discordId, returns success

---

## 9. Implementation Order

1. Prisma schema change + `npx prisma db push`
2. Discord OAuth callback route + login page button
3. Discord account linking (settings page + API)
4. AuthContext + me route updates
5. Discord bot scaffolding (package.json, tsconfig, index.ts)
6. Bot commands (stats, plugin, agent, review)
7. Deploy-commands script
8. Submission webhook notifications
9. Dockerfile for bot (optional)
