# Coolify Common Patterns

Real-world deployment workflows and patterns for Coolify self-hosted PaaS.

## Initial Setup Pattern

### Configure Environment and Authentication

```bash
# Set Coolify URL and token
export COOLIFY_URL="http://your-coolify-ip:8000"
export COOLIFY_TOKEN="your-api-token"

# Test authentication
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# Check system health
curl "$COOLIFY_URL/api/health"
```

### Shell Helper Functions

Add these to `.bashrc` or `.zshrc` for easier API access:

```bash
# Coolify API helper functions
export COOLIFY_URL="http://your-coolify-ip:8000"
export COOLIFY_TOKEN="your-api-token"

coolify_get() {
  curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
       "$COOLIFY_URL/api/v1/$1" | jq .
}

coolify_post() {
  curl -s -X POST \
       -H "Authorization: Bearer $COOLIFY_TOKEN" \
       -H "Content-Type: application/json" \
       -d "$2" \
       "$COOLIFY_URL/api/v1/$1" | jq .
}

coolify_patch() {
  curl -s -X PATCH \
       -H "Authorization: Bearer $COOLIFY_TOKEN" \
       -H "Content-Type: application/json" \
       -d "$2" \
       "$COOLIFY_URL/api/v1/$1" | jq .
}

coolify_delete() {
  curl -s -X DELETE \
       -H "Authorization: Bearer $COOLIFY_TOKEN" \
       "$COOLIFY_URL/api/v1/$1" | jq .
}

# Usage examples:
# coolify_get "servers"
# coolify_get "applications"
# coolify_post "projects" '{"name": "new-project"}'
# coolify_delete "applications/uuid"
```

## Complete Deployment Workflows

### Workflow 1: Deploy Public GitHub Repository

```bash
# Complete deployment workflow for public repository
export COOLIFY_URL="http://coolify.example.com:8000"
export COOLIFY_TOKEN="your-api-token"

# 1. Create a project
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "my-project"}' \
     "$COOLIFY_URL/api/v1/projects"

# Get project UUID from response
PROJECT_UUID="project-uuid-from-response"

# 2. Deploy application from GitHub
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "'"$PROJECT_UUID"'",
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

# Get application UUID from response
APP_UUID="app-uuid-from-response"

# 3. Add environment variables
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key": "NODE_ENV", "value": "production"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"

# 4. Start the application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/start"

# 5. Check logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/logs"
```

### Workflow 2: Deploy Private Repository with GitHub App

```bash
# Deploy application from private repository using GitHub App

# 1. Register GitHub App (if not already done)
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-github-app",
       "organization": "my-org",
       "app_id": 123456,
       "installation_id": 654321,
       "client_id": "client-id",
       "client_secret": "client-secret",
       "webhook_secret": "webhook-secret",
       "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
     }' \
     "$COOLIFY_URL/api/v1/github-apps"

# Get GitHub App ID
GH_APP_ID="gh-app-id-from-response"

# 2. Load available repositories
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps/$GH_APP_ID/repositories"

# 3. Create application from private repository
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
       "github_app_uuid": "'"$GH_APP_ID"'",
       "git_repository": "user/private-repo",
       "git_branch": "main",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"

# 4. Configure environment and start
APP_UUID="app-uuid-from-response"
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key": "API_KEY", "value": "secret"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"

curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/start"
```

### Workflow 3: Deploy Private Repository with Deploy Key

```bash
# Deploy from private repository using SSH deploy key

# 1. Create private key
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-deploy-key",
       "description": "Deploy key for production",
       "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
     }' \
     "$COOLIFY_URL/api/v1/private-keys"

# Get private key UUID
PK_UUID="pk-uuid-from-response"

# 2. Create application with deploy key
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "private-deploy-key",
       "name": "my-app",
       "private_key_uuid": "'"$PK_UUID"'",
       "git_repository": "git@github.com:user/repo.git",
       "git_branch": "main",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

### Workflow 4: Deploy Docker Image

```bash
# Deploy pre-built Docker image from registry

# 1. Create application from Docker image
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

# 2. Start container
APP_UUID="app-uuid-from-response"
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/start"
```

### Workflow 5: Deploy with Custom Dockerfile

```bash
# Deploy application using custom Dockerfile

curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "dockerfile",
       "name": "my-dockerfile-app",
       "dockerfile": "FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

## Database Deployment Patterns

### Pattern 1: PostgreSQL with Backup Configuration

```bash
# Create PostgreSQL database with automated backups

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

# Get database UUID
DB_UUID="db-uuid-from-response"

# 2. Configure daily backups at 2 AM, keep 14 days
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": true,
       "frequency": "0 2 * * *",
       "number_of_backups_to_keep": 14
     }' \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/backup"

# 3. Start database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/start"

# 4. Verify backups are configured
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/backups"
```

