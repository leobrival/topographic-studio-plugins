---
title: Convex CLI
description: Convex CLI commands for managing serverless backend and database
allowed-tools: [Bash(convex *)]
---

Comprehensive documentation of the Convex CLI for deploying and managing serverless backend functions and real-time databases.

## Installation & Configuration

```bash
# Install via npm (recommended)
npm install -g convex

# Install via pnpm
pnpm add -g convex

# Install via yarn
yarn global add convex

# Check CLI version
convex --version

# Update to latest version
npm update -g convex
```

## Authentication

```bash
# Log in to Convex
convex login

# Log out
convex logout

# Check authentication status
convex whoami
```

## Project Initialization

### `convex init`

Initialize a new Convex project.

```bash
# Initialize Convex in current project
convex init

# Initialize with specific project
convex init --project my-project

# Reinitialize configuration
convex reinit
```

### `convex dev`

Start local development environment with hot reloading.

```bash
# Start development server
convex dev

# Start with specific team
convex dev --team my-team

# Start with specific project
convex dev --project my-project

# Start on custom port
convex dev --admin-port 3001

# Start without opening dashboard
convex dev --no-open

# Verbose logging
convex dev --verbose

# Clear deployment and restart
convex dev --clear-deployment
```

## Deployments

### `convex deploy`

Deploy functions to production.

```bash
# Deploy to production
convex deploy

# Deploy with specific message
convex deploy --message "Added new features"

# Deploy and run codegen
convex deploy --codegen

# Deploy with type checking
convex deploy --typecheck

# Preview before deploying
convex deploy --dry-run

# Deploy to specific deployment
convex deploy --deployment-name my-deployment
```

### `convex deployments list`

List all deployments.

```bash
# List deployments
convex deployments list

# List with details
convex deployments list --verbose
```

## Functions

### `convex run`

Execute a Convex function.

```bash
# Run a query function
convex run myFunction

# Run with arguments
convex run myFunction --args '{"key": "value"}'

# Run mutation
convex run myMutation --args '{"id": "123"}'

# Run in production
convex run myFunction --prod

# Run with JSON file input
convex run myFunction --args-file args.json
```

### `convex import`

Import data into Convex tables.

```bash
# Import data from JSON file
convex import tableName data.json

# Import with replacements
convex import tableName data.json --replace

# Import from specific directory
convex import tableName data/

# Batch import multiple tables
convex import --all data/
```

### `convex export`

Export data from Convex tables.

```bash
# Export specific table
convex export tableName

# Export all tables
convex export --all

# Export to specific file
convex export tableName --output data.json

# Export with format
convex export tableName --format jsonl

# Export from production
convex export tableName --prod
```

## Environment Management

### `convex env list`

List environment variables.

```bash
# List environment variables
convex env list

# List for production
convex env list --prod

# List for specific deployment
convex env list --deployment-name my-deployment
```

### `convex env set`

Set environment variables.

```bash
# Set environment variable
convex env set KEY value

# Set multiple variables
convex env set KEY1 value1 KEY2 value2

# Set for production
convex env set KEY value --prod

# Set from .env file
convex env set --env-file .env.local
```

### `convex env get`

Get environment variable value.

```bash
# Get specific variable
convex env get KEY

# Get for production
convex env get KEY --prod
```

### `convex env unset`

Remove environment variables.

```bash
# Unset environment variable
convex env unset KEY

# Unset multiple variables
convex env unset KEY1 KEY2

# Unset in production
convex env unset KEY --prod
```

## Database Operations

### `convex data`

Manage database operations.

```bash
# View data in browser
convex data

# Open data dashboard
convex dashboard --data

# Clear all tables (DANGER)
convex data clear --all
```

## Logs & Debugging

### `convex logs`

View function execution logs.

```bash
# Stream logs
convex logs

# Stream production logs
convex logs --prod

# Stream with function filter
convex logs --function myFunction

# Stream with log level filter
convex logs --level error

# Show last N logs
convex logs --limit 100

# Follow logs in real-time
convex logs --follow

# Show logs since timestamp
convex logs --since 2024-01-01T00:00:00Z
```

### `convex dashboard`

Open Convex dashboard in browser.

```bash
# Open dashboard
convex dashboard

# Open production dashboard
convex dashboard --prod

# Open data view
convex dashboard --data

# Open logs view
convex dashboard --logs

# Open functions view
convex dashboard --functions

# Open settings
convex dashboard --settings
```

