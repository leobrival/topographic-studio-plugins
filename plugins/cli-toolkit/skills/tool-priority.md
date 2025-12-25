---
description: Comprehensive tool selection guide - CLI over Bash over MCP for optimal performance, cost, and reliability
---

# Tool Selection Priority

**CRITICAL RULE:** Always prefer CLI over MCP unless explicitly requested otherwise.

This guide defines the strict hierarchy for tool selection in Claude Code workflows.

## The Golden Rule

```
┌─────────────────────────────────────────────────────────┐
│                    PRIORITY ORDER                        │
├─────────────────────────────────────────────────────────┤
│  1. Native CLI tools (gh, docker, vercel, neonctl...)   │
│  2. Bash commands and Unix tools (curl, jq, grep...)    │
│  3. MCP servers (ONLY when no alternative exists)       │
└─────────────────────────────────────────────────────────┘
```

## Why This Matters

### Performance Comparison

| Metric | CLI | Bash | MCP |
|--------|-----|------|-----|
| Latency | ~10-100ms | ~10-50ms | ~500-2000ms |
| Token cost | 0 | 0 | 50-1000+ tokens |
| Reliability | 99.9% | 99.9% | 95-99% |
| Offline capable | Yes | Yes | No |
| Full options | Yes | Yes | Limited |
| Error clarity | Native | Native | Wrapped |

### Token Cost Analysis

Every MCP call consumes tokens for:

- Request serialization
- Response parsing
- Context maintenance
- Error handling

**Real-world token costs:**

| Operation | CLI Cost | MCP Cost | Savings |
|-----------|----------|----------|---------|
| List GitHub issues | 0 | ~150 tokens | 100% |
| Create PR | 0 | ~300 tokens | 100% |
| Deploy to Vercel | 0 | ~500 tokens | 100% |
| Docker build | 0 | ~400 tokens | 100% |
| Database query | 0 | ~200 tokens | 100% |
| 10 operations/session | 0 | ~3000 tokens | 100% |

**Monthly impact (heavy usage):**

- 50 sessions x 10 operations = 500 operations
- MCP: ~150,000 tokens wasted
- CLI: 0 tokens

## Decision Framework

### Step 1: Check for Native CLI

```
Task needed? → CLI exists? → Use CLI
     ↓              ↓
  GitHub       →   gh
  Docker       →   docker
  Vercel       →   vercel
  Railway      →   railway
  Neon         →   neonctl
  Convex       →   npx convex
  Playwright   →   npx playwright
  Lighthouse   →   lighthouse
  Next.js      →   next
  AdonisJS     →   node ace
  Coolify      →   coolify
  Raycast      →   raycast
```

### Step 2: Check for Bash Alternative

If no dedicated CLI exists:

```bash
# HTTP requests
curl -X GET https://api.example.com/data | jq .

# File operations
find . -name "*.ts" | xargs grep "pattern"

# JSON processing
cat config.json | jq '.key.nested'

# Text processing
awk, sed, grep, cut, sort, uniq

# System info
uname, df, ps, top, lsof
```

### Step 3: Use MCP Only If Required

MCP is acceptable ONLY when:

1. **User explicitly requests it**

   ```
   User: "Use the Notion MCP to create a page"
   → OK to use MCP
   ```

2. **No CLI alternative exists**

   ```
   Figma design tokens → No CLI → Use Figma MCP
   Notion databases → No CLI → Use Notion MCP
   ```

3. **MCP provides unique value**

   ```
   Chrome DevTools → Live browser interaction
   Context7 → Real-time library docs
   ```

## Complete CLI Reference

### GitHub CLI (`gh`)

**Instead of GitHub API/MCP:**

```bash
# Authentication
gh auth login
gh auth status

# Repositories
gh repo create my-project
gh repo clone owner/repo
gh repo list --limit 10
gh repo view --web

# Issues
gh issue create --title "Bug" --body "Description"
gh issue list --assignee @me
gh issue view 123
gh issue close 123 --comment "Fixed"

# Pull Requests
gh pr create --title "Feature" --body "Changes"
gh pr list --state all
gh pr checkout 123
gh pr merge 123 --squash
gh pr review 123 --approve

# Actions
gh run list --workflow=ci.yml
gh run view 123456 --log
gh run rerun 123456 --failed
gh workflow run deploy.yml

# Secrets
gh secret set API_KEY
gh secret list

# Search
gh search repos "machine learning" --language=python
gh search issues "bug" --repo=owner/repo
```

### Docker CLI (`docker`)

**Instead of Docker API:**

```bash
# Containers
docker run -d -p 8080:80 nginx
docker ps -a
docker exec -it container_name bash
docker logs -f container_name
docker stop container_name
docker rm container_name

# Images
docker build -t myapp:latest .
docker images
docker pull ubuntu:22.04
docker push myregistry/myapp:v1
docker rmi image_name

# Compose
docker compose up -d
docker compose down
docker compose logs -f
docker compose exec service_name bash

# System
docker system df
docker system prune -a
docker stats
```

### Vercel CLI (`vercel`)

**Instead of Vercel API:**

```bash
# Deployment
vercel                    # Preview
vercel --prod             # Production
vercel --prebuilt

# Projects
vercel project ls
vercel link
vercel env pull .env.local

# Domains
vercel domains ls
vercel domains add example.com

# Logs & Debug
vercel logs
vercel dev
vercel inspect
```

### Railway CLI (`railway`)

**Instead of Railway API:**

```bash
# Projects
railway init
railway link
railway status

# Deployment
railway up
railway logs

# Services
railway service
railway variables

# Database
railway connect postgres
```

### Neon CLI (`neonctl`)

**Instead of Neon API:**

