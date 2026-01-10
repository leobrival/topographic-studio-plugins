# Neon Common Patterns

Real-world patterns and workflows for common Neon use cases.

## Development Workflow

### Basic Project Setup

```bash
# Authenticate
neon auth

# Create new project
neon projects create --name myapp --region aws-us-east-1

# Create development branch
neon branches create --project-id <project_id> --name dev

# Get connection string
neon connection-string dev
```

### Complete Setup Workflow

```bash
# 1. Authenticate
neon auth

# 2. Create project
neon projects create --name myapp --region aws-us-east-1
export PROJECT_ID=<project_id>

# 3. Create feature branch
neon branches create --project-id $PROJECT_ID --name feature_x

# 4. Create application database
neon databases create --branch-id <feature_branch_id> --name app_db

# 5. Create application role
neon roles create --branch-id <feature_branch_id> --name app_user --password secret123

# 6. Get connection string
neon connection-string feature_x
```

## Multi-Environment Setup

### Development, Staging, Production Branches

```bash
# Create main/production branch with compute
neon branches create --project-id <project_id> --name main
neon branches add-compute <main_branch_id> --size medium

# Create staging branch from main
neon branches create --project-id <project_id> --name staging --parent-id <main_branch_id>
neon branches add-compute <staging_branch_id> --size small

# Create development branch from main
neon branches create --project-id <project_id> --name dev --parent-id <main_branch_id>

# Setup databases per environment
neon databases create --branch-id <main_branch_id> --name app_db
neon databases create --branch-id <staging_branch_id> --name app_db
neon databases create --branch-id <dev_branch_id> --name app_db
```

## Database Management

### Database Creation and Configuration

```bash
# Create database in specific branch
neon databases create --branch-id <branch_id> --name myapp_db

# Create multiple databases
neon databases create --branch-id <branch_id> --name postgres_db
neon databases create --branch-id <branch_id> --name cache_db
neon databases create --branch-id <branch_id> --name logs_db

# List all databases in branch
neon databases list --branch-id <branch_id>
```

## Role Management

### User and Role Setup

```bash
# Create application user
neon roles create --branch-id <branch_id> --name app_user --password app_password

# Create read-only user
neon roles create --branch-id <branch_id> --name readonly_user --password readonly_password

# Create migration user
neon roles create --branch-id <branch_id> --name migration_user --password migration_password

# List all roles
neon roles list --branch-id <branch_id>
```

## Feature Branch Workflow

### Isolated Feature Development

```bash
# Create feature branch from main
neon branches create --project-id <project_id> --name feature/new-endpoint --parent-id <main_branch_id>

# Add compute for isolated development
neon branches add-compute <feature_branch_id> --size small

# Create database for feature
neon databases create --branch-id <feature_branch_id> --name app_db

# Get connection string for development
neon connection-string feature/new-endpoint

# After feature testing, you can delete the branch
neon branches delete <feature_branch_id>
```

## IP Allowlist Management

### Allow Specific IPs

```bash
# View current allowlist
neon ip-allow list --project-id <project_id>

# Allow specific IP address
neon ip-allow add --project-id <project_id> --ip 203.0.113.42/32

# Allow IP range
neon ip-allow add --project-id <project_id> --ip 192.168.1.0/24

# Allow multiple IPs
neon ip-allow add --project-id <project_id> --ip 203.0.113.0/24
neon ip-allow add --project-id <project_id> --ip 198.51.100.0/24

# Remove IP from allowlist
neon ip-allow remove <allowlist_id>
```

## VPC Endpoint Setup

### Private Connection Configuration

```bash
# Create VPC endpoint for private connection
neon vpc endpoint create --project-id <project_id> --region us-east-1

# List VPC endpoints
neon vpc endpoint list --project-id <project_id>

# Delete VPC endpoint
neon vpc endpoint delete <endpoint_id>
```

## Context Management

### Using Context Files for Simplified Commands

```bash
# Create context file for project
neon set-context \
  --org-id <org_id> \
  --project-id <project_id> \
  --branch-id <main_branch_id> \
  --name production

# Use context file in commands
neon branches list --context-file ~/.config/neonctl/production.json
neon databases list --context-file ~/.config/neonctl/production.json

# Create development context
neon set-context \
  --org-id <org_id> \
  --project-id <project_id> \
  --branch-id <dev_branch_id> \
  --name development
```

## Output Formatting

### Different Output Formats

```bash
# Default table output
neon projects list

# JSON output for scripting
neon projects list -o json

# YAML output
neon projects list -o yaml

# Filter and format
neon branches list --project-id <project_id> -o json | jq '.[] | .name'
```

## Scripting Examples

### Automated Project Initialization

```bash
#!/bin/bash

PROJECT_NAME=$1
REGION=${2:-aws-us-east-1}

# Create project
PROJECT=$(neon projects create --name $PROJECT_NAME --region $REGION -o json)
PROJECT_ID=$(echo $PROJECT | jq -r '.id')

# Create main branch
MAIN=$(neon branches create --project-id $PROJECT_ID --name main -o json)
MAIN_BRANCH_ID=$(echo $MAIN | jq -r '.id')

# Add compute
neon branches add-compute $MAIN_BRANCH_ID --size medium

# Create database
neon databases create --branch-id $MAIN_BRANCH_ID --name ${PROJECT_NAME}_db

# Create application role
neon roles create \
  --branch-id $MAIN_BRANCH_ID \
  --name app_user \
  --password $(openssl rand -base64 12)

echo "Project $PROJECT_NAME created with ID: $PROJECT_ID"
neon connection-string main
```

### Listing All Projects with Details

```bash
#!/bin/bash

neon projects list -o json | jq -r '.[] | "\(.name) (\(.id)) - Region: \(.region)"'
```

### Feature Branch Cleanup

```bash
#!/bin/bash

PROJECT_ID=$1

# Get all branches except main
neon branches list --project-id $PROJECT_ID -o json | \
  jq -r '.[] | select(.name != "main") | .id' | \
  while read BRANCH_ID; do
    echo "Deleting branch: $BRANCH_ID"
    neon branches delete $BRANCH_ID
  done
```

## Integration Patterns

### Environment Variable Export

```bash
# Export connection string as environment variable
export DATABASE_URL=$(neon connection-string)

# Use in application
echo $DATABASE_URL  # postgresql://user:password@host/dbname

# In .env file
echo "DATABASE_URL=$(neon connection-string)" >> .env
```

### Integration with Application Deployment

```bash
# Get connection string for production branch
PROD_CONN=$(neon connection-string production)

# Deploy with environment variable
docker run -e DATABASE_URL="$PROD_CONN" myapp:latest

# Or export for process
export DATABASE_URL=$(neon connection-string production)
npm start
```

