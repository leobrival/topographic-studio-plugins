---
name: adonisjs-cli
description: AdonisJS Ace CLI expert for building TypeScript backend applications. Use when users need to scaffold, develop, build, or manage AdonisJS projects, run migrations, create models/controllers, or configure packages.
allowed-tools: Bash(node ace:*), Bash(npm run:*)
---

# AdonisJS Ace CLI Guide

AdonisJS is a TypeScript-first Node.js framework for building server-side applications. Ace is the command-line framework embedded into AdonisJS core. This guide provides essential workflows and quick references for common AdonisJS operations.

## Quick Start

```bash
# Create new AdonisJS project
npm init adonisjs@latest my-app

# Navigate to project
cd my-app

# Generate app key
node ace generate:key

# Start development server
node ace serve --hmr

# List all available commands
node ace list

# Get help for a command
node ace serve --help
```

## Common Workflows

### Workflow 1: API Project Setup

```bash
# Create API project
npm init adonisjs@latest my-api -- --kit=api

cd my-api

# Generate app key
node ace generate:key

# Install and configure database
node ace add @adonisjs/lucid

# Create initial model with migration
node ace make:model User -m

# Run migrations
node ace migration:run

# Start dev server with HMR
node ace serve --hmr
```

### Workflow 2: CRUD Resource Creation

```bash
# Create complete resource (model, migration, factory, controller)
node ace make:model Post -mfc

# Create validators for the resource
node ace make:validator post --resource

# Create service for business logic
node ace make:service post

# Edit migration file (database/migrations/xxxxx_posts.ts)
# Add table columns

# Run migration
node ace migration:run

# Create seeder for testing data
node ace make:seeder Post

# Run seeder
node ace db:seed
```

### Workflow 3: Database Management

```bash
# Create migration
node ace make:migration add_slug_to_posts

# Preview migration changes (dry run)
node ace migration:run --dry-run

# Run migrations
node ace migration:run

# Check migration status
node ace migration:status

# Rollback last batch
node ace migration:rollback

# Refresh database (reset + run)
node ace migration:refresh --seed
```

### Workflow 4: Authentication Setup

```bash
# Install authentication package
node ace add @adonisjs/auth

# Install session support
node ace add @adonisjs/session

# Create auth controllers
node ace make:controller auth/login
node ace make:controller auth/register

# Create auth middleware
node ace make:middleware auth

# Run auth migrations
node ace migration:run
```

### Workflow 5: Production Build

```bash
# Build application
node ace build

# Navigate to build directory
cd build

# Install production dependencies
npm ci --production

# Run migrations in production
node ace migration:run --force

# Start production server
node server.js
```

## Decision Tree

**When to use which command:**

- **To start development**: Use `node ace serve --hmr`
- **To create models**: Use `node ace make:model Name -mfc` (includes migration, factory, controller)
- **To create API controllers**: Use `node ace make:controller name --resource --api`
- **To manage database**: Use migration commands (`migration:run`, `migration:rollback`, `migration:status`)
- **To add packages**: Use `node ace add @adonisjs/package-name`
- **To validate input**: Use `node ace make:validator name --resource`
- **To view routes**: Use `node ace list:routes --middleware`
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For implementation patterns**: See [Common Patterns](./reference/common-patterns.md)
- **For debugging**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Creating Resource Controllers

```bash
# RESTful API controller
node ace make:controller posts --resource --api

# Generates controller with:
# - index()    GET /posts
# - store()    POST /posts
# - show()     GET /posts/:id
# - update()   PUT /posts/:id
# - destroy()  DELETE /posts/:id
```

### Model Relationships

```typescript
// One-to-Many (User has many Posts)
// app/models/user.ts
@hasMany(() => Post)
declare posts: HasMany<typeof Post>

// app/models/post.ts
@belongsTo(() => User)
declare user: BelongsTo<typeof User>

// Query with relationships
const user = await User.query().preload('posts')
const post = await Post.query().preload('user').first()
```

### Request Validation

```typescript
// Create validator: node ace make:validator post --resource
// app/validators/post.ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255),
    content: vine.string().minLength(10),
    isPublished: vine.boolean().optional(),
  })
)

// Use in controller
const payload = await request.validateUsing(createPostValidator)
```

### Database Migrations

```typescript
// Create table migration
export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.integer('user_id').unsigned()
        .references('users.id').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

### Authentication Patterns

```typescript
// Session-based login
export default class LoginController {
  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)
    return response.redirect('/dashboard')
  }
}

// API token generation
export default class TokensController {
  async store({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)
    return response.created({ token: token.value!.release() })
  }
}
```

## Troubleshooting

**Common Issues:**

1. **Server won't start**
   - Quick fix: Check if port is in use `lsof -i :3333`
   - Generate APP_KEY: `node ace generate:key`
   - See: [Server Issues](./reference/troubleshooting.md#server-wont-start)

2. **Migration fails**
   - Quick fix: Check migration status `node ace migration:status`
   - Verify database connection in `.env`
   - See: [Migration Fails](./reference/troubleshooting.md#migration-fails)

3. **Database connection refused**
   - Quick fix: Verify database is running and `.env` credentials
   - Test connection: `psql -h localhost -U postgres`
   - See: [Cannot Connect to Database](./reference/troubleshooting.md#cannot-connect-to-database)

4. **Validation always fails**
   - Quick fix: Ensure validator is compiled `vine.compile(schema)`
   - Check field names match request data
   - See: [Validation Issues](./reference/troubleshooting.md#validation-always-fails)

5. **Route not found (404)**
   - Quick fix: List routes with `node ace list:routes`
   - Check route order (specific before wildcards)
   - See: [Route Not Found](./reference/troubleshooting.md#route-not-found-404)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete Ace CLI command documentation with all flags and options. Use when you need exact syntax, flag details, or comprehensive command documentation.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns for CRUD resources, authentication, validation, relationships, events, testing, and production deployment. Use for implementing specific features or architectural patterns.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for server, database, authentication, routing, build, and performance issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact command syntax, flag combinations, or comprehensive CLI documentation
- Use **Common Patterns** for implementing CRUD operations, authentication flows, database relationships, or production deployments
- Use **Troubleshooting** when server won't start, migrations fail, authentication breaks, or you encounter build/performance issues

## Resources

- Official Docs: https://docs.adonisjs.com
- Ace CLI Docs: https://docs.adonisjs.com/guides/ace
- Lucid ORM: https://lucid.adonisjs.com
- GitHub: https://github.com/adonisjs/core
- Community: https://discord.gg/vDcEjq6
