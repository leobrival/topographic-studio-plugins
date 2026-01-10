---
name: convex-cli
description: Convex CLI expert for serverless backend and real-time database. Use when users need to deploy functions, manage environments, or import/export data.
---

# Convex CLI Guide

Convex is a serverless backend platform with a built-in real-time database. This guide provides essential workflows and quick references for common Convex operations.

## Quick Start

```bash
# Check CLI installation
convex --version

# Authenticate with Convex
convex login

# Initialize new project
convex init

# Start local development
convex dev

# Deploy to production
convex deploy

# View deployment status
convex deployments list
```

## Common Workflows

### Workflow 1: Local Development Setup

```bash
# Login and initialize
convex login
convex init

# Start dev server with hot reload
convex dev

# Dev server runs at http://localhost:3210
# Changes to functions auto-reload
# Dashboard shows data and logs in real-time
```

### Workflow 2: Develop and Deploy Functions

```bash
# Create function in convex/queries/ or convex/mutations/

# Test function locally
convex run queries/getUser --args '{"id": "123"}'

# Deploy to production
convex deploy --typecheck

# Monitor logs
convex logs --prod --follow
```

### Workflow 3: Environment Configuration

```bash
# Set API keys for current environment
convex env set API_KEY sk_test_123
convex env set DATABASE_URL postgres://...

# Set production secrets
convex env set SECRET_KEY value --prod

# List all variables
convex env list
```

### Workflow 4: Data Import & Export

```bash
# Export data before major changes
convex export --all --output backup.json

# Import seed data
convex import users seed-users.json

# Batch import multiple tables
convex import --all data/

# Backup production data
convex export --all --prod --output prod-backup.json
```

### Workflow 5: Debugging Production Issues

```bash
# Stream production logs
convex logs --prod --follow

# Filter logs by function
convex logs --function myFunction --level error

# Test function in production
convex run queries/getUser --args '{"id": "123"}' --prod

# View all function executions
convex dashboard --logs
```

## Decision Tree

**When to use which command:**

- **To start developing**: Use `convex dev` for local server with hot reload
- **To test functions locally**: Use `convex run function-name --args '...'`
- **To deploy code**: Use `convex deploy` with `--typecheck` and `--dry-run` first
- **To manage secrets**: Use `convex env set/get/list` commands
- **To backup data**: Use `convex export --all --output backup.json`
- **To restore data**: Use `convex import table-name file.json`
- **To view logs**: Use `convex logs --follow` for real-time monitoring
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex workflows**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Development Cycle

```bash
# 1. Start development
convex dev

# 2. Edit functions in convex/queries/, convex/mutations/

# 3. Test locally
convex run queries/myFunction --args '{"key": "value"}'

# 4. Type check and deploy
convex deploy --typecheck

# 5. Monitor
convex logs --prod --follow
```

### Safe Deployments

```bash
# Preview changes
convex deploy --dry-run

# Deploy with message
convex deploy --message "feat: added user authentication"

# Monitor after deploy
convex logs --prod --limit 50
```

### Environment Setup

```bash
# Development variables
convex env set NODE_ENV development
convex env set LOG_LEVEL debug

# Production variables
convex env set NODE_ENV production --prod
convex env set LOG_LEVEL error --prod

# Verify variables
convex env list
convex env list --prod
```

### Data Management

```bash
# Regular backups
convex export --all --output "backup-$(date +%Y-%m-%d).json"

# Seed data for testing
convex import users test-data/users.json

# Database migrations
convex export --all --output pre-migration.json
# Update schema.ts
convex deploy
# Verify with: convex run queries/checkSchema
```

## Troubleshooting

**Common Issues:**

1. **Dev server won't start**
   - Solution: Use `convex dev --clear-deployment` to reset state
   - See: [Development Server Issues](./reference/troubleshooting.md#development-server-issues)

2. **Function not found error**
   - Quick fix: Ensure function is exported and path is correct
   - See: [Function Not Found](./reference/troubleshooting.md#function-not-found-error)

3. **Environment variables not loading**
   - Quick fix: Run `convex env set KEY value` and redeploy
   - See: [Environment Variable Issues](./reference/troubleshooting.md#environment-variable-issues)

4. **Deployment fails with type errors**
   - Quick fix: Run `convex deploy --typecheck` to check types first
   - See: [Deployment Issues](./reference/troubleshooting.md#deployment-fails)

5. **Cannot access production data**
   - Quick fix: Use `--prod` flag with commands
   - See: [Access Issues](./reference/troubleshooting.md#project-configuration-issues)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any Convex command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for development, data management, deployment, team collaboration, monitoring, and CI/CD integration. Use for implementing specific workflows or integrations.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for authentication, development, deployment, functions, data, environment, and configuration issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing multi-environment setups, production configurations, or CI/CD pipelines
- Use **Troubleshooting** when dev server won't start, deployments fail, logs aren't showing, or you encounter permission/access/performance issues

## Resources

- Official Docs: https://docs.convex.dev
- Dashboard: https://dashboard.convex.dev
- API Reference: https://docs.convex.dev/api
- Community: https://discord.gg/convex
