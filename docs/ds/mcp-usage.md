# Using MCP with Claude Code

Quick reference for using Model Context Protocol (MCP) servers with Claude Code.

---

## What is MCP?

MCP lets Claude Code connect to external tools and data sources. For this project, we use it to read Figma files directly.

---

## Figma MCP (On-Demand)

We use **Framelink MCP for Figma** — free, open-source, works with any Figma account.

### Prerequisites

1. Node.js (via nvm)
2. Figma Personal Access Token

### Get Your Figma Token

1. Go to Figma → Settings → Security → Personal access tokens
2. Click "Generate new token"
3. Enable **read** permissions for:
   - File content
   - Dev resources
4. Copy the token immediately (shown only once)

### Add MCP to Claude Code

**Project-only (recommended for this repo):**
```bash
cd /Users/sambonin/Desktop/Developer/Tenpo/tenpo
claude mcp add figma --scope local -- npx -y figma-developer-mcp --figma-api-key=YOUR_TOKEN --stdio
```

This stores config in `.claude.json` at the project root (gitignored). Only works in this repo, keeps your token out of git.

**Global (all projects):**
```bash
claude mcp add figma -- npx -y figma-developer-mcp --figma-api-key=YOUR_TOKEN --stdio
```

### Verify Connection

Inside a Claude Code session:
```
/mcp
```

### Use It

Once connected, Claude Code can:
- Read Figma file structure
- Extract colors, typography, spacing
- Get component dimensions and properties

Example prompt:
> "Read the Figma file at [URL] and extract all color tokens"

### Remove When Done

```bash
claude mcp remove figma
```

---

## Why Not the Official Figma MCP?

Figma's official hosted MCP (`https://mcp.figma.com/mcp`) limits free accounts to **6 tool calls per month**. Framelink uses the REST API with your personal token — no artificial limits beyond Figma's standard rate limits.

---

## Other MCP Servers

Claude Code supports many MCP servers. Common pattern:

```bash
# Add
claude mcp add <name> -- <command>

# List
claude mcp list

# Remove
claude mcp remove <name>
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Server not connected" | Run `/mcp` to check status, re-add if needed |
| "Invalid token" | Generate a new token in Figma settings |
| Rate limited | Wait a few minutes, Figma API has per-minute limits |
| npx hangs | Check Node is installed: `node --version` |

---

## Resources

- [Framelink Docs](https://www.framelink.ai/docs/quickstart)
- [Figma Personal Access Tokens](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)
- [Claude Code MCP Docs](https://docs.anthropic.com/en/docs/claude-code)
