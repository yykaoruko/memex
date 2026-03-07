# memex
![memex-banner](./banner.png)   
  
Personal knowledge base used as a shared dataset across AI agents.

## Structure

```
master-dataset/
├── schema/      # Shared type definitions referenced by module schemas
├── core/        # Personal facts that are not domain-specific
├── modules/     # Domain facts — objective, structured, schema-validated
├── views/       # Domain views — subjective prose maintained by AI agents
└── exports/     # Deliverables — composed outputs for a specific purpose
```

### `schema/`

Cross-domain shared type definitions (e.g. `period`, `tags`). Module schemas
reference these via `$ref` to avoid duplication.

### `core/`

Personal identity and preferences that apply across all domains — name, languages,
timezone, communication style, etc. Agents load this as baseline context regardless
of the task.

### `modules/`

Structured factual data organized by domain (e.g. `career`, `health`, `finance`).
Each domain directory contains JSON files validated against a local `schema.json`.
This is the objective ground truth agents read from.

See each module's README for domain-specific detail.

### `views/`

Subjective, prose-form content organized by domain. Written or maintained by AI
agents as reusable building blocks — self-introductions, motivations, STAR stories,
goals. Views interpret the facts in `modules/` but are not validated against a schema.

### `exports/`

One-off deliverables produced by agents for a specific purpose — a tailored CV,
a cover letter, an interview script. Not intended to be reused directly.

---

## Agent setup

This repository exposes its contents as a local MCP (Model Context Protocol) server
backed by `@modelcontextprotocol/server-filesystem`.

### Prerequisites

Run once after cloning:

```bash
npm install
```

To prevent agents from accidentally pushing changes to the remote, disable push:

```bash
git remote set-url --push origin no_push
```

---

## Setup for Cursor

### 1. Configure

Open (or create) `~/.cursor/mcp.json` and add the entry below, replacing
`/absolute/path/to/memex` with the actual path to this repository:

```json
{
  "mcpServers": {
    "memex": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/absolute/path/to/memex"
    }
  }
}
```

### 2. Verify

Restart Cursor (or reload via **Settings → MCP**). You should see `memex` listed
as an active server.

---

## Setup for Gemini CLI

### 1. Configure

Add the server to `~/.gemini/settings.json` (user-wide) or `.gemini/settings.json`
inside any project (project-scoped), replacing `/absolute/path/to/memex` with the
actual path to this repository:

```json
{
  "mcpServers": {
    "memex": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/absolute/path/to/memex"
    }
  }
}
```

### 2. Verify

Start Gemini CLI and run `/mcp list` — `memex` should appear with its available
tools. Run `/mcp refresh` if tools do not appear immediately.

---

## Setup for Claude Desktop

### 1. Configure

Open (or create) the config file for your OS and add the entry below, replacing
`/absolute/path/to/memex` with the actual path to this repository:

| OS | Config file path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "memex": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "/absolute/path/to/memex"
    }
  }
}
```

### 2. Verify

Fully quit and restart Claude Desktop (`Cmd+Q` on macOS, then reopen). The MCP server
is only loaded at startup. You should see a hammer icon in the chat input area
indicating tools are available.

---

## Setup for ChatGPT Desktop

> **Current limitation:** The ChatGPT desktop app does not support local stdio MCP
> servers. Only remote HTTPS endpoints are supported.

> **Security warning:** Exposing this server via a public tunnel makes your personal
> knowledge base reachable over the internet for as long as the tunnel is open. Anyone
> with the URL can read — and potentially write — every file in this repository. If
> you go this route:
> - Keep the tunnel open only while actively using it; shut it down immediately after.
> - Use ngrok's [IP allowlist](https://ngrok.com/docs/cloud-edge/ip-restrictions/) or
>   Cloudflare Tunnel's [Access policies](https://developers.cloudflare.com/cloudflare-one/policies/access/)
>   to restrict who can reach the endpoint.
> - Never commit credentials or secrets into this repository while a tunnel is active.
> - Prefer Cloudflare Tunnel over ngrok for persistent use — it supports authentication
>   policies without a paid ngrok plan.

To connect this repository to ChatGPT you would need to:

1. Wrap the server with an HTTP transport and expose it over HTTPS (e.g. via
   [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)).
2. Enable developer mode: **Settings → Apps → Advanced Settings → Developer mode**
   (available on Plus, Pro, Business, Enterprise, and Edu plans).
3. Register the public endpoint under **Settings → Apps → Create**.

This is significantly more involved than the other setups. Come back to this once the
other integrations are stable.

---

## Design principles

- **Facts and views are separate.** `modules/` holds what is objectively true.
  `views/` holds how those facts are interpreted or communicated.
- **Schemas live with their data.** Each module owns its `schema.json`.
  Only truly shared types live in `schema/`.
- **Agents read, humans maintain facts.** Data in `modules/` and `core/` is
  human-maintained. Data in `views/` and `exports/` is agent-generated.
