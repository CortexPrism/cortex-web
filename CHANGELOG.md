# Changelog

All notable changes to the CortexPrism website will be documented in this file.

## [0.9.0] — 2026-06-18

### Added
- **Discord bot major expansion** — 28 new slash subcommands across 9 command groups
  - **Role management**: `/role create|delete|edit|assign|list|info|mass` — full role CRUD with color, hoist, mentionable options, toggle assignment, and mass assign/remove
  - **Channel management**: `/channel create|delete|edit|info|list` — create channels of any type (text, voice, announcement, forum, stage), edit name/topic/NSFW/slowmode/category
  - **Reaction roles**: `/reactionrole create|delete|list|panel` — emoji-based self-assignable roles with auto-generated embed panels
  - **Ticketing system**: `/ticket create|close|claim|add|remove` — per-user text channels with priority levels (low/normal/high/urgent), staff claiming, user add/remove, and button interactions
  - **Polls**: `/poll create|end` — multi-option polls with duration, single/multi-choice enforcement, and results display
  - **Announcements**: `/announce`, `/say`, `/embed` — send rich embed announcements with custom colors, images, thumbnails, author fields, @everyone/@here pings
  - **Channel lockdown**: `/lockdown [channel] [reason]`, `/unlock [channel]` — lock/unlock channels via permission overwrites
  - **Nickname management**: `/nickname <user> <name> [reason]` — change or reset user nicknames
- **Auto-moderation engine** (`lib/auto-mod.ts`) with 6 rule types
  - Keyword filter, invite link filter, spam detection (message velocity), link filter, mention limit, caps filter
  - Configurable actions per rule: warn, mute (with duration), kick, ban, or silent delete
  - Auto-mod action logging with embed notifications to configured log channel
  - Per-channel auto-mod exemption via `ChannelConfig`
  - 30-second TTL cache for auto-mod config to minimize DB load
- **Welcome/Leave messages** (`lib/events.ts`)
  - Customizable welcome messages with variable substitution (`{user}`, `{user_tag}`, `{server}`, `{member_count}`)
  - Leave messages with member join date and role display
  - Per-guild channel configuration for welcome and leave embeds
- **Reaction role live handling** — `MessageReactionAdd`/`MessageReactionRemove` event handlers in the bot process (replaces external client creation)
- **Single-choice poll enforcement** — `MessageReactionAdd` handler removes extra reactions when `allowMultiple: false`
- **Database schema expansion** — 6 new models
  - `ChannelConfig` — per-channel slowmode, lock state, auto-mod exemption
  - `AutoModRule` — filter type, action, optional mute duration, JSON config
  - `ReactionRole` — channel, message, role, emoji binding with toggle/single/verify types
  - `Poll` — title, options JSON, multi-choice flag, active state, expiry
  - `Ticket` + `TicketMessage` — status lifecycle (open/claimed/closed), priority, claimed by, close reason, per-ticket message log
  - `GuildConfig` expanded with 12 new fields: `announcementChannelId`, `ticketCategoryId`, `ticketLogChannelId`, `ticketStaffRoleId`, `levelingEnabled`, `levelingMessage`, `levelingChannelId`, `starboardEnabled`, `starboardChannelId`, `starboardThreshold`
- **New API endpoints** (6 route files)
  - `GET/PUT /api/admin/discord/guilds` — guild configuration CRUD
  - `GET/POST/PUT/DELETE /api/admin/discord/automod` — auto-mod rules CRUD
  - `GET/DELETE /api/admin/discord/reactionroles` — reaction role management
  - `GET/PUT /api/admin/discord/tickets` — ticket list with status/pagination filters
  - `GET/PUT /api/admin/discord/channels` — channel config management
  - `GET/DELETE /api/admin/discord/polls` — poll management with vote tracking
- **Tabbed Discord admin dashboard** — 7 tabs replacing single-page layout
  - **Overview**: bot status, start/stop/restart/register commands buttons, usage bar chart
  - **Bot Config**: OAuth, bot token, guild ID, webhook URL, admin IDs with DB/env status badges
  - **Guild Settings**: 11-field web form for guild configuration (log channel, mod/admin roles, ticket settings, max warns, slowmode)
  - **Auto-Mod**: toggle rules on/off, delete rules, with filter type and action display
  - **Welcome/Leave**: toggle enable, edit message templates with variable reference
  - **Commands**: full categorized command reference table (42+ slash commands)
  - **Moderation Logs**: inline filtering by action type and user ID, paginated table
