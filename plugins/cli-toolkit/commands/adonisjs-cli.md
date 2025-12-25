---
title: AdonisJS CLI (Ace)
description: AdonisJS Ace CLI commands for building and managing backend applications
allowed-tools: [Bash(node ace *), Bash(npm *), Bash(pnpm *)]
---

Comprehensive documentation of the AdonisJS Ace CLI for building, testing, and managing AdonisJS backend applications with TypeScript.

## Introduction

Ace is the command-line framework embedded into AdonisJS core. All commands are executed using `node ace` from your project root.

## Basic Usage

```bash
# Show all available commands
node ace
node ace list

# Get help for a specific command
node ace [command] --help

# Execute a command
node ace [command] [arguments] [flags]
```

## Global Options

```bash
# Force enable colored output
node ace [command] --ansi

# Disable colors (useful in CI environments)
node ace [command] --no-ansi
```

## Core Commands

### `serve`

Starts the development server with file watching and hot module replacement.

```bash
# Start development server
node ace serve

# Start with HMR (Hot Module Replacement)
node ace serve --hmr

# Start with file watching
node ace serve --watch

# Start with polling (useful for Docker/WSL)
node ace serve --poll

# Start without clearing console
node ace serve --no-clear

# Start without building assets
node ace serve --no-assets

# Pass arguments to asset bundler
node ace serve --assets-args="--debug"
```

### `build`

Creates a production-ready application build.

```bash
# Build for production
node ace build

# Ignore TypeScript errors during build
node ace build --ignore-ts-errors

# Specify package manager
node ace build --package-manager=pnpm

# Build without assets
node ace build --no-assets

# Pass arguments to asset bundler
node ace build --assets-args="--minify"
```

### `add`

Installs and configures a package in one command.

```bash
# Install and configure a package
node ace add @adonisjs/lucid

# Install as dev dependency
node ace add my-package --dev

# Verbose output
node ace add @adonisjs/auth --verbose

# Force configuration (skip prompts)
node ace add @adonisjs/mail --force

# Specify package manager
node ace add @adonisjs/redis --package-manager=pnpm
```

### `configure`

Sets up a pre-installed package.

```bash
# Configure an already installed package
node ace configure @adonisjs/lucid

# Verbose output
node ace configure @adonisjs/auth --verbose

# Force configuration (skip prompts)
node ace configure @adonisjs/mail --force
```

### `eject`

Extracts customizable stub files to your application.

```bash
# Eject a stub file
node ace eject make/controller

# Eject from a specific package
node ace eject make/policy --pkg=@adonisjs/bouncer
```

## Generation Commands

### `generate:key`

Creates a secure random encryption key for `.env` file.

```bash
# Generate and display key
node ace generate:key

# Show key without prompting
node ace generate:key --show

# Force overwrite existing key
node ace generate:key --force
```

### `make:controller`

Generates HTTP controller classes.

```bash
# Create a controller
node ace make:controller users

# Create controller with specific actions
node ace make:controller users index show store

# Create singular resource controller
node ace make:controller user --singular

# Create RESTful resource controller
node ace make:controller user --resource

# Create API resource controller (no create/edit views)
node ace make:controller user --api
```

### `make:model`

Creates Lucid model classes.

```bash
# Create a model
node ace make:model User

# Create model with migration
node ace make:model User -m

# Create model with factory
node ace make:model User -f

# Create model with controller
node ace make:model User -c

# Create model with migration, factory, and controller
node ace make:model User -mfc
```

### `make:middleware`

Creates HTTP request middleware.

```bash
# Create middleware
node ace make:middleware bodyparser

# Create server middleware
node ace make:middleware bodyparser --stack=server

# Create named middleware
node ace make:middleware auth --stack=named

# Create router middleware
node ace make:middleware throttle --stack=router
```

### `make:validator`

Creates VineJS validator files.

```bash
# Create a validator
node ace make:validator user

# Create resource validator (with store/update)
node ace make:validator user --resource
```

### `make:service`

Creates service classes for business logic.

```bash
# Create a service
node ace make:service invoice

# Create a service in subdirectory
node ace make:service payments/stripe
```

### `make:event`

Generates event classes.

```bash
# Create an event
node ace make:event orderShipped

# Create an event in subdirectory
node ace make:event orders/shipped
```

### `make:listener`

Generates event listener classes.

```bash
# Create a listener
node ace make:listener sendShipmentNotification

# Create listener for specific event
node ace make:listener sendNotification --event=orderShipped
```

### `make:exception`

Generates custom exception classes.

```bash
# Create an exception
node ace make:exception commandValidation

# Create an exception in subdirectory
node ace make:exception validation/command
```

### `make:command`

Creates new Ace CLI commands.

```bash
# Create a command
node ace make:command listRoutes

# Create a command in subdirectory
node ace make:command admin/cleanup
```

### `make:view`

Generates Edge.js template files.

```bash
# Create a view
node ace make:view posts/create

# Create nested view
node ace make:view admin/users/index
```

### `make:provider`

Creates service provider files.