## Authentication & Auth Setup

### `convex auth`

Manage authentication configuration.

```bash
# Configure authentication
convex auth add

# List auth providers
convex auth list

# Remove auth provider
convex auth remove provider-name
```

## Code Generation

### `convex codegen`

Generate TypeScript types from schema.

```bash
# Generate types
convex codegen

# Generate with custom output
convex codegen --output src/convex/_generated

# Watch mode for continuous generation
convex dev --codegen
```

## Project Management

### `convex projects`

Manage Convex projects.

```bash
# List all projects
convex projects list

# Create new project
convex projects create

# Delete project
convex projects delete project-name
```

### `convex teams`

Manage teams.

```bash
# List teams
convex teams list

# Create new team
convex teams create

# Switch active team
convex teams switch team-name
```

## Configuration

### `convex config`

Manage CLI configuration.

```bash
# Show current configuration
convex config show

# Set default team
convex config set default-team my-team

# Set default project
convex config set default-project my-project

# Reset configuration
convex config reset
```

## File Watching & Hot Reloading

```bash
# Watch for file changes (automatic with convex dev)
convex dev --watch

# Disable watching
convex dev --no-watch

# Watch specific directories
convex dev --watch-dirs src/convex,lib
```

## TypeScript Support

```bash
# Run with type checking
convex dev --typecheck

# Skip type checking
convex dev --no-typecheck

# Generate types on file changes
convex dev --codegen
```

## Global Options

All Convex commands support these global flags:

- `--admin-key` — Admin key for authentication
- `--debug` — Enable debug logging
- `--help` — Show help for command
- `--prod` — Target production deployment
- `--project` — Specify project name
- `--team` — Specify team name
- `--url` — Specify deployment URL
- `--verbose` — Enable verbose output
- `--version` — Show CLI version
- `--yes` — Auto-confirm prompts

## Common Usage Examples

```bash
# Complete development workflow
convex login
convex init
convex dev                     # Start local dev environment
# Make changes to functions...
convex deploy                  # Deploy to production

# Data management
convex import users users.json
convex export users --output backup.json
convex data                    # Browse data in dashboard

# Environment configuration
convex env set API_KEY sk_test_123
convex env set DATABASE_URL postgres://...
convex env list

# Function execution
convex run queries/getUser --args '{"id": "123"}'
convex run mutations/createUser --args '{"name": "Alice", "email": "alice@example.com"}'

# Monitoring and debugging
convex logs --follow
convex logs --function myFunction --level error
convex dashboard --logs

# Multi-environment workflow
convex dev                     # Development
convex deploy                  # Production
convex logs --prod            # View production logs
convex env list --prod        # Check production env vars

# Team collaboration
convex teams list
convex teams switch my-team
convex projects list
convex deploy --project my-project

# Data operations
convex import users data/users.json
convex import --all data/
convex export --all --output backup/

# Authentication setup
convex auth add
convex dashboard --settings
```

## Project Structure

```bash
# Typical Convex project structure
my-app/
├── convex/
│   ├── _generated/          # Auto-generated types
│   ├── schema.ts            # Database schema
│   ├── queries/             # Query functions
│   ├── mutations/           # Mutation functions
│   ├── actions/             # Action functions
│   └── http.ts              # HTTP actions
├── convex.json              # Convex configuration
└── .env.local               # Local environment variables
```

## Best Practices

```bash
# Always run dev with type checking
convex dev --typecheck

# Use environment variables for secrets
convex env set SECRET_KEY value --prod

# Export data before major changes
convex export --all --output backup-$(date +%Y%m%d).json

# Monitor production logs
convex logs --prod --follow

# Test functions before deploying
convex run myFunction --args '{"test": true}'
convex deploy --dry-run

# Keep deployments documented
convex deploy --message "feat: added user authentication"

# Regularly update CLI
npm update -g convex
```

## CI/CD Integration

```bash
# Use admin keys in CI/CD environments
export CONVEX_DEPLOY_KEY=your-admin-key
convex deploy --admin-key $CONVEX_DEPLOY_KEY

# Deploy with version tag
convex deploy --message "v1.2.3 - $(git rev-parse --short HEAD)"

# Run tests before deploy
npm test && convex deploy

# Automated deployment script
#!/bin/bash
convex deploy --prod --yes
convex logs --prod --limit 10
```
