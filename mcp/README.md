# HookSniff MCP Server

MCP (Model Context Protocol) server that allows AI agents to manage HookSniff webhooks.

## Supported Agents

| Agent | Status | Setup |
|-------|--------|-------|
| Claude Desktop | ✅ | See below |
| Cursor | ✅ | See below |
| Windsurf | ✅ | Same as Cursor |
| Cline | ✅ | Same as Cursor |
| Continue | ✅ | See below |

## Quick Start

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "hooksniff": {
      "command": "npx",
      "args": ["-y", "@hooksniff/mcp-server"],
      "env": {
        "HOOKSNIFF_API_KEY": "hr_live_your_api_key_here"
      }
    }
  }
}
```

### Cursor / Windsurf / Cline

Add to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "hooksniff": {
      "command": "npx",
      "args": ["-y", "@hooksniff/mcp-server"],
      "env": {
        "HOOKSNIFF_API_KEY": "hr_live_your_api_key_here"
      }
    }
  }
}
```

### Continue (VS Code)

Add to `~/.continue/config.json`:

```json
{
  "mcpServers": {
    "hooksniff": {
      "command": "npx",
      "args": ["-y", "@hooksniff/mcp-server"],
      "env": {
        "HOOKSNIFF_API_KEY": "hr_live_your_api_key_here"
      }
    }
  }
}
```

### Self-Hosted HookSniff

If you're running your own HookSniff instance:

```json
{
  "mcpServers": {
    "hooksniff": {
      "command": "npx",
      "args": ["-y", "@hooksniff/mcp-server"],
      "env": {
        "HOOKSNIFF_API_KEY": "hr_live_your_api_key_here",
        "HOOKSNIFF_BASE_URL": "https://hooksniff.yourcompany.com/v1"
      }
    }
  }
}
```

## Available Tools

Once connected, your AI agent can use these tools:

| Tool | Description |
|------|-------------|
| `list_endpoints` | List all webhook endpoints |
| `create_endpoint` | Create a new endpoint |
| `delete_endpoint` | Delete an endpoint |
| `send_webhook` | Send a webhook to an endpoint |
| `list_deliveries` | List recent deliveries |
| `get_delivery` | Get delivery details with attempts |
| `replay_delivery` | Replay a failed delivery |
| `get_stats` | Get delivery statistics |
| `list_api_keys` | List API keys |
| `create_api_key` | Create a new API key |

## Example Prompts

Once the MCP server is connected, you can ask your AI agent:

- "List my HookSniff endpoints"
- "Create a webhook endpoint for my production server"
- "Send a test webhook to my endpoint"
- "Show me failed webhook deliveries"
- "Replay the last failed delivery"
- "What's my webhook success rate?"
- "Create a new API key for my CI pipeline"

## Local Development

```bash
cd mcp
npm install
HOOKSNIFF_API_KEY=hr_live_xxx node index.js
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HOOKSNIFF_API_KEY` | ✅ | — | Your HookSniff API key |
| `HOOKSNIFF_BASE_URL` | ❌ | `https://api.hooksniff.dev/v1` | API base URL |

## License

MIT