- **New admin sub-pages**
  - `/admin/discord/tickets` — ticket list with status filtering, priority icons, pagination
  - `/admin/discord/polls` — poll list with vote bar charts, end-poll action, active/ended badges
- **Grouped sidebar navigation** — Discord Bot section expands to sub-items: Dashboard, Moderation Logs, Tickets, Polls
- **Shared command definitions module** (`discord-bot/src/commands/command-definitions.ts`) — single source of truth for all slash command metadata, imported by both `index.ts` and `deploy-commands.ts`
- Bot intents upgraded to include `GuildMembers`, `GuildMessages`, `MessageContent`, `GuildMessageReactions`
- **Unified duration parsing** — `slowmode.ts` now uses shared `parseDuration` from `lib/moderation.ts` (adds day-unit support to slowmode)

### Changed
- Discord admin page redesigned from single config page to tabbed dashboard with 7 tabs
- Admin sidebar navigation restructured with expandable Discord group and sub-items
- `ModerationAction` model expanded with `lockdown`, `unlock`, `nickname`, `role_assign`, `role_remove`, `role_create`, `role_delete`, `delete` action types
- Guild Settings and Auto-Mod tabs now fall back to env `DISCORD_GUILD_ID` when DB value is unset
- Discord bot version `1.0.0` → `1.1.0`
- Web app version `0.3.0` → `0.9.0`

### Fixed
- **CRITICAL**: Ticket button handlers (`ticket_close_*`, `ticket_claim_*`) now require moderator authorization — previously any channel viewer could close/claim tickets
- **CRITICAL**: Button ticket close now sets `closedBy` field for audit trail (previously left null)
- Auto-mod "delete" action no longer incorrectly logs as "warn" (prevented spurious warn count inflation that could trigger auto-ban)
- Poll results now persist computed vote counts to database on poll end — web admin previously showed 0 votes for all ended polls
- `allowMultiple: false` poll flag now enforced — extra user reactions are removed on single-choice polls
- Mass role assignment (`/role mass`) now reports member count and warns about rate limits
- `handleReactionRoleToggle` dead code removed from `lib/events.ts` (76 lines of unused, broken double-client-creation code)
- `ChannelType` unused import removed from `lockdown.ts`

## [0.8.0] — 2026-06-18

### Added
- New CLI documentation pages: `log.mdx`, `migrate.mdx`
- `cortex log` entry added to CLI index (show, tail, clear, path, set-level, status)
- Vault `--type` option (`api_key`, `token`, `password`) documented
- ElevenLabs TTS provider noted in voice docs
- Memory `health` and `heuristics` subcommands documented
- MCP server `connect`, `disconnect`, `connections` subcommands and HTTP transport documented
- Plugin capabilities list expanded in architecture docs (23 capability types)

### Changed
- **Version**: all references updated from `0.1.0` → `0.35.3` across landing page, docs, and developer guide
- **Model Quartermaster**: signal count corrected 5→6 throughout (trajectory, episodic, historical, cost, quality, reflection); clarified MQM is for model selection (not tool prediction)
- **Web UI tabs**: expanded from 17 (with wrong names) to 22 (with accurate names from source)
- **API endpoints**: serve docs expanded from 8 to 20 documented endpoints (notes 85+ exist)
- **Soul templates**: 5→8 correctly listed (professional, friendly, developer, creative, analyst, teacher, minimalist, custom)
- **Setup wizard**: steps corrected from 3 wrong steps → 6 actual steps across setup.mdx, first-run.mdx, and index.mdx
- **Docker images**: all 7 sandbox images fixed to match source (`-slim`→`-alpine`, `ubuntu:24.04`→`alpine:3.20`, `node:22-slim` TS→`denoland/deno:alpine`)
- **Database migrations**: list expanded from 9 to 23+ with summary
- **Pipeline hooks**: built-in hooks table completely rewritten (8 wrong hooks → 8 correct with accurate stage assignments)
- **Policy rule kinds**: 3→6 (tool, shell, domain, capability, path, computer)
- **Memory tiers**: removed fabricated T1–T5 numbering; corrected tier names
- **CLI index**: 36→43 commands with new log and migrate entries
- Landing page "Pre-release" badge removed
- Update channel: `pre` → `pre-release` across configuration, architecture, and update CLI docs
- Built-in agent tools list expanded from 8 to 26 accurately named tools
- Runtime install command: `deno task setup` → `deno run --allow-all src/main.ts setup`
- Plugin CLI command: `cortex plugin` → `cortex plugins` (plural) across all developer guide files and marketplace components

