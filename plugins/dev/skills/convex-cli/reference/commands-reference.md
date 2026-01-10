# Convex CLI Commands Reference

Complete reference for all Convex CLI commands with detailed options and flags.

## Authentication

### `convex login`

Authenticate with Convex account.

```bash
# Login to Convex
convex login

# Show authentication status
convex whoami

# Logout from Convex
convex logout
```

## Project Management

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

## Development & Deployment

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

# With type checking
convex dev --typecheck

# Watch for file changes
convex dev --watch

# Disable watching
convex dev --no-watch

# With code generation
convex dev --codegen
```

### `convex deploy`

Deploy functions to production.

```bash
# Deploy to production
convex deploy

# Deploy with message
convex deploy --message "Added new features"

# Deploy with type checking
convex deploy --typecheck

# Preview before deploying
convex deploy --dry-run

# Deploy to specific deployment
convex deploy --deployment-name my-deployment

# Auto-confirm prompts
convex deploy --yes
```

### `convex deployments list`

List all deployments.

```bash
# List deployments
convex deployments list

# List with details
convex deployments list --verbose
```

## Function Execution

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

## Data Operations

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

## Authentication Setup

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