### Pattern 2: MySQL Database Setup

```bash
# Create MySQL database instance

curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "mysql",
       "name": "my-mysql",
       "mysql_user": "myuser",
       "mysql_password": "mypassword",
       "mysql_database": "mydb",
       "mysql_root_password": "rootpassword"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Pattern 3: Redis Cache Setup

```bash
# Create Redis cache instance

curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "redis",
       "name": "my-redis-cache",
       "redis_password": "redispassword"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

## Environment Variable Management

### Bulk Environment Variable Update

```bash
# Update multiple environment variables at once

curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "variables": [
         {"key": "NODE_ENV", "value": "production"},
         {"key": "DATABASE_URL", "value": "postgres://user:pass@host:5432/db"},
         {"key": "API_KEY", "value": "secret-key"},
         {"key": "LOG_LEVEL", "value": "info"}
       ]
     }' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables/bulk"
```

### Build-Time vs Runtime Variables

```bash
# Add build-time variable (available during build)
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "BUILD_VERSION",
       "value": "1.0.0",
       "is_build_time": true,
       "is_preview": false
     }' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"

# Add runtime variable (available at runtime only)
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "API_KEY",
       "value": "secret",
       "is_build_time": false,
       "is_preview": false
     }' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"
```

## Server Management Patterns

### Add and Validate New Server

```bash
# Add new server and verify connectivity

# 1. Create server
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "production-server",
       "ip": "192.168.1.100",
       "port": 22,
       "user": "root",
       "private_key_uuid": "pk-uuid"
     }' \
     "$COOLIFY_URL/api/v1/servers"

# Get server UUID
SERVER_UUID="server-uuid-from-response"

# 2. Validate server connectivity
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID/validate"

# 3. List resources on server
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID/resources"

# 4. List configured domains
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID/domains"
```

## Multi-Environment Pattern

### Create Staging and Production Environments

```bash
# Set up multiple environments for a project

PROJECT_UUID="your-project-uuid"

# 1. Create staging environment
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "staging"}' \
     "$COOLIFY_URL/api/v1/projects/$PROJECT_UUID/environments"

# 2. Create production environment
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "production"}' \
     "$COOLIFY_URL/api/v1/projects/$PROJECT_UUID/environments"

# 3. Deploy to staging
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "'"$PROJECT_UUID"'",
       "environment_name": "staging",
       "server_uuid": "staging-server-uuid",
       "destination_uuid": "staging-dest-uuid",
       "type": "public",
       "name": "my-app-staging",
       "git_repository": "https://github.com/user/repo",
       "git_branch": "develop",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"

# 4. Deploy to production
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "'"$PROJECT_UUID"'",
       "environment_name": "production",
       "server_uuid": "prod-server-uuid",
       "destination_uuid": "prod-dest-uuid",
       "type": "public",
       "name": "my-app-production",
       "git_repository": "https://github.com/user/repo",
       "git_branch": "main",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

## CI/CD Integration Patterns

### Automated Deployment via Webhook

```bash
# Trigger deployment when new tag is pushed (use in CI/CD pipeline)

# Deploy specific tag
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?tag=v1.2.3"

# Deploy specific application by UUID
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?uuid=$APP_UUID"
```

### GitHub Actions Integration

```yaml
# .github/workflows/deploy.yml
name: Deploy to Coolify

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Deployment
        run: |
          curl -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
               "${{ secrets.COOLIFY_URL }}/api/v1/deployments/deploy?tag=${{ github.ref_name }}"
```

## Service Deployment Pattern

### Deploy One-Click Service

```bash
# Deploy pre-configured service (e.g., Plausible Analytics)

curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "plausible",
       "name": "my-plausible"
     }' \
     "$COOLIFY_URL/api/v1/services"

# Get service UUID and configure environment
SERVICE_UUID="service-uuid-from-response"
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key": "ADMIN_EMAIL", "value": "admin@example.com"}' \
     "$COOLIFY_URL/api/v1/services/$SERVICE_UUID/environment-variables"

# Start service
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/$SERVICE_UUID/start"
```

## Monitoring and Logging Pattern

### Check Application Health

```bash
# Monitor application status and logs

# 1. Get application details
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# 2. View recent logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/logs"

# 3. List deployment history
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/deployments"

# 4. Check resources on server
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID/resources"
```

## Cleanup and Maintenance

### Remove Application and Resources

```bash
# Complete cleanup of application and associated resources

# 1. Stop application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/stop"

# 2. Delete application
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# 3. Stop and remove database if no longer needed
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/stop"

curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID"
```