### Fixed
- **CRITICAL**: Security policy docs claimed "default-deny" — corrected to "default-allow" matching source code (`security/policy.ts:66`)
- **CRITICAL**: Rule evaluation order corrected — deny-first then allow → priority-based evaluation with default-allow
- Security page rule kind count: 3→6
- `cortex jobs` page completely rewritten: removed non-existent `remove`/`pause`/`resume` subcommands; added actual `cancel`/`run-due`; fixed flags `--schedule`→`--cron`, `--task`→positional args
- `cortex serve` host short flag: `-h`→`-H`; added `serve install`/`serve uninstall` as subcommands
- `cortex models` subcommands: `show`/`set` documented with correct `<provider>` and `<key>`/<`value>` args
- `cortex log` defaults corrected: 50→100 entries; removed non-existent `--json` flag
- `cortex reflect`: removed non-existent `patterns` subcommand and `-s` flag; removed fabricated `enableReflection` config example
- Docker sandbox: removed non-existent `--sandbox-only` flag; replaced with `--no-sandbox`
- Environment variables: removed fabricated `CORTEX_SANDBOX_TIMEOUT`, `CORTEX_SANDBOX_MEMORY`, `CORTEX_SANDBOX_MAX_OUTPUT` (sandbox limits are hardcoded)
- Server auth config: `server.auth.jwtSecret` → `webAuth.sessionSecret` matching actual config schema
- Discord config: removed fabricated config.json schema (token only via flag/env var)
- Removed all `--agent` flag references from git commands (does not exist in source)
- Removed fabricated `cortex plugin call/config/info` commands across developer guide
- Removed fabricated npm/jsr plugin install sources
- Removed fabricated migration flags: `--status`, `--dry-run`, `--to v2`
- Removed fabricated import sources: `openai-agents`, `langchain`
- Removed fabricated `--adapt` flag from plugin install
- Removed fabricated `--plugin` flag, `--tools` flag, and `--no-stream` from chat examples
- TUI page rewritten to match actual split-pane chat interface (was aspirational multi-panel dashboard)
- Features page: fixed `--semantic`→`--type semantic`, policy format, agent tools list
- Use-cases page: removed non-existent `--tools all` flag
- `enableReflection` removed from config examples (not in AgentConfig schema)
- Stale jobs command syntax fixed in features, use-cases, and best-practices pages
- Memory search example flag corrected from `--semantic` to `--type semantic`

### Added
- IndexNow API integration for instant search engine notification (Bing, Yandex, Seznam):
  - Core library (`src/lib/indexnow.ts`) with URL submission, collection, and auto-ping on plugin/agent approval
  - Shared URL collection module (`src/lib/site-urls.ts`) serving both sitemap and IndexNow
  - Admin settings UI for key management and manual "Submit All URLs" trigger
  - `POST /api/indexnow/submit` — admin endpoint for single or bulk URL submission
  - `GET /api/indexnow/key` (rewritten from `/indexnow-key.txt`) — protocol ownership verification
  - `GET/PUT/DELETE /api/admin/indexnow` — admin API for IndexNow key management
  - `INDEXNOW_API_KEY` environment variable support
- 28 new CLI documentation pages covering all 42 registered Cortex commands:
  - New: `update`, `git`, `github`, `hooks`, `triggers`, `channels`, `mcp`, `remote`, `tui`, `projects`, `workflow`, `desktop`, `eval`, `qm`, `node`, `models`, `stop`, `soul`, `discord`, `plugins`, `marketplace`, `import`, `agent`, `service`, `voice`, `install`, `uninstall`, `start`, `restart`
