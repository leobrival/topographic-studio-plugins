# Coolify API Reference

Complete API endpoint documentation for Coolify REST API.

## Base Configuration

**Base URL:** `http://<your-coolify-ip>:8000/api/v1`

**Authentication:** Bearer token via Authorization header

**Token Generation:**
1. Navigate to **Keys & Tokens** > **API tokens** in Coolify dashboard
2. Define token name
3. Click **Create New Token**
4. Copy token (shown only once)

**Token Permissions:**
- **Read-only**: Can only read data
- **Sensitive data**: Required to view passwords and API keys (otherwise redacted)

**Authentication Header:**
```bash
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     "$COOLIFY_URL/api/v1/endpoint"
```

## System Operations

### Version

```bash
# Get Coolify version
GET /api/v1/version
```

### Health Check

```bash
# Check system health (no auth required)
GET /api/health
```

### API Access Control

```bash
# Enable API access
GET /api/v1/enable

# Disable API access
GET /api/v1/disable
```

## Server Management

### List Servers

```bash
# Get all servers
GET /api/v1/servers
```

### Get Server Details

```bash
# Get specific server by UUID
GET /api/v1/servers/{uuid}
```

### Create Server

```bash
POST /api/v1/servers
Content-Type: application/json

{
  "name": "my-server",
  "ip": "192.168.1.100",
  "port": 22,
  "user": "root",
  "private_key_uuid": "pk-uuid"
}
```

### Update Server

```bash
PATCH /api/v1/servers/{uuid}
Content-Type: application/json

{
  "name": "updated-server-name",
  "description": "Production server"
}
```

### Delete Server

```bash
DELETE /api/v1/servers/{uuid}
```

### Server Resources

```bash
# Get resources deployed on server
GET /api/v1/servers/{uuid}/resources
```

### Server Domains

```bash
# List domains configured on server
GET /api/v1/servers/{uuid}/domains
```

### Validate Server

```bash
# Verify server connectivity
GET /api/v1/servers/{uuid}/validate
```

## Project Management

### List Projects

```bash
# Get all projects
GET /api/v1/projects
```

### Get Project Details

```bash
# Get specific project
GET /api/v1/projects/{uuid}
```

### Create Project

```bash
POST /api/v1/projects
Content-Type: application/json

{
  "name": "my-project",
  "description": "Production project"
}
```

### Update Project

```bash
PATCH /api/v1/projects/{uuid}
Content-Type: application/json

{
  "name": "updated-project",
  "description": "Updated description"
}
```

### Delete Project

```bash
DELETE /api/v1/projects/{uuid}
```

## Environment Management

### List Environments

```bash
# Get environments for a project
GET /api/v1/projects/{uuid}/environments
```

### Get Environment

```bash
# Get specific environment by name or UUID
GET /api/v1/projects/{project-uuid}/environments/{env-name-or-uuid}
```

### Create Environment

```bash
POST /api/v1/projects/{uuid}/environments
Content-Type: application/json

{
  "name": "staging"
}
```

### Delete Environment

```bash
DELETE /api/v1/projects/{project-uuid}/environments/{env-uuid}
```

## Application Deployment

### List Applications

```bash
# Get all applications
GET /api/v1/applications
```

### Get Application Details

```bash
# Get specific application
GET /api/v1/applications/{uuid}
```

### Create Public Repository Application

```bash
POST /api/v1/applications
Content-Type: application/json

{
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
}
```

### Create Private Repository Application (GitHub App)

```bash
POST /api/v1/applications
Content-Type: application/json

{
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
}
```

### Create Private Repository Application (Deploy Key)

```bash
POST /api/v1/applications
Content-Type: application/json

{
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
}
```

### Create Dockerfile Application

```bash
POST /api/v1/applications
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "dockerfile",
  "name": "my-dockerfile-app",
  "dockerfile": "FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]",
  "ports_exposes": "3000"
}
```

### Create Docker Image Application

```bash
POST /api/v1/applications
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "docker-image",
  "name": "my-image-app",
  "docker_image": "nginx:latest",
  "ports_exposes": "80"
}
```

### Create Docker Compose Application

