# Changelog

All notable changes to the CortexPrism website will be documented in this file.

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