- 10 new architecture documentation pages:
  - `quartermaster`, `git-workspace`, `github-integration`, `channels`, `triggers`, `workflow`, `observability`, `remote-agents`, `update-system`, `mcp-server`, `pipeline`
- 3 new Knowledge Base articles:
  - `git-workspace-guide`, `github-integration-guide`, `model-quartermaster`
- FeatureGrid expanded from 8 to 12 cards on landing page (Git Workspace, Model Quartermaster, Workflow Engine, Cortex Lens Audit)
- Features page expanded from 11 to 15 feature sections with verified command examples
- `router.strategy` field documented in configuration page (`cascade` / `threshold`)
- `update` section documented in configuration page (channel, checkOnStartup, autoUpdate, checkIntervalHours, githubToken, gpgKeyPath)
- Multi-platform install page with macOS, Linux/WSL, and Windows (PowerShell) tabs

### Changed
- CLI Reference index expanded from 19 to 41 commands with documentation links
- Sidebar redesigned: CLI section 12→40 links, Architecture section 8→19 links
- Web UI dashboard tabs updated in serve docs from 4 to 17 tabs matching source

### Fixed
- Memory tier names corrected across all pages — "working"/"procedural" replaced with actual tiers (Ephemeral→Episodic→Semantic→Archival→Reflection)
- 11 command examples in features page fixed to match verified CLI syntax
- Hero terminal demo updated with correct model names, memory flags, and run syntax
- `--tier` flag corrected to `--type` in memory docs; `--limit` default fixed (10→8)
- `--importance` flag documented as numeric (0.0–1.0) instead of string
- Removed all references to non-existent commands (`cortex benchmark`, `cortex lens tail/search/export`, `cortex config migrate`, `cortex plugin reinstall`, `cortex chat --profile`, `/model` slash command)
- `cortex plugin` corrected to `cortex plugins` (plural) in troubleshooting and migration guides
- Outdated flag references removed: `--tools`, `--router`, `--schedule`/`--task`, `--sandbox`/`--script`
- `install.sh` now backs up and restores `config.json` on git pull failure instead of silently destroying user data
- Sidebar navigation URLs aligned with index.mdx command table
- Sidebar `max-h` raised to 2000px to prevent content clipping with expanded sections
- Orphaned `restart.mdx` and `uninstall.mdx` now reachable via sidebar links

## [0.6.0] — 2026-06-16

### Added
- Social share system for marketplace items
  - `ShareButton` component with Web Share API (mobile) and dropdown with Twitter/X, Facebook, LinkedIn, Reddit, Hacker News, Email share links
  - Copy-to-clipboard link sharing with confirmation feedback
  - `src/lib/share.ts` utility with share URL generators for 6 platforms
  - Share buttons integrated on all plugin and agent detail pages
- Enhanced JSON-LD structured data for marketplace items
  - `SoftwareApplication` schema with version, author, category, offer metadata on every plugin and agent detail page
  - `Article` schema generator for content pages
- Sitemap: added `/docs` and `/getting-started` index pages, raised FAQ priority to 0.8
- Dynamic Open Graph image generation for marketplace items
  - Per-plugin OG images with name, kind badge, description, version, author
  - Per-agent OG images with name, provider badge, description, version, author
  - Dark theme branding matching site design, 1200×630 resolution

### Fixed
- XSS in `StructuredData` component — `JSON.stringify` output now escapes `<` to `\u003C` to prevent `</script>` injection via user-submitted content
- `SITE_URL` duplication — `share.ts` now re-exports from `seo.ts` to prevent drift
- Native share cancellation on mobile no longer opens the share dropdown

## [0.5.0] — 2026-06-15