```bash
POST /api/v1/applications
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "docker-compose",
  "name": "my-compose-app",
  "docker_compose": "version: \"3\"\nservices:\n  web:\n    image: nginx\n    ports:\n      - \"80:80\""
}
```

### Update Application

```bash
PATCH /api/v1/applications/{uuid}
Content-Type: application/json

{
  "name": "updated-app-name",
  "description": "Updated description",
  "git_branch": "develop"
}
```

### Delete Application

```bash
DELETE /api/v1/applications/{uuid}
```

### Application Lifecycle

```bash
# Start application
GET /api/v1/applications/{uuid}/start

# Stop application
GET /api/v1/applications/{uuid}/stop

# Restart application
GET /api/v1/applications/{uuid}/restart
```

### Application Logs

```bash
# Fetch application logs
GET /api/v1/applications/{uuid}/logs
```

### Application Deployments

```bash
# List deployments for application
GET /api/v1/applications/{uuid}/deployments
```

## Environment Variables

### Application Environment Variables

```bash
# List variables
GET /api/v1/applications/{uuid}/environment-variables

# Create variable
POST /api/v1/applications/{uuid}/environment-variables
Content-Type: application/json

{
  "key": "DATABASE_URL",
  "value": "postgres://user:pass@host:5432/db",
  "is_build_time": false,
  "is_preview": false
}

# Update variable
PATCH /api/v1/applications/{uuid}/environment-variables
Content-Type: application/json

{
  "key": "DATABASE_URL",
  "value": "postgres://user:newpass@host:5432/db"
}

# Bulk update variables
PATCH /api/v1/applications/{uuid}/environment-variables/bulk
Content-Type: application/json

{
  "variables": [
    {"key": "VAR1", "value": "value1"},
    {"key": "VAR2", "value": "value2"}
  ]
}

# Delete variable
DELETE /api/v1/applications/{uuid}/environment-variables/{id}
```

### Service Environment Variables

```bash
# List variables
GET /api/v1/services/{uuid}/environment-variables

# Create variable
POST /api/v1/services/{uuid}/environment-variables
Content-Type: application/json

{
  "key": "CUSTOM_VAR",
  "value": "custom-value"
}

# Update variable
PATCH /api/v1/services/{uuid}/environment-variables
Content-Type: application/json

{
  "key": "CUSTOM_VAR",
  "value": "updated-value"
}

# Bulk update variables
PATCH /api/v1/services/{uuid}/environment-variables/bulk
Content-Type: application/json

{
  "variables": [
    {"key": "VAR1", "value": "value1"},
    {"key": "VAR2", "value": "value2"}
  ]
}

# Delete variable
DELETE /api/v1/services/{uuid}/environment-variables/{id}
```

## Database Management

### List Databases

```bash
# Get all databases
GET /api/v1/databases
```

### Get Database Details

```bash
# Get specific database
GET /api/v1/databases/{uuid}
```

### Create PostgreSQL Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "postgresql",
  "name": "my-postgres",
  "postgres_user": "myuser",
  "postgres_password": "mypassword",
  "postgres_db": "mydb"
}
```

### Create MySQL Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
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
}
```

### Create MariaDB Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "mariadb",
  "name": "my-mariadb",
  "mariadb_user": "myuser",
  "mariadb_password": "mypassword",
  "mariadb_database": "mydb"
}
```

### Create MongoDB Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "mongodb",
  "name": "my-mongo",
  "mongo_initdb_root_username": "root",
  "mongo_initdb_root_password": "rootpassword"
}
```

### Create Redis Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "redis",
  "name": "my-redis",
  "redis_password": "redispassword"
}
```

### Create KeyDB Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "keydb",
  "name": "my-keydb"
}
```

### Create ClickHouse Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "clickhouse",
  "name": "my-clickhouse"
}
```

### Create DragonFly Database

```bash
POST /api/v1/databases
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "dragonfly",
  "name": "my-dragonfly"
}
```

### Update Database

```bash
PATCH /api/v1/databases/{uuid}
Content-Type: application/json

{
  "name": "updated-db-name",
  "description": "Updated description"
}
```

### Delete Database

```bash
DELETE /api/v1/databases/{uuid}
```

### Database Lifecycle

```bash
# Start database
GET /api/v1/databases/{uuid}/start

# Stop database
GET /api/v1/databases/{uuid}/stop