```bash
# Create a provider
node ace make:provider app

# Create provider for specific environments
node ace make:provider analytics --environments=web,console
node ace make:provider analytics -e=web -e=console
```

### `make:preload`

Generates preload files for initialization.

```bash
# Create a preload file
node ace make:preload view

# Create preload for specific environments
node ace make:preload routes --environments=web
node ace make:preload events -e=web -e=console
```

### `make:test`

Creates test files.

```bash
# Create a test
node ace make:test user

# Create test in specific suite
node ace make:test user --suite=unit
node ace make:test auth --suite=functional
```

### `make:mail`

Generates mail notification classes.

```bash
# Create a mail class
node ace make:mail shipment

# Create confirmation mail
node ace make:mail verification --intent=confirmation
```

### `make:policy`

Creates Bouncer policy classes.

```bash
# Create a policy
node ace make:policy post

# Create a policy for specific model
node ace make:policy comment
```

## Database Commands (Lucid)

### Migration Commands

```bash
# Create a new migration
node ace make:migration users

# Create migration with model
node ace make:model User -m

# Run all pending migrations
node ace migration:run

# Preview migration changes (dry run)
node ace migration:run --dry-run

# Force run migrations in production
node ace migration:run --force

# Run migrations and seed database
node ace migration:run --seed

# Rollback latest batch
node ace migration:rollback

# Rollback specific batch
node ace migration:rollback --batch=1

# Rollback to beginning
node ace migration:rollback --batch=0

# Rollback last N migrations
node ace migration:rollback --step=3

# Reset all migrations (rollback all)
node ace migration:reset

# Refresh migrations (reset + run)
node ace migration:refresh

# Refresh and seed
node ace migration:refresh --seed

# Fresh migrations (drop all tables + run)
node ace migration:fresh

# Fresh and seed
node ace migration:fresh --seed

# Check migration status
node ace migration:status
```

### Seeder Commands

```bash
# Create a seeder
node ace make:seeder User

# Run all seeders
node ace db:seed

# Run specific seeder files
node ace db:seed --files "./database/seeders/user_seeder.ts"

# Run multiple seeders
node ace db:seed --files "./database/seeders/user_seeder.ts" --files "./database/seeders/post_seeder.ts"

# Interactive seeder selection
node ace db:seed -i

# Seed specific database connection
node ace db:seed --connection=tenant-1
```

### Factory Commands

```bash
# Create a factory
node ace make:factory User

# Create model with factory
node ace make:model User -f
```

### Database Utility Commands

```bash
# Wipe database (drop all tables)
node ace db:wipe

# Wipe specific connection
node ace db:wipe --connection=pg

# Truncate all tables
node ace db:truncate

# Seed after truncate
node ace db:truncate --seed
```

## Utility Commands

### `list:routes`

Shows all registered application routes.

```bash
# List all routes
node ace list:routes

# Output as JSON
node ace list:routes --json

# Output as table (default)
node ace list:routes --table

# Show middleware for each route
node ace list:routes --middleware

# Hide middleware column
node ace list:routes --ignore-middleware
```

### `inspect:rcfile`

Displays merged `adonisrc.ts` configuration.

```bash
# Inspect configuration
node ace inspect:rcfile
```

### `env:add`

Adds environment variables to `.env` files with validation.

```bash
# Interactive mode
node ace env:add

# Add specific variable
node ace env:add MY_VARIABLE value

# Add with type validation
node ace env:add API_KEY secret --type=string
node ace env:add DEBUG true --type=boolean
node ace env:add PORT 3333 --type=number

# Add enum variable
node ace env:add NODE_ENV production --type=enum --enum-values=development,staging,production
```

## Authentication Commands (Auth)

```bash
# Create authentication scaffolding
node ace make:auth

# Create auth controller
node ace make:controller auth/login

# Create auth middleware
node ace make:middleware auth
```

## Testing Commands

```bash
# Run all tests
node ace test

# Run specific test file
node ace test tests/unit/user.spec.ts

# Run tests in watch mode
node ace test --watch

# Run tests with coverage
node ace test --coverage
```

## Command Aliases

Define shortcuts in `adonisrc.ts`:

```typescript
export default {
  commandsAliases: {
    // Shortcut for creating resource controllers
    resource: "make:controller --resource --singular",

    // Shortcut for migration refresh with seed
    migrate: "migration:refresh --seed",

    // Shortcut for creating full model stack
    model: "make:model -mfc",
  },
};
```

**Usage:**

```bash
# Use alias
node ace resource admin

# Expands to
node ace make:controller --resource --singular admin
```

## Programmatic Command Execution

Execute commands within your application code:

```typescript
import ace from "@adonisjs/core/services/ace";

// Boot ace
await ace.boot();

// Check if command exists
if (ace.hasCommand("make:controller")) {
  // Execute command
  const command = await ace.exec("make:controller", ["user", "--resource"]);

  // Check results
  console.log(command.exitCode);
  console.log(command.result);
  console.log(command.error);
}
```

## Creating Custom Commands

### Basic Command Structure

```bash
# Create a new command
node ace make:command greet
```