### Added
- Database-driven Knowledge Base CMS with full admin management UI
  - `KnowledgeBaseArticle` database model with title, slug, content, description, published, sortOrder, createdBy
  - Public API: `GET /api/knowledge-base` (list published) and `GET /api/knowledge-base/[slug]` (single article)
  - Admin API: `GET/POST /api/admin/knowledge-base` and `GET/PUT/DELETE /api/admin/knowledge-base/[id]` with Zod validation, slug uniqueness checks, and audit logging
  - Admin UI at `/admin/knowledge-base` with table view, pagination, search, delete confirmation dialog
  - Split-view create/edit form with Markdown editor and live preview via `MdxContent` component
  - Auto-generated slugs from title with manual override, published/draft toggle, sort order
  - Dynamic sidebar links fetched from API, replacing hardcoded Knowledge Base section
  - Dynamic search index in `DocSearch` component including KB articles
  - Knowledge Base index page renders article listing grid with descriptions
  - Migration script (`scripts/migrate-knowledge-base.ts`) to migrate 9 existing MDX files to database
  - `src/lib/knowledge-base.ts` shared query helpers with pagination, search, and stats
  - Sitemap and `generateStaticParams` updated to source KB slugs from database

### Changed
- Knowledge Base articles now served from database instead of filesystem (`content/knowledge-base/` is archived)
- Docs page (`src/app/docs/[[...slug]]/page.tsx`) routes KB section to database while preserving other sections
- Sidebar Knowledge Base section dynamically populated from `GET /api/knowledge-base`
- Sitemap KB entries sourced from `getKbSlugs()` (database) instead of `getContentSlugs()` (filesystem)

## [0.4.0] — 2026-06-15

### Added
- Discord OAuth login — "Sign in with Discord" button on login page with full OAuth flow
  - `GET /api/auth/discord/callback` — exchanges Discord code, creates/authenticates user, returns HTML page that stores JWT in localStorage
  - New users created from Discord with generated username, no password (sign in via Discord only)
  - `discordId` and `discordUsername` fields on User model
- Discord account linking in Settings → Security tab
  - `POST /api/auth/discord/link` — links Discord to existing account (requires auth)
  - `DELETE /api/auth/discord/link` — unlinks Discord account
  - Cryptographic state validation prevents CSRF on OAuth linking
- Standalone Discord bot service (`discord-bot/`)
  - Bot entry point with slash command registration and interaction handling
  - `/stats` — marketplace statistics (total plugins, agents, pending counts)
  - `/plugin search <query>` / `/plugin info <name|id>` — marketplace plugin search and details
  - `/agent search <query>` / `/agent info <name|id>` — marketplace agent search and details
  - `/review list|approve|reject` — admin moderation commands with role verification
  - Prisma integration with shared database schema
  - Dockerfile for containerized deployment
- Submission webhook notifications via `DISCORD_SUBMISSION_WEBHOOK_URL`
  - Fire-and-forget Discord embed on plugin and agent submissions
  - Includes type, name, author, status, and admin review link
- `discordUsername` field exposed in AuthContext and auth API responses
- Cryptographic OAuth state verification for account linking flow

### Changed
- `src/lib/auth.ts` — `getUserFromToken` select expanded to include `discordUsername` and all profile fields
- `src/app/api/auth/me/route.ts` — PUT handler supports `discordId`/`discordUsername` fields for unlinking
- `src/lib/AuthContext.tsx` — `AuthUser` interface now includes optional `discordUsername`

## [0.3.0] — 2026-06-15

### Added
- Full RBAC system with granular permissions and role management
  - `Permission`, `Role`, and `RolePermission` database models with 9 predefined permissions
  - Three built-in roles: Administrator (full access), Moderator (review/content), Developer (publish)
  - Admin UI for managing users, roles, and permissions at `/admin/users` and `/admin/roles`
  - Permission checks via `hasPermission()` and `hasAnyPermission()` middleware functions
  - Role-based access control throughout all admin API routes
- GitHub topic scanner for discovering Cortex ecosystem repos
  - Search GitHub by cortex-related topics (`cortex-plugin`, `cortex-agent`, `esm`, `mcp`, `wasm`, etc.)
  - Automatic manifest detection from `cortex.json`, `manifest.json`, and common paths
  - Auto-classifies repos as plugin or agent based on manifest content
  - Scan history, result pagination, per-repo import with auto-approve option
  - Admin UI at `/admin/github/scanner` with topic quick-pick buttons
