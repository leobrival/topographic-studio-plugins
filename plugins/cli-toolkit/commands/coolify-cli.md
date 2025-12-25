---
title: Coolify API
description: Coolify API commands for self-hosted PaaS management
allowed-tools: [Bash(curl *)]
---

Comprehensive documentation of the Coolify REST API for deploying and managing applications on your self-hosted Coolify instance.

## Configuration & Authentication

### Base URL

```
http://<your-coolify-ip>:8000/api/v1
```

All API endpoints are prefixed with `/api/v1` and secured using Laravel Sanctum with bearer token authentication.

### Generate API Token

1. Go to **Keys & Tokens** > **API tokens** in your Coolify dashboard
2. Define a name for your token
3. Click **Create New Token**
4. Copy and store the token securely (shown only once)

### Token Permissions

- **Read-only**: Can only read data, cannot create/update/delete resources
- **Sensitive data**: Without this permission, passwords and API keys are redacted

### Authentication Header

```bash
# Set your Coolify URL and token
export COOLIFY_URL="http://your-coolify-ip:8000"
export COOLIFY_TOKEN="your-api-token"

# All requests require the Authorization header
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     "$COOLIFY_URL/api/v1/endpoint"
```

## System Operations

### Version

```bash
# Get Coolify version
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"
```

### Health Check

```bash
# Check system health (no auth required)
curl "$COOLIFY_URL/api/health"
```

### API Access

```bash
# Enable API access
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/enable"

# Disable API access
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/disable"
```

## Servers

### List Servers

```bash
# Get all servers
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers"
```

### Get Server Details

```bash
# Get specific server by UUID
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{uuid}"
```

### Create Server

```bash
# Create a new server
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-server",
       "ip": "192.168.1.100",
       "port": 22,
       "user": "root",
       "private_key_uuid": "pk-uuid"
     }' \
     "$COOLIFY_URL/api/v1/servers"
```

### Update Server

```bash
# Update server configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-server-name",
       "description": "Production server"
     }' \
     "$COOLIFY_URL/api/v1/servers/{uuid}"
```

### Delete Server

```bash
# Remove server
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{uuid}"
```

### Server Resources

```bash
# Get resources deployed on server
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{uuid}/resources"
```

### Server Domains

```bash
# List domains configured on server
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{uuid}/domains"
```

### Validate Server

```bash
# Verify server connectivity
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/{uuid}/validate"
```

## Projects

### List Projects

```bash
# Get all projects
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/projects"
```

### Get Project Details

```bash
# Get specific project
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/projects/{uuid}"
```

### Create Project

```bash
# Create a new project
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-project",
       "description": "Production project"
     }' \
     "$COOLIFY_URL/api/v1/projects"
```

### Update Project

```bash
# Update project
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-project",
       "description": "Updated description"
     }' \
     "$COOLIFY_URL/api/v1/projects/{uuid}"
```

### Delete Project

```bash
# Remove project
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/projects/{uuid}"
```

## Environments

### List Environments

```bash
# Get environments for a project
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/projects/{uuid}/environments"
```

### Get Environment

```bash
# Get specific environment by name or UUID
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/projects/{project-uuid}/environments/{env-name-or-uuid}"
```

### Create Environment

```bash
# Create new environment
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "staging"
     }' \
     "$COOLIFY_URL/api/v1/projects/{uuid}/environments"
```

### Delete Environment

```bash
# Remove environment
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/projects/{project-uuid}/environments/{env-uuid}"
```

## Applications

### List Applications

```bash
# Get all applications
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications"
```

### Get Application Details

```bash
# Get specific application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}"
```

### Create Public Repository Application

```bash
# Deploy from public Git repository
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
```

### Create Private Repository Application (GitHub App)

```bash
# Deploy from private repository using GitHub App
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

### Create Private Repository Application (Deploy Key)

```bash
# Deploy from private repository using deploy key
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
       "private_key_uuid": "pk-uuid",
       "git_repository": "git@github.com:user/repo.git",
       "git_branch": "main",
       "build_pack": "nixpacks",
       "ports_exposes": "3000"
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

### Create Dockerfile Application

```bash
# Deploy using custom Dockerfile
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

### Create Docker Image Application

```bash
# Deploy from Docker image
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

### Create Docker Compose Application

```bash
# Deploy using Docker Compose
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "docker-compose",
       "name": "my-compose-app",
       "docker_compose": "version: \"3\"\nservices:\n  web:\n    image: nginx\n    ports:\n      - \"80:80\""
     }' \
     "$COOLIFY_URL/api/v1/applications"
```

