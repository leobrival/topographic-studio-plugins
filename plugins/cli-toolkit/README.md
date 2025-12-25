# CLI Toolkit Plugin

Comprehensive CLI reference commands for popular development tools. Prefer CLI over MCP for cost optimization, performance, and reliability.

## Philosophy

**CLI over MCP** - This plugin provides direct CLI access instead of MCP wrappers because:

- Lower latency and faster execution
- No token overhead for API communication
- More reliable with fewer points of failure
- Full control over commands and options

## Available Commands

| Command | Tool | Description |
|---------|------|-------------|
| `/github-cli` | `gh` | GitHub repos, issues, PRs, Actions |
| `/docker-cli` | `docker` | Containers, images, compose |
| `/vercel-cli` | `vercel` | Serverless deployments |
| `/railway-cli` | `railway` | Cloud deployments |
| `/neon-cli` | `neonctl` | Serverless Postgres |
| `/convex-cli` | `convex` | Backend-as-a-service |
| `/playwright-cli` | `playwright` | Browser testing |
| `/lighthouse-cli` | `lighthouse` | Performance auditing |
| `/nextjs-cli` | `next` | Next.js development |
| `/adonisjs-cli` | `node ace` | AdonisJS framework |
| `/raycast-cli` | `raycast` | Raycast extensions |
| `/coolify-cli` | `coolify` | Self-hosted PaaS |
| `/things3-cli` | `things3` | Task management (macOS) |

## Installation

```bash
# Add marketplace
/plugin marketplace add leobrival/topographic-studio-plugins

# Install cli-toolkit
/plugin install cli-toolkit@topographic-studio-plugins
```

## Usage

Each command provides a complete cheat-sheet for the respective CLI tool:

```bash
# Get GitHub CLI reference
/github-cli

# Get Docker CLI reference
/docker-cli

# Get Vercel CLI reference
/vercel-cli
```

## Command Coverage

### GitHub CLI (`/github-cli`)

- Authentication (`gh auth`)
- Repositories (`gh repo`)
- Issues (`gh issue`)
- Pull Requests (`gh pr`)
- GitHub Actions (`gh run`, `gh workflow`)
- Secrets & Variables (`gh secret`, `gh variable`)
- Search (`gh search`)

### Docker CLI (`/docker-cli`)

- Container management
- Image building
- Docker Compose
- Volumes and networks
- Registry operations

### Vercel CLI (`/vercel-cli`)

- Project deployment
- Environment variables
- Domain management
- Serverless functions

### Railway CLI (`/railway-cli`)

- Project creation
- Service management
- Database provisioning
- Environment configuration

### Neon CLI (`/neon-cli`)

- Database creation
- Branch management
- Connection strings
- Compute scaling

### Playwright CLI (`/playwright-cli`)

- Test generation
- Browser installation
- Test execution
- Debugging tools

### Lighthouse CLI (`/lighthouse-cli`)

- Performance audits
- Accessibility checks
- SEO analysis
- PWA validation

## Dependencies

All dependencies are optional - install only what you need:

```bash
# GitHub
brew install gh

# Docker
brew install --cask docker

# Node.js tools
npm install -g vercel
npm install -g @railway/cli
npm install -g neonctl
npm install -g lighthouse

# Project-level
npm install convex
npm install -D @playwright/test
```

## Why CLI over MCP?

| Aspect | CLI | MCP |
|--------|-----|-----|
| Latency | Low | Higher (API calls) |
| Token cost | None | Uses tokens |
| Reliability | Direct execution | Depends on server |
| Flexibility | Full options | Limited to exposed tools |
| Offline | Works offline | Requires connection |

## License

MIT