- GitHub repository import API (`POST /api/marketplace/import`)
  - Accepts a GitHub repository URL, fetches manifest and metadata automatically
  - Auto-detects plugin vs agent from manifest fields (kind/capabilities vs provider/model)
  - Fetches README.md and stores it for display on detail pages
  - Fetches repository metadata (stars, forks, topics, license)
  - Fetches icon (icon.png/icon.svg) from repo root
  - Returns 409 if plugin/agent already exists to prevent duplicates
  - Tabbed publish UI: manual form or GitHub import at `/marketplace/publish/plugin`
- Admin settings page (`/admin/settings`) for GitHub API token configuration
  - Token stored in database via `Setting` model, with env var fallback (`GITHUB_TOKEN`)
  - Clear documentation about token scopes (`public_repo` only) and rate limit benefits
- Enhanced admin sidebar with navigation for: Dashboard, Submissions, Users, Roles, GitHub Connections, Topic Scanner, Settings, Activity Log
- Admin dashboard with stats cards, pending submission alerts, recent activity feed
- Admin submission review with review notes, review history, search, pagination, status filters
- Admin user management with role assignment dropdown, suspend/activate controls
- Admin GitHub connection management with per-repo sync, auto-approve, activate/deactivate
- Admin activity log with action type filtering and pagination
- Audit logging system (`AuditLog` model) that tracks all admin actions
  - Submission approvals/rejections, GitHub connections, topic scans
  - Silently fails to never break the main application flow
- `GitHubConnection` model for managing connected repositories
  - Per-repo config for branch, manifest path, sync plugins/agents, auto-approve
  - One-click sync button with result feedback
- Enhanced user profile system
  - `displayName`, `location`, `socialLinks` (Twitter/X, GitHub, Discord, LinkedIn) fields
  - `preferences` JSON field (email notifications, theme selection)
  - `emailVerified` boolean flag for email verification status
  - Rich public profile page with social links, stats row, published content grid
  - Tabbed settings page with Profile, Account, Security, Preferences, and Danger Zone sections
  - Username and email editing with duplicate checking
  - Account deletion with typed confirmation flow
  - Theme preference selector (dark/light/system)
- Auth system now returns and caches full user objects (avatar, bio, website, displayName, socialLinks, preferences, emailVerified)
- `refreshUser()` method on AuthContext for re-fetching user data from server

### Changed
- Database path normalized: `DATABASE_URL` changed to `file:./marketplace.db` (relative to schema file)
- Removed nested `prisma/prisma/` database directory — database now lives at `prisma/marketplace.db`
- All admin API routes now use permission-based auth checks alongside admin role check
- Marketplace landing page changed from static to dynamic rendering for real-time counts
- Login, register, and profile API routes return enriched user objects with all profile fields

### Fixed
- Database path mismatch causing inconsistent state between dev server and build
- Marketplace plugin/agent counts being stale due to static page generation
- Module-scoped token variable in admin pages causing stale auth state
- Removed seed and setup scripts from package.json to prevent accidental data overwrites

### Removed
- `db:seed` and `setup` npm scripts to prevent accidental production data loss
- Nested `prisma/prisma/` database directory structure

## [0.2.0] — 2026-06-15

### Added
- Enhanced marketplace card design with featured item support and improved visual hierarchy
  - Featured badge and gradient backgrounds for showcase items
  - Better hover effects with lift animations and category-specific color themes
  - Improved responsive design with proper padding and text truncation
- Improved marketplace categorization and filtering system
  - Reorganized filter UI into dedicated glass cards with visual organization
  - Category filter section with "All Categories" button and visual selection indicators
  - AI Provider filter section for agents (purple-themed)
  - Plugin Type filter section with color-coded badges (emerald/teal/purple)
  - Better filter visibility with increased touch targets on mobile
- Enhanced marketplace listing pages with new profile features
  - Configuration sections on detail pages showing provider, model, temperature, entry point, license
  - Statistics grid displays (downloads, rating, version, published date)
  - Better visual hierarchy with icon indicators and responsive layouts
- Redesigned main marketplace page with improved visual hierarchy
  - Gradient-enhanced category showcase cards (emerald for plugins, purple for agents)
  - Three-column marketplace overview with stats and quick links
  - "Why Use the Marketplace?" feature highlight section
  - Better visual separation between sections with category-specific colors
