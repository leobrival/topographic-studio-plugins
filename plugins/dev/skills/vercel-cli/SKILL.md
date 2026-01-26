---
name: vercel-cli
description: Vercel CLI expert for serverless deployment. Use when users need to deploy apps, manage domains, env vars, or Vercel projects.
allowed-tools: Bash(vercel:*)
---

# Vercel CLI Guide

Vercel is a serverless platform for deploying, scaling, and managing web applications. This guide provides essential workflows and quick references for common Vercel operations.

## Quick Start

```bash
# Check Vercel CLI installation
vercel --version

# Authenticate with Vercel
vercel login

# Show current user
vercel whoami

# Link project to Vercel
vercel link

# Pull environment variables
vercel env pull .env.local
```

## Common Workflows

### Workflow 1: Initialize and Deploy Project

```bash
# Initialize new project
vercel init

# Or link existing project
vercel link

# Start local development
vercel dev

# Create preview deployment
vercel

# Deploy to production
vercel --prod
```

### Workflow 2: Manage Environment Variables

```bash
# List all environment variables
vercel env ls

# Add new variable
vercel env add API_KEY

# Pull variables to .env.local
vercel env pull .env.local

# Start dev with environment
vercel dev
```

### Workflow 3: Setup Custom Domain

```bash
# Add domain to project
vercel domains add example.com my-project

# Verify domain configuration
vercel domains inspect example.com

# Check DNS records
vercel dns ls example.com
```

### Workflow 4: Monitor Deployments

```bash
# List all deployments
vercel list

# View deployment logs
vercel logs https://my-app-xyz.vercel.app

# Follow logs in real-time
vercel logs --follow https://my-app-xyz.vercel.app

# Inspect deployment details
vercel inspect https://my-app-xyz.vercel.app
```

### Workflow 5: Rollback & Recovery

```bash
# View recent deployments
vercel list

# Rollback to previous version
vercel rollback https://my-app.vercel.app

# Redeploy if needed
vercel redeploy https://my-app.vercel.app
```

## Decision Tree

**When to use which command:**

- **To start local development**: Use `vercel dev`
- **To create preview deployment**: Use `vercel` (no flags)
- **To deploy to production**: Use `vercel --prod`
- **To manage environment variables**: Use `vercel env add/rm/ls`
- **To setup domains**: Use `vercel domains add/inspect`
- **To view deployment logs**: Use `vercel logs [url]`
- **To rollback deployment**: Use `vercel rollback [url]`
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex workflows**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Deployment Process

```bash
# 1. Setup environment variables
vercel env add API_KEY
vercel env add DATABASE_URL

# 2. Test locally
vercel dev

# 3. Create preview
vercel

# 4. Test preview URL
# ... verify at https://my-app-xyz.vercel.app ...

# 5. Promote to production
vercel promote https://my-app-xyz.vercel.app

# 6. Monitor production
vercel logs --follow https://my-app.vercel.app
```

### Team Collaboration

```bash
# Switch to team
vercel switch my-team

# Pull team project settings
vercel pull

# Deploy to team project
vercel --scope my-team --prod
```

### Multi-Region Deployment

```bash
# Deploy to multiple regions
vercel --regions sfo1,fra1,sin1

# In vercel.json:
{
  "regions": ["sfo1", "fra1"]
}
```

### CI/CD Automation

```bash
# Deploy via CI/CD pipeline
vercel --token $VERCEL_TOKEN --prod --yes

# Build and deploy
vercel build
vercel --prebuilt --token $VERCEL_TOKEN
```

## Troubleshooting

**Common Issues:**

1. **Cannot login**
   - Solution: Use token-based auth `vercel --token $TOKEN whoami`
   - See: [Authentication Issues](./reference/troubleshooting.md#cannot-login-to-vercel)

2. **Project not linked**
   - Quick fix: Run `vercel link` to link project
   - See: [Project Not Linked](./reference/troubleshooting.md#project-not-linked)

3. **Build fails during deployment**
   - Quick fix: Run `vercel build` locally to debug
   - See: [Build Failures](./reference/troubleshooting.md#deployment-fails-during-build)

4. **Deployment crashes after build**
   - Quick fix: Check logs with `vercel logs https://my-app.vercel.app`
   - See: [Runtime Issues](./reference/troubleshooting.md#application-crashes-after-deployment)

5. **Domain not resolving**
   - Quick fix: Update nameservers to Vercel's at domain registrar
   - See: [Domain Issues](./reference/troubleshooting.md#domain-not-resolving)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any Vercel command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for development, deployments, domains, environment management, debugging, team collaboration, and production setups. Use for implementing specific workflows or integrations.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for authentication, deployment, runtime, domain, git integration, and environment variable issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing deployment workflows, team setups, or production configurations
- Use **Troubleshooting** when deployments fail, apps crash, or services are unreachable

## Resources

- Official Docs: https://vercel.com/docs
- CLI Documentation: https://vercel.com/docs/cli
- Community: https://github.com/vercel/vercel/discussions
- Status: https://status.vercel.com
