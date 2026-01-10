# Vercel CLI Commands Reference

Complete reference for all Vercel CLI commands with detailed options and flags.

## Authentication & Configuration

### `vercel login`

Authenticate with Vercel.

```bash
# Interactive login
vercel login

# Show currently authenticated user
vercel whoami

# Logout
vercel logout
```

## Project Management

### `vercel project ls`

Lists all Vercel projects under the current scope.

```bash
# List all projects
vercel project ls

# List projects that require a Node.js update
vercel project ls --update-required
```

### `vercel project add`

Creates a new Vercel project.

```bash
vercel project add
```

### `vercel project rm`

Removes an existing Vercel project.

```bash
vercel project rm [project-name]
```

### `vercel init`

Initializes a new project in the current directory.

```bash
# Interactive template selection
vercel init

# Initialize a specific example/template
vercel init [example-name]
```

### `vercel link`

Links the current directory to an existing Vercel project.

```bash
vercel link
```

## Deployments

### `vercel` or `vercel deploy`

Deploys the project to Vercel (preview by default).

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod

# Deploy a pre-built project
vercel --prebuilt

# Specify deployment regions
vercel --regions sfo1,fra1

# Pass environment variables
vercel --env KEY=value

# Deploy from a specific directory
vercel --cwd /path/to/project
```

### `vercel list` or `vercel ls`

Lists all deployments for the current project.

```bash
# List deployments
vercel list

# Limit the number of results
vercel list --limit 10
```

### `vercel remove` or `vercel rm`

Deletes a specific deployment.

```bash
vercel remove [deployment-url]
```

### `vercel promote`

Promotes a preview deployment to production.

```bash
vercel promote [deployment-url]
```

### `vercel rollback`

Rolls back to a previous deployment.

```bash
vercel rollback [deployment-url]
```

### `vercel redeploy`

Redeploys an existing deployment.

```bash
vercel redeploy [deployment-url]
```

## Inspection & Debug

### `vercel inspect`

Shows detailed information about a deployment.

```bash
vercel inspect [deployment-url]
```

### `vercel logs`

Streams logs for a deployment.

```bash
# Show logs for a deployment
vercel logs [deployment-url]

# Follow logs in real-time
vercel logs --follow
```

### `vercel dev`

Runs a local development server that emulates the Vercel platform.

```bash
# Start the dev server
vercel dev

# Listen on a specific port
vercel dev --listen 3001

# Debug serverless functions
vercel dev --debug
```

### `vercel build`

Builds the project locally using the Vercel configuration.

```bash
vercel build
```

## Domain Management

### `vercel domains ls`

Lists all domains in the current scope.

```bash
# List domains
vercel domains ls

# Limit the number of results
vercel domains ls --limit 50
```

### `vercel domains add`

Adds a domain to a project.

```bash
# Add a domain to a project
vercel domains add example.com my-project

# Force transfer if domain is already linked elsewhere
vercel domains add example.com my-project --force
```

### `vercel domains rm`

Removes a domain.

```bash
# Remove a domain with confirmation
vercel domains rm example.com

# Remove without confirmation
vercel domains rm example.com --yes
```

### `vercel domains inspect`

Displays detailed information about a domain.

```bash
vercel domains inspect example.com
```

### `vercel domains buy`

Purchases a new domain via Vercel.

```bash
vercel domains buy example.com
```

### `vercel domains move`

Moves a domain to another scope.

```bash
vercel domains move example.com new-team
```

### `vercel domains transfer-in`

Transfers an external domain to Vercel.

```bash
vercel domains transfer-in example.com
```

## Environment Variables

### `vercel env ls`

Lists all environment variables for the project.

```bash
vercel env ls
```

### `vercel env add`

Adds a new environment variable.

```bash
# Interactive add
vercel env add

# Add a specific variable
vercel env add API_KEY
```

### `vercel env rm`

Removes an environment variable.

```bash
vercel env rm API_KEY
```

### `vercel env pull`

Exports environment variables to a local file.

```bash
# Create .env.local
vercel env pull .env.local

# Export for the development environment
vercel env pull --environment=development
```

### `vercel pull`

Pulls project settings and environment variables.

```bash
# Sync project settings locally
vercel pull

# Select environment
vercel pull --environment=preview
```

## Team Management

### `vercel teams ls`

Lists all teams.

```bash
vercel teams ls
```

### `vercel teams add`

Creates a new team.

```bash
vercel teams add
```

### `vercel switch`

Switches the active team.

```bash
# Interactive switch
vercel switch

# Switch directly by team name
vercel switch my-team
```

## DNS & Certificates

### `vercel dns ls`

Lists DNS records for a domain.

```bash
vercel dns ls example.com
```

### `vercel dns add`

Adds a DNS record.

```bash
vercel dns add example.com
```

### `vercel dns rm`

Removes a DNS record.

```bash
vercel dns rm [record-id]
```

### `vercel certs ls`

Lists SSL certificates.

```bash
vercel certs ls
```

### `vercel certs add`

Adds a custom SSL certificate.

```bash
vercel certs add
```

### `vercel certs rm`

Removes a SSL certificate.

```bash
vercel certs rm [cert-id]
```

## Git Integration

### `vercel git ls`

Lists connected Git repositories.

```bash
vercel git ls
```

### `vercel git connect`

Connects a Git repository to the project.

```bash
vercel git connect
```

### `vercel git disconnect`

Disconnects a Git repository from the project.

```bash
vercel git disconnect
```

## Utilities

### `vercel help`

Shows general or command-specific help.

```bash
# General help
vercel help

# Help for a specific command
vercel help deploy
```

### `vercel alias`

Manages deployment aliases (deprecated, prefer domains).

```bash
vercel alias ls
```

### `vercel bisect`

Helps debug by bisecting deployments.

```bash
vercel bisect
```

## Global Options

All Vercel commands support these global flags:

- `--cwd <dir>` ‒ Working directory
- `--debug` ‒ Enable verbose debug output
- `--global-config <dir>` ‒ Custom global config directory
- `--help` ‒ Show help
- `--local-config <file>` ‒ Custom local config file
- `--no-color` ‒ Disable colored output
- `--scope <team>` ‒ Run the command under a specific team scope
- `--token <token>` ‒ Authentication token (useful for CI/CD)

## Installation

```bash
# Install via bun (recommended)
bun add -g vercel

# Update to latest version
bun add -g vercel@latest

# Check CLI version
vercel --version
```
