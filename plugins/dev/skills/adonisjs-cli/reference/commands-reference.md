# AdonisJS Ace CLI Commands Reference

Complete reference for all Ace CLI commands with detailed options and flags.

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
