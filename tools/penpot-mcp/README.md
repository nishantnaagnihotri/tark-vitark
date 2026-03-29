# Penpot MCP Bridge

This is a lightweight custom MCP server for interacting with Penpot through its HTTP API.

## What it provides

- `penpot_health_check`
- `penpot_api_request`

`penpot_api_request` is intentionally generic so you can call any Penpot endpoint supported by your deployment.

## Prerequisites

- Node.js 18+
- A reachable Penpot instance
- Optional bearer token (if your deployment requires it)

## Setup

1. Install dependencies:

```bash
cd tools/penpot-mcp
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# then edit .env
```

3. Run server:

```bash
npm start
```

## VS Code MCP config example

Add this to your MCP client configuration:

```json
{
  "mcpServers": {
    "penpot": {
      "command": "node",
      "args": ["/absolute/path/to/tark-vitark/tools/penpot-mcp/server.js"],
      "env": {
        "PENPOT_BASE_URL": "https://design.example.com",
        "PENPOT_TOKEN": "",
        "PENPOT_TIMEOUT_MS": "20000"
      }
    }
  }
}
```

## Example calls

Health check:

```json
{
  "name": "penpot_health_check",
  "arguments": {}
}
```

Generic API request:

```json
{
  "name": "penpot_api_request",
  "arguments": {
    "method": "GET",
    "path": "/api/rpc/command/get-profile"
  }
}
```

## Notes

- Penpot deployments differ by auth and endpoint exposure. Use `penpot_api_request` to match your environment.
- If your Penpot requires cookies/session auth instead of bearer token, add custom headers through the tool call.
