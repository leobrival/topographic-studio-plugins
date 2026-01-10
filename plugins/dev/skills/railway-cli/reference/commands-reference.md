# Railway CLI Commands Reference

Complete reference for all Railway CLI commands with detailed options and flags.

## Authentication

### `railway login`

Authenticate with Railway.

```bash
# Login with browser
railway login

# Login in CI/CD without browser
railway login --browserless

# Show current user
railway whoami

# Logout
railway logout
```

## Project Management

### `railway init`

Create and initialize a new Railway project.

```bash
# Create new project interactively
railway init

# Create project with specific name
railway init my-project

# Create and link in one step
railway init --link
```

### `railway list`

List all projects under current account.

```bash
# List all projects
railway list

# List with JSON output
railway list --json
```

### `railway link`

Link current directory to an existing Railway project.

```bash
# Link to project interactively
railway link

# Link to specific project
railway link [project-id]

# Unlink current directory
railway unlink
```

### `railway status`

Show information about current project.

```bash
# Show project status
railway status

# Show with JSON output
railway status --json
```

## Deployments

### `railway up`

Deploy current directory to Railway.

```bash
# Deploy current directory
railway up

# Deploy without following logs
railway up --detach

# Deploy in CI mode (build logs only)
railway up --ci

# Deploy without confirmation
railway up --yes
```

### `railway deploy`

Deploy a template into the project.

```bash
# Deploy template interactively
railway deploy

# Deploy specific template
railway deploy --template [template-name]

# Deploy without confirmation
railway deploy --yes
```

### `railway redeploy`

Redeploy the latest service version.

```bash
# Redeploy latest version
railway redeploy

# Redeploy specific service
railway redeploy --service [service-name]

# Redeploy specific deployment
railway redeploy --deployment [deployment-id]
```

### `railway down`

Remove the most recent deployment.

```bash
# Remove latest deployment
railway down

# Remove specific deployment
railway down [deployment-id]

# Remove without confirmation
railway down --yes
```

## Services & Databases

### `railway add`

Add a service or database to the project.

```bash
# Add service or database interactively
railway add

# Add specific database
railway add --database postgres
railway add --database mysql
railway add --database mongodb
railway add --database redis

# Add service template
railway add --template [template-name]
```

### `railway service`

Link a service to the project.

```bash
# Link service interactively
railway service

# Link specific service
railway service [service-name]

# Switch current service context
railway service --set [service-name]
```

### `railway connect`

Connect to database shells interactively.

```bash
# Connect to database interactively
railway connect

# Connect to specific database
railway connect [database-name]

# Connect to PostgreSQL
railway connect postgres

# Connect to MySQL
railway connect mysql

# Connect to MongoDB
railway connect mongo

# Connect to Redis
railway connect redis
```

## Environment Variables

### `railway variables`

Manage environment variables.

```bash
# List environment variables
railway variables

# Set environment variable
railway variables set KEY=value

# Set multiple variables
railway variables set KEY1=value1 KEY2=value2

# Get specific variable
railway variables get KEY

# Delete environment variable
railway variables delete KEY

# Import from .env file
railway variables set --from-file .env

# Export to .env file
railway variables export > .env.example
```

### `railway run`

Execute commands using project environment variables.

```bash
# Run command with Railway environment
railway run [command]

# Run with specific service environment
railway run --service [service-name] [command]

# Examples
railway run npm start
railway run python manage.py migrate
railway run node index.js
```

### `railway shell`

Create subshell with project environment variables loaded.

```bash
# Start shell with environment
railway shell

# Start shell for specific service
railway shell --service [service-name]
```

## Environments

### `railway environment`

Manage project environments.

```bash
# List environments
railway environment

# Create new environment
railway environment new [environment-name]

# Delete environment
railway environment delete [environment-name]

# Switch environment
railway environment use [environment-name]

# Show current environment
railway environment current
```

## Domains

### `railway domain`

Manage custom domains for services.

```bash
# List domains
railway domain

# Add custom domain
railway domain add [domain-name]

# Remove domain
railway domain remove [domain-name]

# Generate Railway domain
railway domain generate
```

## Logs & Monitoring

### `railway logs`

View deployment and service logs.

```bash
# View logs
railway logs

# Follow logs in real-time
railway logs --follow

# View logs for specific service
railway logs --service [service-name]

# View logs for specific deployment
railway logs --deployment [deployment-id]

# Limit number of lines
railway logs --tail 100

# Show logs with timestamps
railway logs --timestamps

# View logs since specific time
railway logs --since "2024-01-01T00:00:00Z"
```

## SSH & Remote Access

### `railway ssh`

Connect to project or service via SSH.

```bash
# SSH into service
railway ssh

# SSH into specific service
railway ssh --service [service-name]

# SSH with specific command
railway ssh --command "ls -la"

# Execute with specific user
railway ssh --user [username]
```

## Volumes

### `railway volume`

Manage persistent volumes.

```bash
# List volumes
railway volume list

# Create volume
railway volume create [volume-name]

# Delete volume
railway volume delete [volume-name]

# Mount volume to service
railway volume mount [volume-name] [mount-path]

# Unmount volume
railway volume unmount [volume-name]
```

## Utilities

### `railway open`

Open Railway dashboard in browser.

```bash
# Open project dashboard
railway open

# Open specific service
railway open --service [service-name]

# Copy dashboard URL instead of opening
railway open --copy
```

### `railway docs`

Open Railway documentation.

```bash
# Open general documentation
railway docs

# Open CLI documentation
railway docs cli

# Open specific topic
railway docs [topic]
```

### `railway help`

Show general or command-specific help.

```bash
# General help
railway help

# Help for specific command
railway help deploy

# Show all commands
railway help --all
```

## Global Options

All Railway commands support these global flags:

- `--help` ‒ Show help for command
- `--version` ‒ Show CLI version
- `--verbose` ‒ Enable verbose output
- `--json` ‒ Output in JSON format
- `--service <name>` ‒ Specify service for command
- `--environment <name>` ‒ Specify environment
- `--project <id>` ‒ Specify project ID
- `--yes` ‒ Skip confirmation prompts

## CI/CD Configuration

### Using Railway Token

Set the `RAILWAY_TOKEN` environment variable in CI/CD:

```bash
# Get token from Railway dashboard
export RAILWAY_TOKEN=your-token-here

# Use in CI mode
railway up --ci

# Deploy without prompts
railway deploy --yes

# Example for GitHub Actions
# env:
#   RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Deployment Verification

```bash
# Check deployment status
railway status

# View deployment logs
railway logs --follow

# Verify service health
railway ssh --command "curl http://localhost:3000/health"
```
