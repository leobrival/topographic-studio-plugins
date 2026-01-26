---
name: coolify-api
description: Coolify API expert for self-hosted PaaS management. Use when users need to deploy apps, manage databases, or configure servers on Coolify.
allowed-tools: Bash(curl:*), WebFetch
---

# Coolify API Guide

Coolify is a self-hosted Platform-as-a-Service (PaaS) that simplifies deploying applications, databases, and services. This guide provides essential workflows and quick references for managing Coolify via REST API.

## Quick Start

```bash
# Set environment variables
export COOLIFY_URL="http://your-coolify-ip:8000"
export COOLIFY_TOKEN="your-api-token"

# Test authentication
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# Check system health
curl "$COOLIFY_URL/api/health"

# List all applications
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications"

# List all servers
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers"
```

**Authentication Setup:**
1. Navigate to **Keys & Tokens** > **API tokens** in Coolify dashboard
2. Click **Create New Token** and copy it (shown only once)
3. Set permissions: **Read-only** or **Sensitive data** access

## Common Workflows

### Workflow 1: Deploy Public GitHub Repository

```bash
# Complete deployment workflow

# 1. Create project
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "my-project"}' \
     "$COOLIFY_URL/api/v1/projects"

# 2. Deploy application
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "public",
       "name": "my-app",
       "git_repository": "https://github.com/user/repo",
       "git_branch": "main",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"

# 3. Add environment variables
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key": "NODE_ENV", "value": "production"}' \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/environment-variables"

# 4. Start application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/start"

# 5. Check logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/logs"
```

### Workflow 2: Deploy Private Repository with GitHub App

```bash
# Deploy from private repository using GitHub App

# 1. Register GitHub App
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-github-app",
       "app_id": 123456,
       "installation_id": 654321,
       "client_id": "client-id",
       "client_secret": "client-secret",
       "private_key": "-----BEGIN RSA PRIVATE KEY-----\n..."
     }' \
     "$COOLIFY_URL/api/v1/github-apps"

# 2. Create application with GitHub App
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "private-gh-app",
       "name": "my-private-app",
       "github_app_uuid": "gh-app-uuid",
       "git_repository": "user/private-repo",
       "git_branch": "main",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

### Workflow 3: Deploy PostgreSQL Database with Backups

```bash
# Create database with automated backup configuration

# 1. Create PostgreSQL database
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "postgresql",
       "name": "production-db",
       "postgres_user": "app",
       "postgres_password": "secure-password",
       "postgres_db": "myapp"
     }' \
     "$COOLIFY_URL/api/v1/databases"

# 2. Configure daily backups at 2 AM, keep 14 days
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": true,
       "frequency": "0 2 * * *",
       "number_of_backups_to_keep": 14
     }' \
     "$COOLIFY_URL/api/v1/databases/{db-uuid}/backup"

# 3. Start database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{db-uuid}/start"
```

### Workflow 4: Deploy Docker Image

```bash
# Deploy pre-built Docker image from registry

curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "docker-image",
       "name": "my-image-app",
       "docker_image": "nginx:latest",
       "ports_exposes": "80"
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

### Workflow 5: CI/CD Webhook Deployment

```bash
# Trigger deployment from CI/CD pipeline

# Deploy by tag
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?tag=v1.2.3"

# Deploy by application UUID
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?uuid={app-uuid}"
```

## Decision Tree

**When to use which approach:**

- **To deploy public repository**: Use `type: public` with `git_repository` URL
- **To deploy private repository**: Use GitHub App (`type: private-gh-app`) or deploy key (`type: private-deploy-key`)
- **To deploy Docker image**: Use `type: docker-image` with `docker_image` name
- **To deploy custom Dockerfile**: Use `type: dockerfile` with Dockerfile content
- **To deploy multi-container app**: Use `type: docker-compose` with compose YAML
- **To create database**: Use `/api/v1/databases` with database type (postgresql, mysql, redis, mongodb, etc.)
- **To trigger deployment**: Use `/api/v1/deployments/deploy` with tag or UUID
- **For detailed API syntax**: See [API Reference](./reference/api-reference.md)
- **For complete workflows**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Managing Environment Variables

```bash
# List variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/environment-variables"

# Add single variable
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "DATABASE_URL",
       "value": "postgres://user:pass@host:5432/db",
       "is_build_time": false
     }' \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/environment-variables"

# Bulk update variables
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "variables": [
         {"key": "VAR1", "value": "value1"},
         {"key": "VAR2", "value": "value2"}
       ]
     }' \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/environment-variables/bulk"

# Restart after changes
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/restart"
```

### Application Lifecycle Management

```bash
# Start application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/start"

# Stop application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/stop"

# Restart application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/restart"

# View logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/logs"

# List deployments
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{app-uuid}/deployments"
```

### Server Management

```bash
# List all servers
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers"

# Get server details
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{server-uuid}"

# Validate server connectivity
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{server-uuid}/validate"

# List server resources
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{server-uuid}/resources"
```

## Troubleshooting

**Common Issues:**

1. **401 Unauthorized**
   - Solution: Verify token is valid and API access is enabled
   - See: [Authentication Issues](./reference/troubleshooting.md#authentication-issues)

2. **Application won't start**
   - Quick fix: Check logs and verify environment variables
   - See: [Application Won't Start](./reference/troubleshooting.md#application-wont-start)

3. **Build fails**
   - Quick fix: Switch to dockerfile type or add build-time variables
   - See: [Build Fails](./reference/troubleshooting.md#build-fails)

4. **Git repository access denied**
   - Quick fix: Verify deploy key or GitHub App configuration
   - See: [Git Repository Access Denied](./reference/troubleshooting.md#git-repository-access-denied)

5. **Database won't start**
   - Quick fix: Check port conflicts and credentials
   - See: [Database Won't Start](./reference/troubleshooting.md#database-wont-start)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[API Reference](./reference/api-reference.md)** - Complete REST API endpoint documentation with all request/response formats, authentication details, and HTTP status codes. Use when you need exact API syntax for any Coolify operation.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world deployment patterns including multi-environment setups, CI/CD integration, database backups, and shell helper functions. Use for implementing complete workflows or automation scripts.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and solutions for authentication, deployment, server, database, and API issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **API Reference** when you need exact endpoint paths, request body schemas, or response format details
- Use **Common Patterns** for implementing multi-step deployments, GitHub Actions integration, or production setups
- Use **Troubleshooting** when deployments fail, authentication errors occur, or resources won't start

## Resources

- Official Documentation: https://coolify.io/docs
- API Documentation: https://coolify.io/docs/api
- GitHub Repository: https://github.com/coollabsio/coolify
- Discord Community: https://discord.gg/coolify