**Generated file (`commands/greet.ts`):**

```typescript
import { BaseCommand } from "@adonisjs/core/ace";
import { args, flags } from "@adonisjs/core/ace";

export default class Greet extends BaseCommand {
  static commandName = "greet";
  static description = "Greet a user by name";

  @args.string({ description: "Name of the person to greet" })
  declare name: string;

  @flags.boolean({ description: "Display greeting in uppercase" })
  declare loud: boolean;

  async run() {
    const greeting = `Hello ${this.name}!`;

    if (this.loud) {
      this.logger.info(greeting.toUpperCase());
    } else {
      this.logger.info(greeting);
    }
  }
}
```

**Usage:**

```bash
node ace greet John
node ace greet John --loud
```

## Common Workflows

### New Project Setup

```bash
# Create new AdonisJS project
npm init adonisjs@latest my-app

# Navigate to project
cd my-app

# Generate app key
node ace generate:key

# Configure database
node ace configure @adonisjs/lucid

# Run migrations
node ace migration:run

# Seed database
node ace db:seed

# Start development server
node ace serve --hmr
```

### Database Workflow

```bash
# Create model with migration, factory, and controller
node ace make:model Post -mfc

# Edit migration file
# database/migrations/xxxxx_posts.ts

# Run migration
node ace migration:run

# Create seeder
node ace make:seeder Post

# Run seeder
node ace db:seed

# Check migration status
node ace migration:status
```

### Development Workflow

```bash
# Start dev server with HMR
node ace serve --hmr

# In another terminal: run tests in watch mode
node ace test --watch

# Create new feature
node ace make:controller posts --resource
node ace make:model Post -m
node ace make:validator post --resource
node ace make:service post

# List all routes
node ace list:routes --middleware
```

### Production Build

```bash
# Build application
node ace build --ignore-ts-errors

# Navigate to build directory
cd build

# Install production dependencies
npm ci --production

# Run migrations
node ace migration:run --force

# Start production server
node server.js
```

## Environment-Specific Operations

### Development

```bash
# Start with HMR
node ace serve --hmr

# Create test database
node ace db:seed
```

### Testing

```bash
# Run migrations for test DB
NODE_ENV=test node ace migration:run

# Refresh test data
NODE_ENV=test node ace migration:fresh --seed

# Run tests
node ace test
```

### Production

```bash
# Build for production
node ace build

# Run migrations (requires --force)
node ace migration:run --force

# Never rollback in production!
# node ace migration:rollback  # ⚠️ DANGEROUS
```

## Debugging Commands

```bash
# Verbose output for debugging
node ace [command] --verbose

# View configuration
node ace inspect:rcfile

# Check routes
node ace list:routes --middleware

# Verify migration status
node ace migration:status
```

## Best Practices

### Command Usage

- Use `--help` flag to understand command options
- Prefer `pnpm` or `yarn` for faster package management
- Use command aliases for frequently used operations
- Always check migration status before running
- Use `--dry-run` to preview migration changes

### Database Management

- Never rollback migrations in production
- Use seeders for development data only
- Create separate seeders for production data
- Use factories for testing data generation
- Always backup before running fresh migrations

### Development

- Use HMR for faster development: `node ace serve --hmr`
- Create resource controllers for RESTful APIs
- Use validators for input validation
- Organize code with services for business logic
- Use preload files for app initialization

### Production

- Always build before deploying: `node ace build`
- Use `--force` flag for production migrations
- Never commit `.env` file
- Use environment-specific configuration
- Monitor logs and error tracking

## Troubleshooting

### Common Issues

```bash
# Command not found
node ace list  # Check available commands

# Module not found errors
npm install  # Reinstall dependencies
node ace build  # Rebuild application

# Migration errors
node ace migration:status  # Check migration state
node ace migration:rollback  # Rollback if needed

# Database connection issues
# Check .env file for correct credentials
node ace env:add DB_CONNECTION pg
```

## Resources

- **Official Docs**: <https://docs.adonisjs.com>
- **Ace Documentation**: <https://docs.adonisjs.com/guides/ace>
- **Lucid ORM**: <https://lucid.adonisjs.com>
- **GitHub**: <https://github.com/adonisjs/core>
- **Community**: <https://discord.gg/vDcEjq6>

## Package-Specific Commands

### After Installing Packages

```bash
# Install Lucid (ORM)
node ace add @adonisjs/lucid

# Install Auth
node ace add @adonisjs/auth

# Install Mail
node ace add @adonisjs/mail

# Install Redis
node ace add @adonisjs/redis

# Install Bouncer (Authorization)
node ace add @adonisjs/bouncer

# Install Ally (Social Auth)
node ace add @adonisjs/ally

# Install Shield (Security)
node ace add @adonisjs/shield

# Install Session
node ace add @adonisjs/session

# Install I18n
node ace add @adonisjs/i18n

# Install Drive (File Storage)
node ace add @adonisjs/drive

# Install Limiter (Rate Limiting)
node ace add @adonisjs/limiter
```

Each package adds its own commands after installation. Use `node ace list` to see all available commands.