### Update Application

```bash
# Modify application configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-app-name",
       "description": "Updated description",
       "git_branch": "develop"
     }' \
     "$COOLIFY_URL/api/v1/applications/{uuid}"
```

### Delete Application

```bash
# Remove application
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}"
```

### Application Lifecycle

```bash
# Start application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/start"

# Stop application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/stop"

# Restart application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/restart"
```

### Application Logs

```bash
# Fetch application logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/logs"
```

### Application Deployments

```bash
# List deployments for application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/deployments"
```

## Application Environment Variables

### List Variables

```bash
# Get environment variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/environment-variables"
```

### Create Variable

```bash
# Add environment variable
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "DATABASE_URL",
       "value": "postgres://user:pass@host:5432/db",
       "is_build_time": false,
       "is_preview": false
     }' \
     "$COOLIFY_URL/api/v1/applications/{uuid}/environment-variables"
```

### Update Variable

```bash
# Modify environment variable
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "DATABASE_URL",
       "value": "postgres://user:newpass@host:5432/db"
     }' \
     "$COOLIFY_URL/api/v1/applications/{uuid}/environment-variables"
```

### Bulk Update Variables

```bash
# Update multiple variables at once
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "variables": [
         {"key": "VAR1", "value": "value1"},
         {"key": "VAR2", "value": "value2"}
       ]
     }' \
     "$COOLIFY_URL/api/v1/applications/{uuid}/environment-variables/bulk"
```

### Delete Variable

```bash
# Remove environment variable
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/environment-variables/{id}"
```

## Databases

### List Databases

```bash
# Get all databases
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases"
```

### Get Database Details

```bash
# Get specific database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}"
```

### Create PostgreSQL Database

```bash
# Create PostgreSQL instance
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "postgresql",
       "name": "my-postgres",
       "postgres_user": "myuser",
       "postgres_password": "mypassword",
       "postgres_db": "mydb"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Create MySQL Database

```bash
# Create MySQL instance
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

### Create MariaDB Database

```bash
# Create MariaDB instance
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "mariadb",
       "name": "my-mariadb",
       "mariadb_user": "myuser",
       "mariadb_password": "mypassword",
       "mariadb_database": "mydb"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Create MongoDB Database

```bash
# Create MongoDB instance
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "mongodb",
       "name": "my-mongo",
       "mongo_initdb_root_username": "root",
       "mongo_initdb_root_password": "rootpassword"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Create Redis Database

```bash
# Create Redis instance
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "redis",
       "name": "my-redis",
       "redis_password": "redispassword"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Create KeyDB Database

```bash
# Create KeyDB instance (Redis-compatible)
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "keydb",
       "name": "my-keydb"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Create ClickHouse Database

```bash
# Create ClickHouse instance
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "clickhouse",
       "name": "my-clickhouse"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Create DragonFly Database

```bash
# Create DragonFly instance (Redis-compatible)
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "project_uuid": "project-uuid",
       "environment_name": "production",
       "server_uuid": "server-uuid",
       "destination_uuid": "destination-uuid",
       "type": "dragonfly",
       "name": "my-dragonfly"
     }' \
     "$COOLIFY_URL/api/v1/databases"
```

### Update Database

```bash
# Modify database configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-db-name",
       "description": "Updated description"
     }' \
     "$COOLIFY_URL/api/v1/databases/{uuid}"
```

### Delete Database

```bash
# Remove database
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}"
```

### Database Lifecycle

```bash
# Start database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}/start"

# Stop database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}/stop"

# Restart database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}/restart"
```

## Database Backups

### List Backup Executions

```bash
# Get all backup executions
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/backups"
```

### Get Database Backups

```bash
# Get backups for specific database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}/backups"
```

### Update Backup Configuration

```bash
# Modify backup settings
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": true,
       "frequency": "0 0 * * *",
       "number_of_backups_to_keep": 7
     }' \
     "$COOLIFY_URL/api/v1/databases/{uuid}/backup"
```

### Delete Backup Configuration

```bash
# Remove backup settings
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}/backup-configuration"
```

### Delete Backup Execution

```bash
# Remove specific backup
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/backups/{uuid}"
```

## Services

### List Services

```bash
# Get all services
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services"
```

### Get Service Details

```bash
# Get specific service
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}"
```

### Create Service

```bash
# Create one-click service or custom Docker Compose service
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
```

### Update Service

```bash
# Modify service configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-service",
       "description": "Updated description"
     }' \
     "$COOLIFY_URL/api/v1/services/{uuid}"
