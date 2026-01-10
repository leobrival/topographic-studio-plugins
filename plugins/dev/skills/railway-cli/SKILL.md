---
name: railway-cli
description: Railway CLI expert for deployment. Use when users need to deploy apps, manage databases, configure Railway projects, or manage environments.
---

# Railway CLI Guide

Railway is a deployment platform that simplifies deploying and managing web applications, databases, and services. This guide provides essential workflows and quick references for common Railway operations.

## Quick Start

```bash
# Check Railway CLI installation
railway --version

# Authenticate with Railway
railway login

# Create and initialize new project
railway init my-app

# Add a database
railway add --database postgres

# Deploy application
railway up

# View logs in real-time
railway logs --follow
```

## Common Workflows

### Workflow 1: Deploy New Application

```bash
# Initialize project
railway init my-project

# Configure environment variables
railway variables set NODE_ENV=production
railway variables set PORT=3000

# Add database if needed
railway add --database postgres

# Deploy
railway up

# Verify deployment
railway logs --follow
railway status
```

### Workflow 2: Link Existing Project & Deploy

```bash
# Link to existing Railway project
railway link

# Review current status
railway status

# Update environment variables
railway variables set API_KEY=new-value

# Redeploy with changes
railway redeploy

# Follow logs
railway logs --follow
```

### Workflow 3: Multi-Environment Setup

```bash
# Create staging environment
railway environment new staging

# Switch to staging
railway environment use staging

# Configure staging-specific variables
railway variables set LOG_LEVEL=debug

# Deploy to staging
railway deploy

# Switch to production
railway environment use production

# Deploy to production
railway deploy
```

### Workflow 4: Database Management

```bash
# Add PostgreSQL
railway add --database postgres

# Connect to database
railway connect postgres

# Set database variables in application
railway variables set DATABASE_URL=$(railway variables get DATABASE_URL)

# Run migrations
railway run npm run migrate

# Verify connection
railway ssh --command "psql $DATABASE_URL -c 'SELECT 1'"
```

### Workflow 5: Debugging Deployment Issues

```bash
# Check deployment status
railway status

# View all logs
railway logs --tail 100

# SSH into service for inspection
railway ssh

# Run diagnostic commands
railway ssh --command "ps aux"
railway ssh --command "df -h"

# Check resource usage
railway open  # View in dashboard
```

## Decision Tree

**When to use which command:**

- **To create new project**: Use `railway init`
- **To link to existing project**: Use `railway link`
- **To deploy changes**: Use `railway up` or `railway deploy`
- **To add database/service**: Use `railway add`
- **To check status**: Use `railway status`
- **To view logs**: Use `railway logs --follow`
- **To access service shell**: Use `railway ssh`
- **To manage environments**: Use `railway environment`
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex scenarios**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Project Setup and Deployment

```bash
# New project workflow
railway login
railway init my-app
railway add --database postgres
railway variables set NODE_ENV=production
railway up
```

### Environment Variables Management

```bash
# Set variables
railway variables set KEY1=value1 KEY2=value2

# Get specific variable
railway variables get DATABASE_URL

# Import from .env
railway variables set --from-file .env

# Use variables in commands
railway run npm start
```

### Database Operations

```bash
# Add database
railway add --database postgres

# Connect interactively
railway connect postgres

# Run SQL commands
railway ssh --command "psql $DATABASE_URL -c 'CREATE TABLE users (...)'"

# Run migrations
railway run npm run migrate
```

### Service Communication

```bash
# Services on same environment communicate by name
railway variables set API_URL=http://api-service:3000

# Within application, use service name as hostname
fetch('http://api-service:3000/endpoint')
```

## Troubleshooting

**Common Issues:**

1. **Deployment fails to start**
   - Solution: Check logs with `railway logs --tail 50`
   - See: [Deployment Issues](./reference/troubleshooting.md#deployment-issues)

2. **Cannot connect to database**
   - Quick fix: Verify database URL with `railway variables get DATABASE_URL`
   - See: [Service Connection Issues](./reference/troubleshooting.md#service-connection-issues)

3. **Environment variables not loading**
   - Quick fix: Redeploy with `railway redeploy` after setting variables
   - See: [Variable Issues](./reference/troubleshooting.md#environment-variable-issues)

4. **Service unreachable after deployment**
   - Quick fix: Verify with `railway ssh --command "curl http://localhost:3000"`
   - See: [Connection Issues](./reference/troubleshooting.md#application-starts-but-service-unreachable)

5. **SSH or access failing**
   - Quick fix: Ensure service is healthy with `railway status`
   - See: [SSH Issues](./reference/troubleshooting.md#ssh-and-access-issues)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any Railway command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for development, multi-environment setups, database management, CI/CD integration, monitoring, and backup strategies. Use for implementing specific workflows or deployments.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for deployments, databases, environments, domains, resources, and access issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing multi-environment setups, CI/CD pipelines, or database workflows
- Use **Troubleshooting** when deployments fail, services are unreachable, or you encounter connection/resource issues

## Resources

- Official Docs: https://docs.railway.app
- Dashboard: https://railway.app/dashboard
- GitHub: https://github.com/railwayapp
- Community: https://railway.app/community