- Mobile-responsive marketplace improvements
  - Grid layouts responsive across all screen sizes (1-2-3 columns)
  - Improved card padding and typography on mobile devices
  - Flexible detail page headers (vertical on mobile, horizontal on desktop)
  - Better filter button layouts with horizontal scrolling on small screens
  - Responsive stats grid (2 columns on mobile, 4 on desktop/large)

### Changed
- Marketplace pages now use consistent glass-card styling with improved spacing
- Agent and plugin cards have updated styling with gradient backgrounds
- Detail page headers reorganized for better responsive behavior
- Filter sections now have dedicated glass cards instead of inline flex layouts

## [0.1.1] — 2026-06-15

### Added
- Profile editing: bio, website, and avatar fields via settings page (`/dashboard/settings`)
- Password change API and UI with current password verification and bcrypt hashing
- Confirm password field on registration page with client-side validation
- Navbar logout button in user dropdown (desktop + mobile)
- "Edit Profile" link on own public profile page via `ProfileActions` client component
- `updateUser` method in AuthContext for syncing profile changes to state and localStorage
- Shared `authenticateRequest()` helper in `@/lib/auth` to deduplicate API auth logic
- Jacob seed user (admin@cortexprism.io / password123) as admin
- Dynamic password hashing in seed script (bcrypt at runtime, not hardcoded hash)
- Navbar dropdown close delay (200ms) to prevent premature dismissal on hover gap

### Changed
- `getUserFromToken` now includes `website` field in Prisma select
- PUT `/api/auth/me` skips redundant DB refetch after update (merges in-memory)
- PUT `/api/auth/password` uses `verifyToken` (JWT-only) instead of full-profile DB query
- Registration form styling consistent with login page design system

### Fixed
- Navbar dropdown closing too quickly when cursor crosses button-to-menu gap
- Stale `.next` webpack cache causing 500 errors on profile and settings pages
- Production database replaced on every deploy (build script copies seed DB)

### Added (from prior unreleased)
- Comprehensive SEO improvements for improved natural search traffic
  - `robots.txt` with crawl directives (disallows auth/admin pages, blocks GPTBot/CCBot)
  - `sitemap.xml` with dynamic generation of all 80+ pages, docs, and marketplace items
  - JSON-LD structured data: Organization, WebSite, SoftwareApplication, BreadcrumbList
  - OpenGraph metadata with og:image, og:url, og:description on all pages
  - Twitter Card metadata (summary_large_image) on all pages
  - Canonical URLs across all public-facing pages
  - Keyword-rich meta descriptions (135-160 chars) with target phrases
  - Dynamic OpenGraph image generation via `next/og` ImageResponse
  - SEO utility library (`src/lib/seo.ts`) with reusable functions and constants
  - Enhanced root layout metadata with metadataBase, keywords array, robots directives
  - Noindex on protected routes (login, register, dashboard, admin)
  - Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy)
  - Breadcrumb navigation with structured data for documentation pages
  - Semantic HTML improvements with aria-labels on landing components
  - Layout files with metadata for client-side routes (marketplace, openapi)
  - Enhanced keyword density across landing pages (about, features, use-cases, security)
  - Enhanced footer description with additional keywords

## [0.1.0] — 2026-06-15

### Added
- Developer Guide section with full plugin development framework (9 pages)
  - Plugin Types: ESM, MCP, WASM comparison and decision matrix
  - ESM Plugin Development: SDK, validation, testing, bundling guide
  - MCP Plugin Development: TypeScript and Python examples, transports, lifecycle
  - WASM Plugin Development: Rust, Go, C support, ABI, memory model
  - Plugin API Reference: lifecycle hooks, CapabilityContext, manifest schema
  - Agent Development: custom agent configs, soul/persona, tools, examples
  - Publishing Guide: web UI and API submission workflows, version management
  - Best Practices: guidelines for all three plugin types, testing, documentation
- Knowledge Base expansion (3 new pages)
  - Migration Guide: version upgrades, database and data directory migration
  - Security Guidelines: vault encryption, policy rules, incident response
  - Performance Tuning: provider latency, cascade router, memory pruning, profiling
