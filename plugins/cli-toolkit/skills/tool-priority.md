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

## Summary

```
CLI > Bash > MCP

Use CLI first. Always.
Use Bash for glue operations.
Use MCP only when no alternative exists.
```
