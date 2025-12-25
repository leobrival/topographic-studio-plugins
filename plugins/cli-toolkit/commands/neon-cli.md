---
title: Neon CLI
description: Neon CLI commands for managing serverless Postgres databases
allowed-tools: [Bash(neon *)]
---

Comprehensive cheat-sheet for `neonctl` commands to manage serverless PostgreSQL databases on Neon.

## Installation

```bash
# macOS via Homebrew
brew install neonctl

# Node.js package managers
npm i -g neonctl
bun install -g neonctl

# Use without installation
npx neonctl <command>
bunx neonctl <command>

# Check CLI version
neon --version
```

## Authentication & Profile

### `neon auth`

Opens OAuth flow in browser for authentication.

```bash
# Authenticate with Neon (alias: neon login)
neon auth

# Use explicit API key
neon <command> --api-key $NEON_API_KEY

# Show current user
neon me
```

## Organizations

### `neon orgs list`

Lists all organizations.

```bash
# List organizations (alias: neon org list)
neon orgs list
```

### `neon orgs create`

Creates a new organization.

```bash
# Create organization
neon orgs create "Acme Corp"
```

### `neon orgs delete`

Deletes an organization.

```bash
# Delete organization
neon orgs delete <org_id>
```

## Projects

### `neon projects list`

Lists all projects.

```bash
# List all projects (alias: neon project list)
neon projects list
```

### `neon projects create`

Creates a new project.

```bash
# Create project with name and region
neon projects create --name myproject --region aws-us-east-1
```

### `neon projects get`

Shows project details.

```bash
# Get project details
neon projects get <project_id>
```

### `neon projects update`

Updates project settings.

```bash
# Rename/update project
neon projects update <project_id> --name newname
```

### `neon projects delete`

Deletes a project.

```bash
# Delete project
neon projects delete <project_id>
```

## Branches

### `neon branches list`

Lists branches for a project.

```bash
# List project branches
neon branches list --project-id <project_id>
```

### `neon branches create`

Creates a new branch (logical fork).

```bash
# Create branch
neon branches create --project-id <project_id> --name feature_x
```

### `neon branches set-default`

Sets the default branch.

```bash
# Set default branch
neon branches set-default <branch_id>
```

### `neon branches add-compute`

Adds compute to a branch.

```bash
# Add compute resource
neon branches add-compute <branch_id> --size small
```

### `neon branches rename`

Renames a branch.

```bash
# Rename branch
neon branches rename <branch_id> --name better_name
```

### `neon branches restore`

Restores a branch to a previous state.

```bash
# Restore branch
neon branches restore <branch_id>
```

### `neon branches reset`

Resets a branch.

```bash
# Reset branch
neon branches reset <branch_id>
```

### `neon branches delete`

Deletes a branch.

```bash
# Delete branch
neon branches delete <branch_id>
```

## Databases

### `neon databases list`

Lists databases in a branch.

```bash
# List databases
neon databases list --branch-id <branch_id>
```

### `neon databases create`

Creates a new database.

```bash
# Create database
neon databases create --branch-id <branch_id> --name app_db
```

### `neon databases delete`

Deletes a database.

```bash
# Delete database
neon databases delete <database_id>
```

## Roles (Postgres Users)

### `neon roles list`

Lists roles for a branch.

```bash
# List roles
neon roles list --branch-id <branch_id>
```

### `neon roles create`

Creates a new role.

```bash
# Create role with password
neon roles create --branch-id <branch_id> --name app_user --password mysecret
```

### `neon roles delete`

Deletes a role.

```bash
# Delete role
neon roles delete <role_id>
```

## IP Allow

### `neon ip-allow list`

Lists IP allowlist entries.

```bash
# Show current allowlist
neon ip-allow list --project-id <project_id>
```

### `neon ip-allow add`

Adds an IP to the allowlist.

```bash
# Allow specific IP
neon ip-allow add --project-id <project_id> --ip 203.0.113.42/32
```

### `neon ip-allow remove`

Removes an IP from the allowlist.

```bash
# Remove IP from allowlist
neon ip-allow remove <allowlist_id>
```

### `neon ip-allow reset`

Resets the IP allowlist.

```bash
# Reset allowlist
neon ip-allow reset --project-id <project_id>
```

## VPC

### `neon vpc endpoint create`

Creates a private AWS endpoint.

```bash
# Create VPC endpoint
neon vpc endpoint create --project-id <project_id> --region us-east-1
```

### `neon vpc endpoint list`

Lists VPC endpoints.

```bash
# List VPC endpoints
neon vpc endpoint list --project-id <project_id>
```

### `neon vpc endpoint delete`

Deletes a VPC endpoint.

```bash
# Delete VPC endpoint
neon vpc endpoint delete <endpoint_id>
```

## Operations & Monitoring

### `neon operations list`

Lists long-running operations.

```bash
# List operations (backfills, restores, etc.)
neon operations list --project-id <project_id>
```

## Connection Strings

### `neon connection-string`

Gets connection string for a branch.

```bash
# Get connection string for default branch
neon connection-string

# Get connection string for specific branch
neon connection-string <branch_name>
```

## Context Management

### `neon set-context`

Creates a persistent context file to avoid passing project/branch IDs.

```bash
# Create context file
neon set-context --org-id <org_id> --project-id <project_id> --branch-id <branch_id> --name myctx

# Use context file
neon projects list --context-file ~/.config/neonctl/myctx.json
```

## Utilities

### `neon completion`

Generates shell completion scripts.

```bash
# Generate completions for Bash/Zsh/Fish
neon completion > /usr/local/share/zsh/site-functions/_neonctl
```

## Global Options

All Neon commands support these global flags:

- `-o, --output` ‒ Output format (`json`, `yaml`, `table`)
- `--config-dir` ‒ Configuration directory path
- `--api-key` ‒ API key for authentication (instead of OAuth)
- `--analytics / --no-analytics` ‒ Enable/disable telemetry
- `--color / --no-color` ‒ Enable/disable colored output
- `-v, --version` ‒ Show version
- `-h, --help` ‒ Show contextual help

## Common Usage Examples

```bash
# Complete setup workflow
neon auth
neon projects create --name myapp --region aws-us-east-1
neon branches create --project-id <project_id> --name feature_branch
neon databases create --branch-id <branch_id> --name myapp_db

# Get connection details
neon connection-string
neon projects get <project_id>

# IP allowlist management
neon ip-allow add --project-id <project_id> --ip 192.168.1.0/24
neon ip-allow list --project-id <project_id>

# Context usage for simplified commands
neon set-context --project-id <project_id> --name myproject
neon branches list --context-file ~/.config/neonctl/myproject.json
```