- Collapsible sidebar sections with auto-expand for the active page
- Sidebar search bar for filtering across all 42 documentation pages
- Loading and error states for the Swagger UI API documentation page
- Full OpenAPI 3.1 spec coverage for all 20+ API endpoints
  - Authentication endpoints: register, login, me
  - Review endpoints for plugins and agents (GET/POST)
  - User submissions endpoint
  - Admin review workflow endpoints (GET/PUT for plugins and agents)
- Shared ScreenshotGallery and ReviewSection components (eliminating ~8KB of duplicate code)
- Prisma schema migration step in Dockerfile startup
- Plugin Getting Started guide (CLI commands, Web UI, configuration, lifecycle states, plugin store layout)
- Extension points documentation (tools, CLI commands, LLM providers, UI panels, config extensions)
- PluginContext API reference with config store, state store, and logger
- Full manifest reference with capabilities enum, trust levels, and UI settings schema

### Changed
- Documentation sidebar sections are now collapsible with chevron indicators
- Documentation sidebar now has real-time search filtering
- Plugin detail page bundle size reduced from 2.98 kB to 1.53 kB
- Agent detail page bundle size reduced from 3.35 kB to 1.97 kB
- OpenAPI spec schemas updated with all current fields (githubStars, tags, screenshots, versions, etc.)
- `getCortexVersion()` evaluated at module level instead of per-request
- Design docs index now links to inline architecture docs alongside external GitHub references
- Navigation bar includes Developer Guide in Docs dropdown
- Footer includes Developer Guide and Publish links
- Plugin and agent detail pages show GitHub stars, forks, topics from API

### Fixed
- Stale `.next` build cache causing 500 errors after rebuilds

## [0.0.2] — 2026-06-14

### Added
- User account system with registration, login, and JWT authentication
- Role-based access control (user / admin roles)
- Admin panel for reviewing and approving/rejecting marketplace submissions
- User dashboard showing submission status with pending/approved/rejected badges
- Submission workflow: new plugins and agents start as "pending" until admin approval
- SubmissionReview audit trail tracking who approved/rejected each item
- Login and Register pages with form validation
- Dynamic navigation bar showing Sign In or username based on auth state
- Admin seed user (admin@cortexprism.io) created during database seeding

### Changed
- Marketplace API now filters by `status: "approved"` instead of `published: true`
- Plugin and AgentConfig models use `status` field (pending/approved/rejected)
- Publish form submits via authenticated API and redirects to dashboard
- CORS middleware expanded to cover auth and admin API routes

## [0.0.1] — 2026-06-14

### Added
- Initial public release of the CortexPrism website
- Landing page with hero, stats bar, feature grid, and CTA
- Features overview page with 11 detailed feature cards
- Changelog page pulling live from GitHub CHANGELOG.md files
- Recent commits section showing activity from both cortex-web and cortex repos
- Contribute page with development setup guide
- Getting Started documentation (quickstart, installation, first run, configuration)
- CLI Reference documentation for all cortex subcommands
- Architecture documentation (agent loop, memory, security, router, daemon, plugins, databases)
- Knowledge Base (FAQ, troubleshooting, best practices, provider guide, sandbox guide)
- Design Docs index page with links to GitHub specs
- Plugin marketplace with debounced search, category/kind filtering, pagination, loading skeletons
- Agent marketplace with search, category/provider filtering, pagination, loading skeletons
- Plugin detail pages with install command, capabilities, README, metadata
- Agent detail pages with system prompt preview, tools, tags, model info
- Publish forms for plugins and agents
- Swagger UI at /openapi for the marketplace REST API
- OpenAPI 3.1 spec served at /api/docs/openapi.json
- Marketplace REST API with 10 endpoints (CRUD for plugins/agents, categories, stats, download)
- Zod validation for all POST/PUT endpoints
- CORS middleware for external Cortex instance access
- Dark theme with #0a0a0f background, indigo accent (#6366f1)
- Responsive design (mobile, tablet, desktop)
- SEO metadata with Open Graph tags
- Live GitHub stars from API with 5-minute caching
- Copy-to-clipboard for plugin/agent install commands
- Redesigned plugin/agent cards with deterministic color avatars, version display, hover effects
- SVG logo and favicon
- Dockerfile and docker-compose.yml for deployment
- Nginx reverse proxy configuration with Let's Encrypt SSL
- systemd service for production deployment