```

### Delete Service

```bash
# Remove service
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}"
```

### Service Lifecycle

```bash
# Start service
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}/start"

# Stop service
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}/stop"

# Restart service
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}/restart"
```

## Service Environment Variables

### List Variables

```bash
# Get service environment variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}/environment-variables"
```

### Create Variable

```bash
# Add service environment variable
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "CUSTOM_VAR",
       "value": "custom-value"
     }' \
     "$COOLIFY_URL/api/v1/services/{uuid}/environment-variables"
```

### Update Variable

```bash
# Modify service environment variable
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "CUSTOM_VAR",
       "value": "updated-value"
     }' \
     "$COOLIFY_URL/api/v1/services/{uuid}/environment-variables"
```

### Bulk Update Variables

```bash
# Update multiple service variables
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "variables": [
         {"key": "VAR1", "value": "value1"},
         {"key": "VAR2", "value": "value2"}
       ]
     }' \
     "$COOLIFY_URL/api/v1/services/{uuid}/environment-variables/bulk"
```

### Delete Variable

```bash
# Remove service environment variable
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/{uuid}/environment-variables/{id}"
```

## Deployments

### List All Deployments

```bash
# Get all deployments
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments"
```

### Get Deployment Details

```bash
# Get specific deployment
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/{uuid}"
```

### Trigger Deployment

```bash
# Deploy by tag or UUID
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?tag=v1.0.0"

# Deploy by application UUID
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?uuid=app-uuid"
```

## Resources

### List All Resources

```bash
# Get all resources across projects
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/resources"
```

## Private Keys

### List Private Keys

```bash
# Get all private keys
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/private-keys"
```

### Get Private Key

```bash
# Get specific private key
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/private-keys/{uuid}"
```

### Create Private Key

```bash
# Add new private key
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "my-deploy-key",
       "description": "Deploy key for production",
       "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
     }' \
     "$COOLIFY_URL/api/v1/private-keys"
```

### Update Private Key

```bash
# Modify private key
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-key-name",
       "description": "Updated description"
     }' \
     "$COOLIFY_URL/api/v1/private-keys/{uuid}"
```

### Delete Private Key

```bash
# Remove private key
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/private-keys/{uuid}"
```

## GitHub Apps

### Register GitHub App

```bash
# Add GitHub App integration
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
```

### Load Repositories

```bash
# Get repositories available via GitHub App
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps/{id}/repositories"
```

### Load Branches

```bash
# Get branches for a repository
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps/{id}/branches?repository=user/repo"
```

### Update GitHub App

```bash
# Modify GitHub App configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "updated-app-name"
     }' \
     "$COOLIFY_URL/api/v1/github-apps/{id}"
```

### Delete GitHub App

```bash
# Unregister GitHub App
curl -X DELETE \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps/{id}"
```

## Teams

### List Teams

```bash
# Get all teams
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/teams"
```

### Get Team Details

```bash
# Get specific team
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/teams/{id}"
```

### Get Team Members

```bash
# List team members
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/teams/{id}/members"
```

### Get Current Team

```bash
# Get authenticated user's team
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/teams/current"
```

### Get Current Team Members

```bash
# List current team members
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/teams/current/members"
```

## Common Usage Examples

```bash
# Complete deployment workflow
export COOLIFY_URL="http://coolify.example.com:8000"
export COOLIFY_TOKEN="your-api-token"

# 1. Create a project
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "my-project"}' \
     "$COOLIFY_URL/api/v1/projects"

# 2. Deploy application from GitHub
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
     "$COOLIFY_URL/api/v1/applications/{uuid}/environment-variables"

# 4. Start the application
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/start"

# 5. Check logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/{uuid}/logs"
```

```bash
# Database setup with backup configuration
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

# 2. Configure daily backups
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": true,
       "frequency": "0 2 * * *",
       "number_of_backups_to_keep": 14
     }' \
     "$COOLIFY_URL/api/v1/databases/{uuid}/backup"

# 3. Start database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/{uuid}/start"
```

```bash
# CI/CD webhook deployment
# Trigger deployment when new tag is pushed
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?tag=v1.2.3"
```

## Shell Helper Functions

Add these to your `.bashrc` or `.zshrc` for easier API access:

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

## Error Handling

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error