```bash
# Projects
neonctl projects list
neonctl projects create --name mydb

# Branches
neonctl branches list
neonctl branches create --name feature-branch

# Connection
neonctl connection-string
neonctl connection-string --branch feature-branch

# Databases
neonctl databases list
neonctl databases create --name mydb
```

### Other CLIs

```bash
# Convex
npx convex dev
npx convex deploy
npx convex import
npx convex export

# Playwright
npx playwright test
npx playwright codegen
npx playwright show-report

# Lighthouse
lighthouse https://example.com --output html
lighthouse https://example.com --preset desktop

# Next.js
next dev
next build
next start
next lint
```

## MCP Usage: Exceptions Only

### Acceptable MCP Use Cases

#### 1. Chrome DevTools MCP (Browser Automation)

**Why:** No CLI can interact with live browser sessions.

```
mcp__chrome-devtools__navigate_page     → Navigate to URL
mcp__chrome-devtools__take_snapshot     → Get a11y tree
mcp__chrome-devtools__take_screenshot   → Capture visual
mcp__chrome-devtools__click             → Click element
mcp__chrome-devtools__fill              → Fill input
mcp__chrome-devtools__list_console_messages → Check errors
mcp__chrome-devtools__list_network_requests → Verify API
```

**Use for:**

- UI testing after implementation
- Visual verification
- Form interaction testing
- Console error checking

#### 2. Context7 MCP (Documentation)

**Why:** Real-time library documentation lookup.

```
mcp__context7__resolve-library-id  → Find library ID
mcp__context7__get-library-docs    → Get documentation
```

**Use for:**

- Looking up current API docs
- Finding code examples
- Checking library versions

#### 3. Service-Specific MCPs (No CLI Alternative)

| MCP | Use Case | Why MCP |
|-----|----------|---------|
| Notion | Page/database operations | No official CLI |
| Figma | Design token extraction | No official CLI |
| Tally | Form management | No official CLI |
| n8n | Workflow automation | API-first platform |
| Hostinger | Hosting management | Proprietary API |

### Never Use MCP For

| Task | Wrong | Right |
|------|-------|-------|
| GitHub issues | GitHub MCP | `gh issue list` |
| Docker containers | Docker MCP | `docker ps` |
| Vercel deploy | Vercel MCP | `vercel --prod` |
| Database queries | DB MCP | `neonctl` or `psql` |
| File operations | Any MCP | `cat`, `grep`, `find` |
| HTTP requests | Any MCP | `curl` |

## Workflow Examples

### Example 1: Deploy New Feature

```bash
# WRONG (MCP-heavy)
1. Use GitHub MCP to create branch
2. Use GitHub MCP to create PR
3. Use Vercel MCP to deploy
4. Use GitHub MCP to merge

# RIGHT (CLI-first)
1. git checkout -b feature/new-thing
2. git push -u origin feature/new-thing
3. gh pr create --title "Add new feature"
4. vercel --prod
5. gh pr merge --squash
```

### Example 2: Debug Production Issue

```bash
# WRONG
1. Use Vercel MCP to get logs
2. Use GitHub MCP to find related issues

# RIGHT
1. vercel logs --follow
2. gh issue list --label bug
3. gh run list --status=failure
```

### Example 3: Database Migration

```bash
# WRONG
1. Use Neon MCP to create branch
2. Use Neon MCP to run migration

# RIGHT
1. neonctl branches create --name migration-test
2. neonctl connection-string --branch migration-test
3. psql $CONNECTION_STRING -f migration.sql
```

### Example 4: UI Testing (MCP Acceptable)

```bash
# This is correct - no CLI alternative
1. mcp__chrome-devtools__navigate_page → localhost:3000
2. mcp__chrome-devtools__take_snapshot → Verify structure
3. mcp__chrome-devtools__click → Test button
4. mcp__chrome-devtools__list_console_messages → Check errors
```

## CLI Reference Commands

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
/nextjs-cli     # Next.js CLI reference
/adonisjs-cli   # AdonisJS CLI reference
/coolify-cli    # Coolify CLI reference
/raycast-cli    # Raycast CLI reference
/things3-cli    # Things 3 CLI reference
```

## Quick Reference Card

### Always CLI

| Need | Command |
|------|---------|
| GitHub anything | `gh ...` |
| Docker anything | `docker ...` |
| Deploy Vercel | `vercel --prod` |
| Deploy Railway | `railway up` |
| Database Neon | `neonctl ...` |
| HTTP request | `curl ...` |
| JSON process | `jq ...` |
| File search | `find ...` / `grep ...` |

### MCP Exceptions

| Need | MCP |
|------|-----|
| Browser testing | chrome-devtools |
| Live docs lookup | context7 |
| Notion operations | notion |
| Figma tokens | figma |
| n8n workflows | n8n |

## Enforcement Checklist

Before every tool choice:

- [ ] Is there a native CLI for this? → Use CLI
- [ ] Can Bash/curl/jq do this? → Use Bash
- [ ] Did user explicitly request MCP? → OK to use MCP
- [ ] Does MCP provide unique value? → OK to use MCP
- [ ] Is this browser automation? → Use Chrome DevTools MCP
- [ ] Is this live docs lookup? → Use Context7 MCP

## Summary

```
┌────────────────────────────────────────┐
│           TOOL PRIORITY                │
├────────────────────────────────────────┤
│  CLI  →  Always first choice           │
│  Bash →  When no dedicated CLI         │
│  MCP  →  Only for browser/docs/no-CLI  │
└────────────────────────────────────────┘

Cost:     CLI = 0    |  MCP = expensive
Speed:    CLI = fast |  MCP = slow
Reliable: CLI = yes  |  MCP = depends

When in doubt, use CLI.
```
