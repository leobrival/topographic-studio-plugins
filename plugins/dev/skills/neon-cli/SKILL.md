---
name: neon-cli
description: Neon CLI expert for serverless PostgreSQL. Use when users need to manage Neon projects, branches, databases, roles, or connection strings.
---

# Neon CLI Guide

Neon is a serverless PostgreSQL platform providing instant database provisioning, branching, and scaling. This guide provides essential workflows and quick references for common Neon operations.

## Quick Start

```bash
# Check Neon CLI installation
neon --version

# Authenticate with Neon
neon auth

# View current user
neon me

# List all projects
neon projects list

# Create new project
neon projects create --name myapp --region aws-us-east-1
```

## Common Workflows

### Workflow 1: Create Project with Database

```bash
# Authenticate first
neon auth

# Create project
neon projects create --name myapp --region aws-us-east-1

# Get project ID (from output or list)
neon projects list

# Create database
neon databases create --branch-id <branch_id> --name app_db

# Create application role
neon roles create --branch-id <branch_id> --name app_user --password secret123

# Get connection string
neon connection-string
```

### Workflow 2: Feature Branch Development

```bash
# Create feature branch from main
neon branches create --project-id <project_id> --name feature/new-api --parent-id <main_branch_id>

# Add compute to branch
neon branches add-compute <feature_branch_id> --size small

# Create database for feature
neon databases create --branch-id <feature_branch_id> --name app_db

# Get connection string for development
neon connection-string feature/new-api

# After testing, delete feature branch
neon branches delete <feature_branch_id>
```

### Workflow 3: Multi-Environment Setup

```bash
# Create production branch with medium compute
neon branches create --project-id <project_id> --name production
neon branches add-compute <prod_branch_id> --size medium

# Create staging branch with small compute
neon branches create --project-id <project_id> --name staging --parent-id <prod_branch_id>
neon branches add-compute <staging_branch_id> --size small

# Create development branch
neon branches create --project-id <project_id> --name development --parent-id <prod_branch_id>

# Setup databases per environment
neon databases create --branch-id <prod_branch_id> --name app_db
neon databases create --branch-id <staging_branch_id> --name app_db
neon databases create --branch-id <dev_branch_id> --name app_db
```

### Workflow 4: User and Role Management

```bash
# List existing roles
neon roles list --branch-id <branch_id>

# Create application user
neon roles create --branch-id <branch_id> --name app_user --password app_password

# Create read-only user
neon roles create --branch-id <branch_id> --name readonly_user --password readonly_password

# Create migration user (for deployment scripts)
neon roles create --branch-id <branch_id> --name migration_user --password migration_password
```

### Workflow 5: Security Configuration

```bash
# View IP allowlist
neon ip-allow list --project-id <project_id>

# Add specific IP
neon ip-allow add --project-id <project_id> --ip 203.0.113.42/32

# Add IP range for organization
neon ip-allow add --project-id <project_id> --ip 192.168.1.0/24

# Create VPC endpoint for private connection
neon vpc endpoint create --project-id <project_id> --region us-east-1
```

## Decision Tree

**When to use which command:**

- **To create a project**: Use `neon projects create` with name and region
- **To create a database**: Use `neon databases create` with branch ID
- **To add a user role**: Use `neon roles create` with branch ID
- **To branch from main**: Use `neon branches create` with parent ID
- **To get connection details**: Use `neon connection-string`
- **To manage security**: Use `neon ip-allow` for IP whitelisting
- **To isolate features**: Use feature branches with `neon branches create`
- **To scale compute**: Use `neon branches add-compute` with size option
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex scenarios**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Project Initialization

```bash
# Authenticate
neon auth

# Create project
neon projects create --name myapp --region aws-us-east-1

# Setup main branch database
neon databases create --branch-id <main_branch_id> --name app_db

# Create application user
neon roles create --branch-id <main_branch_id> --name app_user --password secret

# Get connection string
neon connection-string
```

### Branching Strategy

```bash
# Create isolated development branch
neon branches create --project-id <project_id> --name dev

# Create feature branch from development
neon branches create --project-id <project_id> --name feature/auth --parent-id <dev_branch_id>

# Add small compute for feature development
neon branches add-compute <feature_branch_id> --size small
```

### Environment-Specific Setup

```bash
# Export connection strings for each environment
export PROD_DATABASE_URL=$(neon connection-string production)
export STAGING_DATABASE_URL=$(neon connection-string staging)
export DEV_DATABASE_URL=$(neon connection-string dev)

# Use in deployment
docker run -e DATABASE_URL=$PROD_DATABASE_URL myapp:latest
```

### Automated Cleanup

```bash
# Delete feature branches after development
neon branches list --project-id <project_id> -o json | \
  jq -r '.[] | select(.name | startswith("feature/")) | .id' | \
  xargs -I {} neon branches delete {}
```

## Troubleshooting

**Common Issues:**

1. **Cannot authenticate**
   - Solution: Run `neon auth` to complete OAuth flow
   - See: [Authentication Issues](./reference/troubleshooting.md#authentication-issues)

2. **Branch has no compute**
   - Quick fix: Run `neon branches add-compute <branch_id> --size small`
   - See: [Missing Compute on Branch](./reference/troubleshooting.md#missing-compute-on-branch)

3. **Connection timeout**
   - Quick fix: Add IP to allowlist `neon ip-allow add --project-id <project_id> --ip <your_ip>/32`
   - See: [Connection Timeout](./reference/troubleshooting.md#connection-timeout)

4. **Database not found**
   - Quick fix: Create database `neon databases create --branch-id <branch_id> --name app_db`
   - See: [Database Not Found](./reference/troubleshooting.md#database-not-found)

5. **Project deletion fails**
   - Quick fix: Delete all branches except main first, then delete project
   - See: [Cannot Delete Project](./reference/troubleshooting.md#cannot-delete-project)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any Neon command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for project setup, multi-environment configuration, feature branching, role management, IP allowlisting, and scripting examples. Use for implementing specific workflows or automating operations.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for authentication, projects, branches, databases, roles, connections, and security issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing multi-environment setups, feature branch workflows, or scripting automation
- Use **Troubleshooting** when projects won't create, branches lack compute, connections time out, or you encounter permission issues

## Resources

- Official Docs: https://neon.tech/docs
- Dashboard: https://console.neon.tech
- GitHub: https://github.com/neondatabase
- Community: https://neon.tech/community

