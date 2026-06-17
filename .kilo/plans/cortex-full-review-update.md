# Cortex Full Review & Website Update Plan

## Scope
Full review of the Cortex system at https://github.com/CortexPrism/cortex (`main` branch) and update every page, knowledge base article, and component on the CortexPrism website (cortex-web) to reflect accurate, current information.

---

## Part A: Cortex Source Review Findings

### A1. CLI Commands (36 registered in `src/main.ts`, website lists ~17)

**Documented on website:**
chat, serve, daemon, stop, run, memory, reflect, vault, policy, jobs, sessions, setup, migrate, soul*, discord*, plugins*, marketplace*, import*, agent*, service*

(* = listed but no detail page)

**Missing entirely from website CLI docs:**
| Command | Source File | Description |
|---------|-------------|-------------|
| `update` | `src/cli/update-cmd.ts` | Check/apply/rollback updates, channels |
| `git` | `src/cli/git-cmd.ts` | Full git porcelain via workspace |
| `github` | `src/cli/github-cmd.ts` | PRs, issues, repos, branches |
| `hooks` | `src/cli/hooks-cmd.ts` | Git hooks management |
| `triggers` | `src/cli/triggers-cmd.ts` | File watchers, webhooks, event triggers |
| `channels` | `src/cli/channels-cmd.ts` | Communication channels (Discord) |
| `mcp` | `src/cli/mcp-cmd.ts` | MCP server management |
| `remote` | `src/cli/remote-cmd.ts` | Remote agent management |
| `tui` | `src/cli/tui-cmd.ts` | Terminal UI |
| `projects` | `src/cli/projects-cmd.ts` | Project management |
| `workflow` | `src/cli/workflow-cmd.ts` | Workflow engine |
| `desktop` | `src/cli/desktop-cmd.ts` | Desktop app launcher |
| `node` | `src/cli/node.ts` | Hub node |
| `eval` | `src/cli/eval-cmd.ts` | Evaluation framework |
| `models` | `src/cli/models-cmd.ts` | Model management |
| `qm` / `mqm` | `src/cli/quartermaster-cmd.ts` | Model Quartermaster |
| `install` / `uninstall` | `src/cli/install.ts` | Install/uninstall utilities |

### A2. New Source Modules Not Documented

| Module | Path | Purpose |
|--------|------|---------|
| **MCP Server** | `src/mcp/server.ts` | Cortex as MCP server (stdio transport) |
| **Channels** | `src/channels/` | Messaging channel integration (Discord, manager, types) |
| **Desktop** | `src/desktop/` | Desktop application support |
| **Eval** | `src/eval/` | Evaluation runner, scorer, types for benchmarking agents |
| **Hub** | `src/hub/` | Distributed node registry (ws-node, capability-tiers, session-routing) |
| **IPC** | `src/ipc/` | Inter-process communication |
| **Observability** | `src/observability/` | Metrics (OpenTelemetry) and tracing |
| **Pipeline** | `src/pipeline/` | Processing pipeline (builtin steps, manager) |
| **Plugins** | `src/plugins/` | Full plugin system: extensions, install, integrity, loader, manager, namespace, permissions, registry, sandbox, types, UI-slots, update, wasm-runtime |
| **Projects** | `src/projects/` | Project manager |
| **Quartermaster** | `src/quartermaster/` | Model Quartermaster: contexts, fusion, learn, monitor, signals, store (6-signal prediction) |
| **Remote** | `src/remote/` | Remote agent management |
| **Services** | `src/services/` | Micro-service manager |
| **Skills** | `src/skills/builtin/` | Built-in skill definitions |
| **Triggers** | `src/triggers/` | Git hooks, file watchers, webhook triggers |
| **TUI** | `src/tui/` | Terminal UI (rich terminal interface) |
| **Workflow** | `src/workflow/` | Workflow engine |

### A3. Memory Tier Names — CRITICAL MISMATCH

**Website says (incorrect):** Ephemeral, Working, Semantic, Archival, Procedural
**Actual source/README:** Ephemeral (T1), Episodic (T2), Semantic (T3), Archival (T4), Reflection (T5)

This affects: `FeatureGrid.tsx`, `features/page.tsx`

### A4. Key Features Missing from Landing/Features Pages

- Git workspace (full git porcelain, auto-commit, branch management)
- GitHub integration (PR creation, issue tracking, repo browsing)
- Update system (binary mode, channels, auto-update, rollback, SHA-256 verification)
- Model Quartermaster (6-signal prediction engine, adaptive EMA learning, 3 arbiter strategies)
- Cortex Lens (full activity audit log)
- Workflow engine
- Trigger system (file watchers, webhooks, git hooks)
- TUI (terminal UI)
- Desktop app
- MCP server support
- Remote agents
- Observability (metrics, tracing)
- Evaluation framework
- Skills system
- Per-turn reflection (mentioned in about but not features)

