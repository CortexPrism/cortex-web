import { SITE_URL } from "@/lib/seo";

export const openapiSpec = {
  openapi: "3.1.0",
  info: {
    title: "CortexPrism Marketplace API",
    description:
      "REST API for the CortexPrism plugin and agent marketplace. Allows browsing, publishing, and managing plugins and agent configurations, plus user authentication and admin review workflows.",
    version: "1.0.0",
    contact: {
      url: SITE_URL,
    },
  },
  servers: [
    {
      url: SITE_URL,
      description: "Production",
    },
    {
      url: "http://localhost:3000",
      description: "Development",
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a new user",
        description: "Create a new marketplace account with email, username, and password",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "username", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  username: { type: "string", minLength: 3, maxLength: 30, example: "myusername" },
                  password: { type: "string", minLength: 8, example: "secure-password" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/UserSummary" },
                  },
                },
              },
            },
          },
          "400": { description: "Validation error (invalid input)" },
          "409": { description: "Email or username already taken" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        description: "Authenticate with email and password, receive a JWT token",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email", example: "user@example.com" },
                  password: { type: "string", example: "secure-password" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: { $ref: "#/components/schemas/UserSummary" },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid email or password" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Get current user",
        description: "Returns the authenticated user's profile. Requires a valid Bearer token.",
        tags: ["Authentication"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Current user data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        email: { type: "string" },
                        username: { type: "string" },
                        role: { type: "string", enum: ["user", "admin"] },
                        avatar: { type: "string", nullable: true },
                        bio: { type: "string", nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Invalid or missing token" },
        },
      },
    },
    "/api/marketplace/plugins": {
      get: {
        summary: "List plugins",
        description:
          "Get a paginated list of published plugins with optional search, category, and kind filters",
        tags: ["Plugins"],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search across name and description" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category slug" },
          { name: "kind", in: "query", schema: { type: "string", enum: ["esm", "mcp", "wasm"] }, description: "Filter by plugin type" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 }, description: "Page number (1-indexed)" },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 }, description: "Items per page (max 100)" },
        ],
        responses: {
          "200": {
            description: "Paginated list of plugins",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plugins: { type: "array", items: { $ref: "#/components/schemas/PluginSummary" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Publish a plugin",
        description: "Submit a new plugin to the marketplace. Requires authentication.",
        tags: ["Plugins"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PluginInput" } },
          },
        },
        responses: {
          "201": {
            description: "Plugin created (pending review)",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PluginDetail" } },
            },
          },
          "400": { description: "Validation error" },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/api/marketplace/plugins/{id}": {
      get: {
        summary: "Get plugin detail",
        description: "Returns full plugin details including screenshots, versions, and GitHub metadata",
        tags: ["Plugins"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Plugin ID or slug" },
        ],
        responses: {
          "200": {
            description: "Plugin detail",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PluginDetail" } },
            },
          },
          "404": { description: "Plugin not found" },
        },
      },
      put: {
        summary: "Update a plugin",
        description: "Update an existing plugin's metadata. Requires authentication.",
        tags: ["Plugins"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/PluginInput" } },
          },
        },
        responses: {
          "200": { description: "Plugin updated" },
          "401": { description: "Authentication required" },
          "404": { description: "Plugin not found" },
        },
      },
      delete: {
        summary: "Delete a plugin",
        description: "Remove a plugin from the marketplace. Requires authentication.",
        tags: ["Plugins"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "204": { description: "Plugin deleted" },
          "401": { description: "Authentication required" },
          "404": { description: "Plugin not found" },
        },
      },
    },
    "/api/marketplace/plugins/{id}/download": {
      get: {
        summary: "Download plugin manifest",
        description:
          "Increment download count and return the PluginManifest JSON, compatible with `cortex plugin install marketplace:`",
        tags: ["Plugins"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Plugin ID or slug" },
        ],
        responses: {
          "200": {
            description: "PluginManifest JSON",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/PluginManifest" } },
            },
          },
          "404": { description: "Plugin not found" },
        },
      },
    },
    "/api/marketplace/plugins/{id}/reviews": {
      get: {
        summary: "List plugin reviews",
        description: "Get all ratings and reviews for a plugin",
        tags: ["Plugins"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Plugin ID or slug" },
        ],
        responses: {
          "200": {
            description: "Reviews list with aggregate rating",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ratings: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Review" },
                    },
                    averageRating: { type: "number", format: "float" },
                    totalRatings: { type: "integer" },
                  },
                },
              },
            },
          },
          "404": { description: "Plugin not found" },
        },
      },
      post: {
        summary: "Submit a plugin review",
        description: "Submit or update a rating and optional review for a plugin. Requires authentication.",
        tags: ["Plugins"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  review: { type: "string", maxLength: 1000 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Review submitted or updated" },
          "400": { description: "Validation error" },
          "401": { description: "Authentication required" },
          "404": { description: "Plugin not found" },
        },
      },
    },
    "/api/marketplace/agents": {
      get: {
        summary: "List agent configs",
        description:
          "Get a paginated list of published agent configurations with optional search, category, and provider filters",
        tags: ["Agents"],
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Full-text search" },
          { name: "category", in: "query", schema: { type: "string" }, description: "Filter by category slug" },
          { name: "provider", in: "query", schema: { type: "string" }, description: "Filter by LLM provider" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of agent configs",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    agents: { type: "array", items: { $ref: "#/components/schemas/AgentSummary" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Publish an agent config",
        description: "Submit a new agent configuration. Requires authentication.",
        tags: ["Agents"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AgentInput" } },
          },
        },
        responses: {
          "201": { description: "Agent config created (pending review)" },
          "400": { description: "Validation error" },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/api/marketplace/agents/{id}": {
      get: {
        summary: "Get agent config detail",
        description: "Returns full agent configuration details including system prompt, tools, and GitHub metadata",
        tags: ["Agents"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Agent ID or slug" },
        ],
        responses: {
          "200": {
            description: "Agent config detail",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AgentDetail" } },
            },
          },
          "404": { description: "Agent config not found" },
        },
      },
      put: {
        summary: "Update an agent config",
        tags: ["Agents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/AgentInput" } },
          },
        },
        responses: {
          "200": { description: "Agent config updated" },
          "401": { description: "Authentication required" },
          "404": { description: "Agent config not found" },
        },
      },
      delete: {
        summary: "Delete an agent config",
        tags: ["Agents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "204": { description: "Agent config deleted" },
          "401": { description: "Authentication required" },
          "404": { description: "Agent config not found" },
        },
      },
    },
    "/api/marketplace/agents/{id}/download": {
      get: {
        summary: "Download agent config",
        description:
          "Increment download counter and return the full agent configuration, compatible with `cortex agent import`",
        tags: ["Agents"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Full agent config JSON" },
          "404": { description: "Agent config not found" },
        },
      },
    },
    "/api/marketplace/agents/{id}/reviews": {
      get: {
        summary: "List agent reviews",
        description: "Get all ratings and reviews for an agent configuration",
        tags: ["Agents"],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Reviews list with aggregate rating",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ratings: { type: "array", items: { $ref: "#/components/schemas/Review" } },
                    averageRating: { type: "number" },
                    totalRatings: { type: "integer" },
                  },
                },
              },
            },
          },
          "404": { description: "Agent not found" },
        },
      },
      post: {
        summary: "Submit an agent review",
        description: "Submit or update a rating and optional review for an agent. Requires authentication.",
        tags: ["Agents"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["rating"],
                properties: {
                  rating: { type: "integer", minimum: 1, maximum: 5 },
                  review: { type: "string", maxLength: 1000 },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Review submitted or updated" },
          "400": { description: "Validation error" },
          "401": { description: "Authentication required" },
          "404": { description: "Agent not found" },
        },
      },
    },
    "/api/marketplace/categories": {
      get: {
        summary: "List categories",
        description: "Get all categories with their plugin and agent counts",
        tags: ["Marketplace"],
        responses: {
          "200": {
            description: "List of categories",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      name: { type: "string" },
                      slug: { type: "string" },
                      pluginCount: { type: "integer" },
                      agentCount: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/marketplace/stats": {
      get: {
        summary: "Get marketplace stats",
        description: "Aggregate statistics for the marketplace: total plugins, agents, downloads, and categories",
        tags: ["Marketplace"],
        responses: {
          "200": {
            description: "Marketplace statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalPlugins: { type: "integer" },
                    totalAgents: { type: "integer" },
                    totalDownloads: { type: "integer" },
                    categories: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/user/submissions": {
      get: {
        summary: "Get user submissions",
        description:
          "Returns the authenticated user's submitted plugins and agents with their review status. Requires authentication.",
        tags: ["User"],
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User's submissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plugins: { type: "array", items: { $ref: "#/components/schemas/PluginSummary" } },
                    agents: { type: "array", items: { $ref: "#/components/schemas/AgentSummary" } },
                  },
                },
              },
            },
          },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/api/admin/submissions/plugins": {
      get: {
        summary: "List plugin submissions (admin)",
        description: "List all plugin submissions filtered by status. Admin access required.",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["pending", "approved", "rejected"], default: "pending" } },
        ],
        responses: {
          "200": {
            description: "List of plugin submissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plugins: { type: "array", items: { $ref: "#/components/schemas/PluginDetail" } },
                  },
                },
              },
            },
          },
          "403": { description: "Admin access required" },
        },
      },
      put: {
        summary: "Review a plugin submission (admin)",
        description: "Approve or reject a plugin submission. Creates an audit trail. Admin access required.",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id", "action"],
                properties: {
                  id: { type: "string", description: "Plugin ID" },
                  action: { type: "string", enum: ["approved", "rejected"] },
                  notes: { type: "string", description: "Reviewer notes" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Submission reviewed" },
          "400": { description: "Invalid request" },
          "403": { description: "Admin access required" },
          "404": { description: "Plugin not found" },
        },
      },
    },
    "/api/admin/submissions/agents": {
      get: {
        summary: "List agent submissions (admin)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["pending", "approved", "rejected"], default: "pending" } },
        ],
        responses: {
          "200": {
            description: "List of agent submissions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    agents: { type: "array", items: { $ref: "#/components/schemas/AgentDetail" } },
                  },
                },
              },
            },
          },
          "403": { description: "Admin access required" },
        },
      },
      put: {
        summary: "Review an agent submission (admin)",
        tags: ["Admin"],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["id", "action"],
                properties: {
                  id: { type: "string", description: "Agent ID" },
                  action: { type: "string", enum: ["approved", "rejected"] },
                  notes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Submission reviewed" },
          "400": { description: "Invalid request" },
          "403": { description: "Admin access required" },
          "404": { description: "Agent not found" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token obtained from /api/auth/login or /api/auth/register",
      },
    },
    schemas: {
      UserSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          username: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
        },
      },
      PluginSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          version: { type: "string" },
          description: { type: "string" },
          kind: { type: "string", enum: ["esm", "mcp", "wasm"] },
          tags: { type: "array", items: { type: "string" } },
          author: { type: "string", nullable: true },
          authorUrl: { type: "string", nullable: true },
          icon: { type: "string", nullable: true },
          license: { type: "string", nullable: true },
          downloads: { type: "integer" },
          rating: { type: "number", format: "float" },
          githubStars: { type: "integer" },
          category: { type: "string", nullable: true },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      PluginDetail: {
        allOf: [
          { $ref: "#/components/schemas/PluginSummary" },
          {
            type: "object",
            properties: {
              entryPoint: { type: "string" },
              capabilities: { type: "array", items: { type: "string" } },
              homepage: { type: "string", nullable: true },
              repository: { type: "string", nullable: true },
              readme: { type: "string", nullable: true },
              githubForks: { type: "integer" },
              githubTopics: { type: "array", items: { type: "string" } },
              screenshots: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string", format: "uri" },
                    alt: { type: "string", nullable: true },
                  },
                },
              },
              versions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    version: { type: "string" },
                    description: { type: "string" },
                    entryPoint: { type: "string" },
                    kind: { type: "string" },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      PluginManifest: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          version: { type: "string" },
          description: { type: "string" },
          kind: { type: "string" },
          entryPoint: { type: "string" },
          capabilities: { type: "array", items: { type: "string" } },
          author: { type: "string", nullable: true },
          homepage: { type: "string", nullable: true },
          repository: { type: "string", nullable: true },
          license: { type: "string", nullable: true },
        },
      },
      PluginInput: {
        type: "object",
        required: ["name", "version", "description", "kind", "entryPoint"],
        properties: {
          name: { type: "string", description: "Plugin name (kebab-case, unique)" },
          version: { type: "string", description: "Semantic version" },
          description: { type: "string" },
          kind: { type: "string", enum: ["esm", "mcp", "wasm"] },
          entryPoint: { type: "string" },
          capabilities: { type: "array", items: { type: "string" }, description: "List of capability identifiers" },
          tags: { type: "array", items: { type: "string" } },
          author: { type: "string" },
          authorUrl: { type: "string", format: "uri" },
          homepage: { type: "string", format: "uri" },
          repository: { type: "string", format: "uri", description: "GitHub repository URL" },
          license: { type: "string", description: "SPDX license identifier" },
          icon: { type: "string", format: "uri", description: "Icon URL" },
          readme: { type: "string", description: "Markdown documentation" },
          categoryId: { type: "string", description: "Category ID" },
        },
      },
      AgentSummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          slug: { type: "string" },
          version: { type: "string" },
          description: { type: "string" },
          provider: { type: "string", nullable: true },
          model: { type: "string", nullable: true },
          tags: { type: "array", items: { type: "string" } },
          tools: { type: "array", items: { type: "string" } },
          author: { type: "string", nullable: true },
          authorUrl: { type: "string", nullable: true },
          icon: { type: "string", nullable: true },
          license: { type: "string", nullable: true },
          downloads: { type: "integer" },
          rating: { type: "number", format: "float" },
          githubStars: { type: "integer" },
          category: { type: "string", nullable: true },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AgentDetail: {
        allOf: [
          { $ref: "#/components/schemas/AgentSummary" },
          {
            type: "object",
            properties: {
              temperature: { type: "number", format: "float", nullable: true },
              systemPrompt: { type: "string", nullable: true },
              soulContent: { type: "string", nullable: true },
              homepage: { type: "string", nullable: true },
              repository: { type: "string", nullable: true },
              readme: { type: "string", nullable: true },
              githubForks: { type: "integer" },
              githubTopics: { type: "array", items: { type: "string" } },
              screenshots: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    url: { type: "string", format: "uri" },
                    alt: { type: "string", nullable: true },
                  },
                },
              },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },
      AgentInput: {
        type: "object",
        required: ["name", "version", "description"],
        properties: {
          name: { type: "string", description: "Agent name (kebab-case, unique)" },
          version: { type: "string" },
          description: { type: "string" },
          provider: { type: "string", description: "LLM provider (e.g., anthropic, openai)" },
          model: { type: "string", description: "Model name" },
          temperature: { type: "number", minimum: 0, maximum: 2 },
          tools: { type: "array", items: { type: "string" }, description: "Available tool names" },
          tags: { type: "array", items: { type: "string" } },
          systemPrompt: { type: "string" },
          soulContent: { type: "string" },
          author: { type: "string" },
          authorUrl: { type: "string", format: "uri" },
          repository: { type: "string", format: "uri" },
          icon: { type: "string", format: "uri" },
          readme: { type: "string" },
          categoryId: { type: "string" },
        },
      },
      Review: {
        type: "object",
        properties: {
          id: { type: "string" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          review: { type: "string", nullable: true },
          user: {
            type: "object",
            properties: {
              id: { type: "string" },
              username: { type: "string" },
              avatar: { type: "string", nullable: true },
            },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
};
