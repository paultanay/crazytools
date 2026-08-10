# Model Context Protocol (MCP)

The [Model Context Protocol](https://modelcontextprotocol.io) is an open standard for connecting AI assistants to external tools and data sources. CrazyTools plans to expose its tool catalog over MCP so any MCP-compatible client (Claude Desktop, IDE plugins, agent frameworks) can drive the utilities programmatically.

Status: **planned for v1.1**. This document captures the design so external integrators can plan against it.

## Server surface (planned)

A single MCP server, mounted at `/api/public/mcp`, will expose:

- **Tools** — one MCP tool per catalog entry. `image-to-pdf`, `pdf-compress`, `pdf-merge`, `qr-generator`, `base64`, `markdown-to-pdf` are the initial candidates. `json-formatter` and `image-compress` remain browser-only for v1.1.
- **Resources** — none in v1.1 (tools are stateless).
- **Prompts** — a small library of pre-composed prompts for common flows ("merge these PDFs and compress the result").

## Transport

HTTP + Server-Sent Events, following the current MCP spec. Every request must include:

- `Authorization: Bearer <token>` — a scoped API token created in the user's dashboard.
- `Content-Type: application/json`.

## Authentication

Tokens are minted from the dashboard (roadmap: `/dashboard/tokens`). Each token:

- Is bound to a single user.
- Carries a scope list (`tools:run`, `tools:list`).
- Can be revoked at any time.
- Has a rotating suffix so leaked tokens can be attributed.

The server route verifies the token on every request using a constant-time comparison and looks up the owner via a service-role read of the `api_tokens` table (not yet created).

## Tool schema

Every MCP tool declares:

```jsonc
{
  "name": "pdf-compress",
  "description": "Compress a PDF, preserving text layer and metadata.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "pdf": { "type": "string", "format": "byte", "description": "Base64-encoded PDF" },
    },
    "required": ["pdf"],
  },
}
```

Output is always `{ "content": [{ "type": "resource", "resource": { "uri": "data:application/pdf;base64,..." } }] }`.

## Client examples (planned)

### Claude Desktop

```jsonc
{
  "mcpServers": {
    "crazytools": {
      "url": "https://crazytools.app/api/public/mcp",
      "headers": { "Authorization": "Bearer <token>" },
    },
  },
}
```

### Programmatic (TypeScript)

```ts
import { McpClient } from "@modelcontextprotocol/sdk/client";

const client = new McpClient({
  url: "https://crazytools.app/api/public/mcp",
  headers: { Authorization: `Bearer ${process.env.CRAZYTOOLS_TOKEN}` },
});

const out = await client.callTool("pdf-compress", { pdf: base64pdf });
```

## Rate limits (planned)

- 60 requests / minute / token.
- 20 MB / request body cap.
- 100 MB / hour / token throughput.

## Open questions

- Should tool runs be recorded in `tool_history` for MCP callers? (Currently: yes, for symmetry with the web UI.)
- Should we support streaming outputs for large PDFs? (Yes, once the SDK spec stabilizes.)
- Do we expose an admin-scoped tool for listing your own recent runs? (Roadmap.)

## Consuming other MCP servers

CrazyTools itself does not currently consume external MCP servers. If a future tool needs one (e.g., a translation utility calling out to an MCP LLM connector), it lives behind a `createServerFn`, never on the client.
