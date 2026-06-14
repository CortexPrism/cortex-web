import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.category.upsert({ where: { slug: "code-execution" }, update: {}, create: { name: "Code Execution", slug: "code-execution" } }),
    prisma.category.upsert({ where: { slug: "data-processing" }, update: {}, create: { name: "Data Processing", slug: "data-processing" } }),
    prisma.category.upsert({ where: { slug: "developer-tools" }, update: {}, create: { name: "Developer Tools", slug: "developer-tools" } }),
    prisma.category.upsert({ where: { slug: "analytics" }, update: {}, create: { name: "Analytics", slug: "analytics" } }),
    prisma.category.upsert({ where: { slug: "communication" }, update: {}, create: { name: "Communication", slug: "communication" } }),
    prisma.category.upsert({ where: { slug: "productivity" }, update: {}, create: { name: "Productivity", slug: "productivity" } }),
    prisma.category.upsert({ where: { slug: "research" }, update: {}, create: { name: "Research", slug: "research" } }),
    prisma.category.upsert({ where: { slug: "security" }, update: {}, create: { name: "Security", slug: "security" } }),
  ]);

  const cat = (slug: string) => prisma.category.findUnique({ where: { slug } }).then(r => r!.id);

  const categories = await prisma.category.findMany();

  const c = (slug: string) => categories.find((x) => x.slug === slug)!.id;

  const plugins = [
    {
      name: "Python Executor", slug: "python-executor", version: "1.2.0",
      description: "Execute Python scripts and return results. Supports pip packages, virtual environments, and timeout controls.",
      kind: "esm", entryPoint: "plugins/python-executor/mod.ts",
      capabilities: JSON.stringify(["python:execute", "python:install", "python:list-packages"]),
      author: "CortexPrism", authorUrl: "https://github.com/CortexPrism",
      homepage: "https://github.com/CortexPrism/cortex",
      repository: "https://github.com/CortexPrism/cortex",
      license: "MIT", categoryId: c("code-execution"),
      readme: `# Python Executor\n\nExecute Python code directly from your agent's conversations. Supports pip package installation and virtual environment isolation.\n\n## Usage\n\n\`\`\`\ncortex plugin install marketplace:cortexprism.io/plugins/python-executor\n\`\`\`\n\n## Features\n- Run Python 3.11+ scripts\n- Install pip packages on demand\n- Configurable timeouts\n- Sandboxed execution\n`,
    },
    {
      name: "SQL Query Engine", slug: "sql-query", version: "0.8.1",
      description: "Run SQL queries against PostgreSQL, MySQL, SQLite, and more. Supports read-only mode for safety.",
      kind: "esm", entryPoint: "plugins/sql-query/mod.ts",
      capabilities: JSON.stringify(["sql:query", "sql:list-tables", "sql:describe"]),
      author: "CortexPrism", categoryId: c("data-processing"),
    },
    {
      name: "Web Scraper", slug: "web-scraper", version: "1.0.3",
      description: "Extract structured data from web pages. Supports CSS selectors, JSON-LD, and pagination.",
      kind: "mcp", entryPoint: "plugins/web-scraper/server.ts",
      capabilities: JSON.stringify(["web:scrape", "web:extract", "web:screenshot"]),
      author: "CortexPrism", categoryId: c("data-processing"),
    },
    {
      name: "Slack Integration", slug: "slack-integration", version: "0.5.0",
      description: "Send messages, read channels, and search Slack workspaces. Requires Slack API token.",
      kind: "mcp", entryPoint: "plugins/slack/server.ts",
      capabilities: JSON.stringify(["slack:send", "slack:read", "slack:search"]),
      author: "Community", categoryId: c("communication"),
    },
    {
      name: "Image Generator", slug: "image-generator", version: "1.1.0",
      description: "Generate images using Stable Diffusion and DALL-E. Supports prompt templates and batch generation.",
      kind: "esm", entryPoint: "plugins/image-gen/mod.ts",
      capabilities: JSON.stringify(["image:generate", "image:edit", "image:variation"]),
      author: "CortexPrism", categoryId: c("productivity"),
    },
    {
      name: "WASM Runtime", slug: "wasm-runtime", version: "0.3.0",
      description: "Run WebAssembly modules with host function bindings. Supports WASI preview 1 and 2.",
      kind: "wasm", entryPoint: "plugins/wasm-runtime/mod.ts",
      capabilities: JSON.stringify(["wasm:run", "wasm:compile", "wasm:inspect"]),
      author: "CortexPrism", categoryId: c("code-execution"),
    },
  ];

  for (const p of plugins) {
    await prisma.plugin.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, status: "approved", downloads: 0, rating: 0 },
    });
  }

  const agents = [
    {
      name: "Code Reviewer", slug: "code-reviewer", version: "1.0.0",
      description: "An expert code reviewer agent that analyzes pull requests and provides detailed feedback on code quality, security, and best practices.",
      provider: "anthropic", model: "claude-sonnet-4-20250514", temperature: 0.2,
      tools: JSON.stringify(["codebase_search", "read", "grep", "glob"]),
      tags: JSON.stringify(["code-review", "development", "best-practices"]),
      systemPrompt: "You are an expert code reviewer. Analyze code for bugs, security issues, performance problems, and style violations. Provide constructive feedback with specific line references and suggested fixes.",
      author: "CortexPrism", categoryId: c("developer-tools"),
    },
    {
      name: "Research Assistant", slug: "research-assistant", version: "1.2.0",
      description: "A thorough research agent that gathers information from multiple sources, synthesizes findings, and produces comprehensive reports with citations.",
      provider: "openai", model: "gpt-4o", temperature: 0.7,
      tools: JSON.stringify(["web_fetch", "codebase_search", "read", "grep"]),
      tags: JSON.stringify(["research", "writing", "analysis"]),
      systemPrompt: "You are a research assistant. Gather information from multiple sources, cross-reference facts, and produce well-structured reports with proper citations. Be thorough and objective.",
      author: "CortexPrism", categoryId: c("research"),
    },
    {
      name: "Security Auditor", slug: "security-auditor", version: "0.9.0",
      description: "A security-focused agent that audits codebases for vulnerabilities, checks dependency security, and generates security reports.",
      provider: "anthropic", model: "claude-opus-4-20250514", temperature: 0.1,
      tools: JSON.stringify(["codebase_search", "grep", "read", "glob", "bash"]),
      tags: JSON.stringify(["security", "auditing", "vulnerabilities"]),
      systemPrompt: "You are a security auditor. Scan code for OWASP Top 10 vulnerabilities, check dependency security, and generate detailed security reports with severity ratings and remediation steps.",
      author: "CortexPrism", categoryId: c("security"),
    },
    {
      name: "Data Analyst", slug: "data-analyst", version: "1.1.0",
      description: "A data analysis agent that works with CSV, JSON, and database data to produce visualizations, statistics, and insights.",
      provider: "openai", model: "gpt-4o", temperature: 0.3,
      tools: JSON.stringify(["bash", "codebase_search", "read", "grep"]),
      tags: JSON.stringify(["data", "analytics", "visualization"]),
      systemPrompt: "You are a data analyst. Analyze datasets, compute statistics, create visualizations, and provide clear insights. Use Python for data analysis when appropriate.",
      author: "Community", categoryId: c("analytics"),
    },
  ];

  for (const a of agents) {
    await prisma.agentConfig.upsert({
      where: { slug: a.slug },
      update: {},
      create: { ...a, status: "approved", downloads: 0, rating: 0 },
    });
  }

  const adminExists = await prisma.user.findUnique({ where: { email: "admin@cortexprism.io" } });
  if (!adminExists) {
    const hash = "$2b$12$uLMC.1/n48Wfsgpo8M/Pa.KWVdds1M4CjISd7qvoAgrR9Mm3g5miq";
    await prisma.user.create({
      data: { email: "admin@cortexprism.io", username: "admin", passwordHash: hash, role: "admin" },
    });
    console.log("Admin user created (admin@cortexprism.io / admin12345)");
  }

  console.log("Seed data created — all download/rating counters start at 0");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