# Restart database
GET /api/v1/databases/{uuid}/restart
```

## Database Backups

### List Backup Executions

```bash
# Get all backup executions
GET /api/v1/databases/backups
```

### Get Database Backups

```bash
# Get backups for specific database
GET /api/v1/databases/{uuid}/backups
```

### Update Backup Configuration

```bash
PATCH /api/v1/databases/{uuid}/backup
Content-Type: application/json

{
  "enabled": true,
  "frequency": "0 0 * * *",
  "number_of_backups_to_keep": 7
}
```

### Delete Backup Configuration

```bash
DELETE /api/v1/databases/{uuid}/backup-configuration
```

### Delete Backup Execution

```bash
DELETE /api/v1/databases/backups/{uuid}
```

## Service Management

### List Services

```bash
# Get all services
GET /api/v1/services
```

### Get Service Details

```bash
# Get specific service
GET /api/v1/services/{uuid}
```

### Create Service

```bash
POST /api/v1/services
Content-Type: application/json

{
  "project_uuid": "project-uuid",
  "environment_name": "production",
  "server_uuid": "server-uuid",
  "destination_uuid": "destination-uuid",
  "type": "plausible",
  "name": "my-plausible"
}
```

### Update Service

```bash
PATCH /api/v1/services/{uuid}
Content-Type: application/json

{
  "name": "updated-service",
  "description": "Updated description"
}
```

### Delete Service

```bash
DELETE /api/v1/services/{uuid}
```

### Service Lifecycle

```bash
# Start service
GET /api/v1/services/{uuid}/start

# Stop service
GET /api/v1/services/{uuid}/stop

# Restart service
GET /api/v1/services/{uuid}/restart
```

## Deployment Operations

### List All Deployments

```bash
# Get all deployments
GET /api/v1/deployments
```

### Get Deployment Details

```bash
# Get specific deployment
GET /api/v1/deployments/{uuid}
```

### Trigger Deployment

```bash
# Deploy by tag
GET /api/v1/deployments/deploy?tag=v1.0.0

# Deploy by application UUID
GET /api/v1/deployments/deploy?uuid=app-uuid
```

## Resource Management

### List All Resources

```bash
# Get all resources across projects
GET /api/v1/resources
```

## Private Keys

### List Private Keys

```bash
# Get all private keys
GET /api/v1/private-keys
```

### Get Private Key

```bash
# Get specific private key
GET /api/v1/private-keys/{uuid}
```

### Create Private Key

```bash
POST /api/v1/private-keys
Content-Type: application/json

{
  "name": "my-deploy-key",
  "description": "Deploy key for production",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
}
```

### Update Private Key

```bash
PATCH /api/v1/private-keys/{uuid}
Content-Type: application/json

{
  "name": "updated-key-name",
  "description": "Updated description"
}
```

### Delete Private Key

```bash
DELETE /api/v1/private-keys/{uuid}
```

## GitHub App Integration

### Register GitHub App

```bash
POST /api/v1/github-apps
Content-Type: application/json

{
  "name": "my-github-app",
  "organization": "my-org",
  "app_id": 123456,
  "installation_id": 654321,
  "client_id": "client-id",
  "client_secret": "client-secret",
  "webhook_secret": "webhook-secret",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
}
```

### Load Repositories

```bash
# Get repositories available via GitHub App
GET /api/v1/github-apps/{id}/repositories
```

### Load Branches

```bash
# Get branches for a repository
GET /api/v1/github-apps/{id}/branches?repository=user/repo
```

### Update GitHub App

```bash
PATCH /api/v1/github-apps/{id}
Content-Type: application/json

{
  "name": "updated-app-name"
}
```

### Delete GitHub App

```bash
DELETE /api/v1/github-apps/{id}
```

## Team Management

### List Teams

```bash
# Get all teams
GET /api/v1/teams
```

### Get Team Details

```bash
# Get specific team
GET /api/v1/teams/{id}
```

### Get Team Members

```bash
# List team members
GET /api/v1/teams/{id}/members
```

### Get Current Team

```bash
# Get authenticated user's team
GET /api/v1/teams/current
```

### Get Current Team Members

```bash
# List current team members
GET /api/v1/teams/current/members
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": { ... }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error
