---
title: Railway CLI
description: Railway CLI commands for deploying and managing applications
allowed-tools: [Bash(railway *)]
---

Comprehensive documentation of the Railway CLI for deploying and managing applications on Railway.

## Installation & Configuration

```bash
# Install via npm
npm install -g @railway/cli

# Install via Homebrew (macOS)
brew install railway

# Install via curl
curl -fsSL https://railway.app/install.sh | sh

# Check CLI version
railway --version
```

## Authentication

```bash
# Log in to Railway
railway login

# Log in without browser (CI/CD environments)
railway login --browserless

# Show the currently authenticated user
railway whoami

# Log out
railway logout
```

## Projects

### `railway list`

Lists all Railway projects under the current account.

```bash
# List all projects
railway list
```

### `railway init`

Creates a new Railway project.

```bash
# Create new project interactively
railway init

# Create project with specific name
railway init my-project
```

### `railway link`

Links the current directory to an existing Railway project.

```bash
# Link to project interactively
railway link

# Link to specific project
railway link [project-id]
```

### `railway status`

Shows information about the current project.

```bash
# Show project status
railway status
```

## Deployments

### `railway up`

Deploys the current directory to Railway.

```bash
# Deploy current directory
railway up

# Deploy without following logs
railway up --detach

# Deploy in CI mode (build logs only)
railway up --ci
```

### `railway deploy`

Deploys a template into the project.

```bash
# Deploy template
railway deploy

# Deploy specific template
railway deploy --template [template-name]
```

### `railway redeploy`

Redeploys the latest service version.

```bash
# Redeploy latest version
railway redeploy

# Redeploy specific service
railway redeploy --service [service-name]
```

### `railway down`

Removes the most recent deployment.

```bash
# Remove latest deployment
railway down

# Remove specific deployment
railway down [deployment-id]
```

## Services & Databases

### `railway add`

Adds a service or database to the project.

```bash
# Add service interactively
railway add

# Add specific database
railway add --database postgres
railway add --database mysql
railway add --database redis
railway add --database mongodb

# Add service template
railway add --template [template-name]
```

### `railway service`

Links a service to the project.

```bash
# Link service
railway service

# Link specific service
railway service [service-name]
```

### `railway connect`

Connects to database shells.

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

Manages environment variables.

```bash
# List environment variables
railway variables

# Set environment variable
railway variables set KEY=value

# Set multiple variables
railway variables set KEY1=value1 KEY2=value2

# Delete environment variable
railway variables delete KEY

# Import from .env file
railway variables set --from-file .env
```

### `railway run`

Executes commands using project environment variables.

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

Creates a subshell with project environment variables loaded.

```bash
# Start shell with environment
railway shell

# Start shell for specific service
railway shell --service [service-name]
```

## Environments

### `railway environment`

Manages project environments.

```bash
# List environments
railway environment

# Create new environment
railway environment new [environment-name]

# Delete environment
railway environment delete [environment-name]

# Switch environment
railway environment use [environment-name]
```

## Domains

### `railway domain`

Manages custom domains for services.

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

Views deployment and service logs.

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
```

## SSH & Remote Access

### `railway ssh`

Connects to project or service via SSH.

```bash
# SSH into service
railway ssh

# SSH into specific service
railway ssh --service [service-name]

# SSH with specific command
railway ssh --command "ls -la"
```

## Volumes

### `railway volume`

Manages persistent volumes.

```bash
# List volumes
railway volume list

# Create volume
railway volume create [volume-name]

# Delete volume
railway volume delete [volume-name]

# Mount volume to service
railway volume mount [volume-name] [mount-path]
```

## Utilities

### `railway open`

Opens the Railway dashboard in browser.

```bash
# Open project dashboard
railway open

# Open specific service
railway open --service [service-name]
```

### `railway docs`

Opens Railway documentation.

```bash
# Open documentation
railway docs

# Open CLI documentation
railway docs cli
```

### `railway help`

Shows general or command-specific help.

```bash
# General help
railway help

# Help for a specific command
railway help deploy
```

## Global Options

All Railway commands support these global flags:

- `--help` ‒ Show help for command
- `--version` ‒ Show CLI version
- `--verbose` ‒ Enable verbose output
- `--json` ‒ Output in JSON format
- `--service <name>` ‒ Specify service for command
- `--environment <name>` ‒ Specify environment

## CI/CD Usage

To use Railway CLI in automated environments:

1. Set the `RAILWAY_TOKEN` environment variable
2. Use the `--ci` flag for deployments

```bash
# Set token (get from Railway dashboard)
export RAILWAY_TOKEN=your-token-here

# Deploy in CI mode
railway up --ci

# Deploy without prompts
railway deploy --yes
```

## Common Usage Examples

```bash
# Complete setup workflow
railway login
railway init my-app
railway add --database postgres
railway variables set NODE_ENV=production
railway up

# Development workflow
railway link
railway variables
railway shell
npm start

# Database management
railway add --database postgres
railway connect postgres
railway variables set DATABASE_URL=$(railway variables get DATABASE_URL)

# Domain management
railway domain generate
railway domain add mydomain.com
railway open

# Environment management
railway environment new staging
railway environment use staging
railway deploy

# Monitoring and debugging
railway logs --follow
railway status
railway ssh --service web

# Volume management
railway volume create app-data
railway volume mount app-data /app/data
railway volume list
```

## Template Deployment

```bash
# Deploy popular templates
railway deploy --template express
railway deploy --template nextjs
railway deploy --template django
railway deploy --template rails
railway deploy --template spring-boot

# Deploy from GitHub
railway deploy --repo https://github.com/user/repo
```

## Database Examples

```bash
# PostgreSQL setup
railway add --database postgres
railway variables set DATABASE_URL=$(railway variables get DATABASE_URL)
railway connect postgres

# MongoDB setup
railway add --database mongodb
railway variables set MONGO_URL=$(railway variables get MONGO_URL)
railway connect mongo

# Redis setup
railway add --database redis
railway variables set REDIS_URL=$(railway variables get REDIS_URL)
railway connect redis
```
