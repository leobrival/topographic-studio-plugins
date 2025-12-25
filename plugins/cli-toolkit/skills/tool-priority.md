---
description: Tool selection priority guide - CLI over Bash over MCP for optimal performance and cost
---

# Tool Selection Priority

When choosing between CLI tools, Bash commands, and MCP servers, follow this priority order for optimal performance, cost, and reliability.

## Priority Order

```
1. Native CLI tools (gh, docker, vercel, neonctl, railway, etc.)
2. Bash commands and standard Unix tools
3. MCP servers (only when necessary or explicitly requested)
```

## Why CLI First?

| Aspect | CLI | MCP |
|--------|-----|-----|
| **Latency** | Low - direct execution | Higher - API round-trips |
| **Token cost** | None | Consumes tokens for communication |
| **Reliability** | Direct execution | Depends on server availability |
| **Flexibility** | Full command options | Limited to exposed tools |
| **Offline** | Works offline | Requires connection |
| **Error handling** | Native shell errors | Wrapped/transformed errors |

## Decision Framework

### Use Native CLI when:

- A dedicated CLI tool exists for the service (gh, docker, vercel, railway, neonctl)
- You need full control over command options and flags
- Performance and speed are important
- You want predictable, direct execution
- Working offline or with limited connectivity

### Use Bash commands when:

- No dedicated CLI exists
- Simple file/system operations
- Chaining multiple operations with pipes
- Standard Unix tools suffice (curl, jq, grep, etc.)

### Use MCP servers ONLY when:

- User explicitly requests MCP usage
- CLI alternative does not exist or is insufficient
- MCP provides unique functionality not available via CLI
- Browser automation required (Chrome DevTools MCP)
- Real-time documentation lookup needed (Context7 MCP)

## Examples

### GitHub Operations

```bash
# PREFERRED: Use gh CLI
gh issue list --assignee @me
gh pr create --title "Fix bug" --body "Description"
gh run list --status=failure

# AVOID: Using MCP wrapper when CLI available
```

### Docker Operations

```bash
# PREFERRED: Use docker CLI
docker ps -a
docker build -t myapp:latest .
docker compose up -d

# AVOID: External API calls when local CLI works
```

### Database Operations

```bash
# PREFERRED: Use neonctl CLI
neonctl branches list
neonctl connection-string

# AVOID: MCP when CLI provides same functionality
```

### Deployment

```bash
# PREFERRED: Use platform CLI
vercel --prod
railway up
coolify deploy

# AVOID: API calls when CLI is more reliable
```

## When MCP is Appropriate

### Browser Automation (Chrome DevTools MCP)

```
mcp__chrome-devtools__navigate_page
mcp__chrome-devtools__take_screenshot
mcp__chrome-devtools__click
```

Use for: UI testing, visual verification, browser interactions

### Documentation Lookup (Context7 MCP)

```
mcp__context7__resolve-library-id
mcp__context7__get-library-docs
```

Use for: Real-time library documentation, API references

### External Service Integration

Use MCP when the service has no CLI but provides MCP server:
- Notion MCP
- Figma MCP
- Custom internal MCPs

## Cost Analysis

| Operation | CLI Cost | MCP Cost |
|-----------|----------|----------|
| List repos | 0 tokens | ~100-500 tokens |
| Create PR | 0 tokens | ~200-800 tokens |
| Deploy | 0 tokens | ~300-1000 tokens |
| Check status | 0 tokens | ~50-200 tokens |

**Rule of thumb**: Each MCP call costs tokens for request/response serialization. CLI calls are free.

## Implementation Checklist

Before using MCP, verify:

- [ ] No native CLI exists for this operation
- [ ] User explicitly requested MCP
- [ ] MCP provides unique value over CLI
- [ ] Performance impact is acceptable
- [ ] Token cost is justified

## Available CLI Tools

Use these CLI commands instead of MCP equivalents:

| CLI | Command | Use Instead Of |
|-----|---------|----------------|
| GitHub | `gh` | GitHub API/MCP |
| Docker | `docker` | Docker API |
| Vercel | `vercel` | Vercel API |
| Railway | `railway` | Railway API |
| Neon | `neonctl` | Neon API |
| Convex | `npx convex` | Convex API |
| Playwright | `npx playwright` | Browser automation |
| Lighthouse | `lighthouse` | Performance API |
| Things 3 | AppleScript | Task management |

### CLI Reference Commands

Use these commands to get full CLI documentation:

```bash
/github-cli     # GitHub CLI reference
/docker-cli     # Docker CLI reference
/vercel-cli     # Vercel CLI reference
/railway-cli    # Railway CLI reference
/neon-cli       # Neon CLI reference
/convex-cli     # Convex CLI reference
/playwright-cli # Playwright CLI reference
/lighthouse-cli # Lighthouse CLI reference
```

## Configured MCP Servers

These MCPs provide unique functionality not available via CLI:

| MCP | Purpose | When to Use |
|-----|---------|-------------|
| context7 | Library documentation | Real-time API docs lookup |
| chrome-devtools | Browser automation | UI testing, screenshots |
| hostinger-api | Hosting management | Hostinger-specific operations |
| notion | Notion workspace | Note-taking, databases |
| figma | Design system | Design token extraction |
| n8n | Workflow automation | N8N workflow management |
| tally | Form management | Tally forms |

## Summary

```
CLI > Bash > MCP

Use CLI first. Always.
Use Bash for glue operations.
Use MCP only when no alternative exists.
```

## Quick Decision

```
Need GitHub operation? → gh CLI
Need Docker operation? → docker CLI
Need deployment? → vercel/railway CLI
Need database? → neonctl CLI
Need browser test? → Chrome DevTools MCP (exception)
Need live docs? → Context7 MCP (exception)
```