### A5. Feature Page Command Examples — OUTDATED

| Current Example | Issue |
|-----------------|-------|
| `cortex chat --model claude-sonnet-4-20250514` | Should be `claude-sonnet-4-5` per README |
| `cortex chat --tools all` | No such flag exists |
| `cortex memory search --tier semantic` | No `--tier` flag, use `--semantic` |
| `cortex policy add --allow code.execute.python` | Wrong syntax, should be `--kind shell --effect allow` |
| `cortex run --sandbox python --script analyze.py` | Wrong syntax, corrected: `cortex run analyze.py` |
| `cortex chat --router cost-optimized` | No such flag exists |
| `cortex daemon start && cortex jobs add --schedule "0 9 * * 1" --task weekly-report` | Jobs command syntax unverified |
| `cortex plugin install marketplace:cortexprism.io/plugins/python-executor` | Outdated plugin install syntax |
| `cortex agent create --name code-reviewer --model claude-sonnet-4-20250514` | Unverified syntax |
| `cortex serve --mode micro --workers 4` | No such flags exist |

### A6. Configuration Schema — Missing Sections

Current config doc shows: version, defaultProvider, providers, agent, router
Missing from website docs:
- `update` section (channel, checkOnStartup, autoUpdate, checkIntervalHours, githubToken, gpgKeyPath)
- Router strategy field (`strategy: "cascade" | "threshold"`)
- Provider `apiKey` is not required for Ollama (correctly documented)

### A7. Web UI Tabs Not Fully Enumerated

README lists: Chat, Editor, Git, GitHub, Code Runner, Lens, Memory, Jobs, Sessions, Agents, Services, Settings, Soul, Plugins, Marketplace, Analytics, Logs

Website barely mentions the Web UI tabs.

### A8. Knowledge Base Articles Need Updates

- `troubleshooting.mdx`: `cortex plugin install` syntax outdated
- `performance-tuning.mdx`: References `cortex benchmark` (doesn't exist), `cortex chat --profile` (unconfirmed), `cortex lens` commands, `cortex config migrate` — features unconfirmed in source
- `migration-guide.mdx`: References `cortex config migrate`, `cortex plugin reinstall --all` — unconfirmed
- `security-guidelines.mdx`: References `cortex lens tail`, `cortex lens search`, `cortex lens export` — commands from Lens audit log need verification
- `best-practices.mdx`: References Web UI dashboard tabs (accurate but incomplete)
- `faq.mdx`: `/model` slash command unconfirmed

### A9. Architecture Docs Missing Pages

Only 7 architecture docs exist. Missing needed docs:
- Model Quartermaster / Quartermaster system
- Cortex Hub (distributed node architecture)
- Channels & Discord integration
- Trigger system architecture
- Workflow engine
- Observability (metrics/tracing)
- Update system design
- Remote agents architecture

---

## Part B: Implementation Plan

### Phase 1: Critical Accuracy Fixes

#### B1.1 Fix Memory Tier Names (HIGH PRIORITY)
**Files to update:**
- `src/components/landing/FeatureGrid.tsx` (line 32): Change "Ephemeral, working, semantic, archival, and procedural" → "Episodic, semantic, and reflection with hybrid FTS5 + vector retrieval"
- `src/app/features/page.tsx` (lines 63-72): Replace entire memory feature with accurate 5-tier description (Ephemeral → Episodic → Semantic → Archival → Reflection)

#### B1.2 Fix Feature Page Command Examples (HIGH PRIORITY)
- `src/app/features/page.tsx`: Update all `example` fields to match actual CLI syntax

#### B1.3 Update CLI Reference Page
- `content/cli/index.mdx`: Add all 36+ commands with descriptions and links

### Phase 2: CLI Documentation Pages

Create new MDX files for undocumented commands:
- `content/cli/update.mdx` — cortex update (check, apply, rollback, channels, binary/source)
- `content/cli/git.mdx` — cortex git (status, log, diff, add, commit, push, pull, clone, branch, remote)
- `content/cli/github.mdx` — cortex github (token, pr, issue, repo commands)
- `content/cli/triggers.mdx` — cortex triggers (file watchers, webhooks, git hooks)
- `content/cli/channels.mdx` — cortex channels (Discord integration)
- `content/cli/mcp.mdx` — cortex mcp (MCP server management)
- `content/cli/remote.mdx` — cortex remote (remote agents)
- `content/cli/tui.mdx` — cortex tui (terminal UI)
- `content/cli/projects.mdx` — cortex projects (project management)
- `content/cli/workflow.mdx` — cortex workflow (workflow engine)
- `content/cli/desktop.mdx` — cortex desktop (desktop app)
- `content/cli/eval.mdx` — cortex eval (evaluation framework)
- `content/cli/qm.mdx` — cortex qm/mqm (Model Quartermaster)
- `content/cli/soul.mdx` — cortex soul (agent persona)
- `content/cli/discord.mdx` — cortex discord (bot integration)
- `content/cli/plugins.mdx` — cortex plugins (plugin management)
- `content/cli/marketplace.mdx` — cortex marketplace (marketplace interaction)
- `content/cli/import.mdx` — cortex import (data import)
- `content/cli/agent.mdx` — cortex agent (agent config management)
- `content/cli/service.mdx` — cortex service (micro-service mode)
- `content/cli/models.mdx` — cortex models (model management)
- `content/cli/node.mdx` — cortex node (hub node)
- `content/cli/stop.mdx` — cortex stop (stop server/daemons)

### Phase 3: Architecture Documentation

#### B3.1 New Architecture Pages
- `content/architecture/quartermaster.mdx` — Model Quartermaster system
- `content/architecture/git-workspace.mdx` — Git workspace system
- `content/architecture/github-integration.mdx` — GitHub integration
- `content/architecture/channels.mdx` — Communication channels
- `content/architecture/triggers.mdx` — Trigger system
- `content/architecture/workflow.mdx` — Workflow engine
- `content/architecture/observability.mdx` — Metrics and tracing
- `content/architecture/remote-agents.mdx` — Remote agents
- `content/architecture/update-system.mdx` — Update system design
- `content/architecture/mcp-server.mdx` — MCP server

#### B3.2 Update Existing Architecture Pages
- `content/architecture/index.mdx`: Add new subsystems to overview table
- `content/architecture/model-router.mdx`: Add Model Quartermaster info
- `content/architecture/databases.mdx`: Add quartermaster/MQM database tables if any

### Phase 4: Landing Page & Features Updates

#### B4.1 FeatureGrid Component
- Add new features: Git workspace, GitHub integration, Model Quartermaster, Workflow Engine, Cortex Lens
- Remove or update memory tier description
- Consider expanding from 8 → 12 features

#### B4.2 Features Page
- Add the missing major features as new sections
- Fix all command examples
- Fix memory tier descriptions

#### B4.3 Hero Component
- Update tagline to mention key new capabilities
- Update terminal demo with more relevant commands

### Phase 5: Knowledge Base Updates

#### B5.1 Update Existing Articles
- `troubleshooting.mdx`: Fix plugin install syntax, add new error scenarios
- `performance-tuning.mdx`: Remove unverifiable commands, add Model Quartermaster performance info
- `migration-guide.mdx`: Remove unverifiable commands, update with actual update system info
- `security-guidelines.mdx`: Verify and fix Lens commands
- `best-practices.mdx`: Add Git/GitHub workflow tips, Model Quartermaster tips
- `faq.mdx`: Add questions about new features, fix memory tier description
- `sandbox-guide.mdx`: Verify resource limits, add new language info if changed
- `provider-guide.mdx`: Mostly accurate, minor model name updates

#### B5.2 New Knowledge Base Articles
- `content/knowledge-base/git-workspace-guide.mdx` — Using Git workspaces with Cortex
- `content/knowledge-base/github-integration-guide.mdx` — GitHub PR/issue workflow
- `content/knowledge-base/model-quartermaster.mdx` — Understanding MQM/QM

### Phase 6: Other Pages

- **About page** (`src/app/about/page.tsx`): Add Model Quartermaster, workflow engine, remote agents to description
- **Use Cases page** (`src/app/use-cases/page.tsx`): Add Git/GitHub workflow, Model Quartermaster cost optimization use cases
- **Install page** (`src/app/install/page.tsx`): Minor updates
- **Configuration page** (`content/getting-started/configuration.mdx`): Add update section, MQM section
- **Getting Started pages**: Update command examples
- **Design Docs** (`content/design-docs/index.mdx`): Minor updates if relevant

### Phase 7: Navigation & SEO

- Update sidebar navigation in `src/components/layout/Sidebar.tsx` to include new docs
- Ensure metadata descriptions on all pages are accurate

---

## Decisions Confirmed

1. **FeatureGrid**: Expand from 8 → 12 cards, fix all descriptions
2. **Execution order**: Complete all phases sequentially (1→2→3→4→5→6→7)
3. **Unverified commands**: Read relevant Cortex source files to verify existence before modifying docs

## Pre-Implementation: Source Verification Pass

Before Phase 1, verify these potentially-non-existent commands by reading source:
- `cortex benchmark` → check if exists in any CLI file
- `cortex lens export/tail/search` → check server router or CLI
- `cortex config migrate` → check config or setup command
- `cortex plugin reinstall --all` → check plugins command
- `/model` slash command in chat → check chat implementation
- `cortex chat --profile` → check chat implementation
