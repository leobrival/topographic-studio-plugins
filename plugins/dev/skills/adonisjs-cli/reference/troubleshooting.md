# AdonisJS Troubleshooting Guide

Common issues and solutions for AdonisJS development.

## Server Issues

### Server Won't Start

**Symptom:** `node ace serve` fails immediately

**Diagnosis:**

```bash
# Check for syntax errors
npm run typecheck

# View detailed error output
node ace serve --no-clear

# Check if port is already in use
lsof -i :3333
```

**Common Causes:**

1. **Port already in use**
   ```bash
   # Solution: Kill process using the port
   lsof -i :3333
   kill -9 <PID>

   # Or use different port in .env
   PORT=3334
   ```

2. **Missing APP_KEY**
   ```bash
   # Solution: Generate app key
   node ace generate:key
   ```

3. **Module not found errors**
   ```bash
   # Solution: Reinstall dependencies
   npm install

   # Clear build cache
   rm -rf build/
   node ace serve
   ```

4. **TypeScript compilation errors**
   ```bash
   # Solution: Fix type errors or ignore temporarily
   node ace serve --ignore-ts-errors
   ```

### Hot Module Replacement Not Working

**Symptom:** Changes don't reflect without manual restart

**Diagnosis:**

```bash
# Check if HMR is enabled
node ace serve --hmr

# For Docker/WSL, use polling
node ace serve --hmr --poll
```

**Solutions:**

```bash
# Enable HMR
node ace serve --hmr

# For file systems that don't support watch (Docker, WSL, VMs)
node ace serve --poll

# Disable asset building if causing issues
node ace serve --no-assets
```

## Database Issues

### Migration Fails

**Symptom:** `node ace migration:run` throws error

**Diagnosis:**

```bash
# Check migration status
node ace migration:status

# Check database connection
# Verify .env credentials

# View migration file for syntax errors
cat database/migrations/xxxxx_migration_name.ts
```

**Common Errors:**

**Error: "Table already exists"**
```bash
# Solution: Check migration status and rollback if needed
node ace migration:status
node ace migration:rollback

# Or reset and re-run
node ace migration:reset
node ace migration:run
```

**Error: "Connection refused"**
```bash
# Solution: Check database is running
# For PostgreSQL
pg_isready

# For MySQL
mysql -u root -p -e "status"

# Verify .env configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_DATABASE=mydb
```

**Error: "Syntax error in migration"**
```bash
# Solution: Check migration file syntax
# Common issues:
# - Missing commas in table definitions
# - Incorrect method names
# - Missing references setup

# Example fix:
this.schema.createTable(this.tableName, (table) => {
  table.increments('id')
  table.string('name')  // Missing comma
  table.integer('user_id').unsigned()
    .references('id').inTable('users')  // Proper reference
})
```

### Cannot Connect to Database

**Symptom:** Database connection timeout or refused

**Diagnosis:**

```bash
# Test database connection manually
# PostgreSQL
psql -h localhost -U postgres -d mydb

# MySQL
mysql -h localhost -u root -p mydb

# Check if database server is running
# PostgreSQL
pg_isready

# MySQL
mysqladmin ping
```

**Solutions:**

```bash
# Verify .env configuration
DB_CONNECTION=pg
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_DATABASE=your_database

# For Docker containers, use container name as host
DB_HOST=postgres  # If using docker-compose with service named 'postgres'

# Check firewall rules
sudo ufw status

# Ensure database accepts connections
# Edit PostgreSQL pg_hba.conf or MySQL config
```

### Lucid Model Not Found

**Symptom:** "Cannot find module '#models/user'"

**Solutions:**

```bash
# Ensure path aliases are configured in adonisrc.ts
{
  "alias": {
    "#models": "./app/models"
  }
}

# Restart TypeScript server in IDE
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS server"

# Check model file exists
ls app/models/user.ts
```

## Authentication Issues

### Session Not Persisting

**Symptom:** User gets logged out on every request

**Diagnosis:**

```bash
# Check if session middleware is registered
# start/kernel.ts should have:
router.use([
  () => import('@adonisjs/session/session_middleware')
])

# Verify APP_KEY is set in .env
echo $APP_KEY
```

**Solutions:**

```bash
# Generate APP_KEY if missing
node ace generate:key

# Ensure session package is installed
node ace add @adonisjs/session

# Check session driver in config/session.ts
{
  driver: env.get('SESSION_DRIVER', 'cookie')
}

# For Redis sessions, ensure Redis is running
redis-cli ping
```

### Invalid Credentials Error

**Symptom:** Login fails with valid credentials

**Diagnosis:**

```typescript
// Check password hashing in User model
import hash from '@adonisjs/core/services/hash'

export default class User extends BaseModel {
  @column({ serializeAs: null })
  declare password: string

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}
```

**Solutions:**

```bash
# Verify User model has hash import
# Check verifyCredentials method implementation
# Ensure password is hashed before saving

# Test manually
node ace tinker
const user = await User.findBy('email', 'test@example.com')
await hash.verify(user.password, 'plain_password')
```

### Token Authentication Not Working

**Symptom:** API token returns 401 Unauthorized

**Diagnosis:**

```bash
# Check auth middleware is applied
# start/routes.ts
router.group(() => {
  // Protected routes
}).use(middleware.auth())

# Verify token in request headers
# Authorization: Bearer <token>
```

**Solutions:**

```typescript
// Ensure token guard is configured in config/auth.ts
{
  guards: {
    api: {
      driver: 'access_tokens',
      provider: {
        driver: 'lucid',
        model: () => import('#models/user')
      }
    }
  }
}

// Check token is sent correctly
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3333/api/user
```

## Validation Issues

### Validation Always Fails

**Symptom:** Request validation returns errors for valid data

**Diagnosis:**

```typescript
// Check validator definition
import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(8)
  })
)
```

**Solutions:**

```typescript
// Ensure validator is compiled
export const validator = vine.compile(schema)  // Correct
// Not: export const validator = vine.object(...)  // Wrong

// Check field names match request data
const payload = await request.validateUsing(validator)

// Debug incoming data
console.log(request.all())
console.log(request.body())
```

### Custom Validation Rule Not Working

**Symptom:** Custom rule not being executed

**Solutions:**

```typescript
// Ensure rule is async and properly defined
import vine from '@vinejs/vine'

const uniqueEmail = vine.createRule(async (value, options, field) => {
  const user = await User.findBy('email', value)
  if (user) {
    field.report('Email already taken', 'unique', field)
  }
})

// Use the rule correctly
vine.string().email().use(uniqueEmail())  // Note the ()
```

## Routing Issues

### Route Not Found (404)

**Symptom:** Request returns 404 for defined route

**Diagnosis:**

```bash
# List all registered routes
node ace list:routes

# Check if route matches exactly
node ace list:routes | grep "/posts"

# Verify HTTP method matches
GET /posts vs POST /posts
```

**Solutions:**

```typescript
// Check route is defined in start/routes.ts
router.get('/posts', [PostsController, 'index'])

// Ensure route comes before wildcards
router.get('/posts/featured', ...)  // Must be before...
router.get('/posts/:id', ...)       // ...this wildcard route

// For grouped routes, check prefix
router.group(() => {
  router.get('/posts', [PostsController, 'index'])
}).prefix('/api')  // Route is actually /api/posts
```

### Middleware Not Executing

**Symptom:** Middleware doesn't run on route

**Diagnosis:**

```bash
# Check middleware registration
# start/kernel.ts

# List routes with middleware
node ace list:routes --middleware
```

**Solutions:**

```typescript
// Apply middleware to route
router.get('/admin', [AdminController, 'index'])
  .use(middleware.auth())

// Or to route group
router.group(() => {
  // Routes
}).use(middleware.auth())

// Ensure middleware is registered
// start/kernel.ts
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware')
})
```

## Build & Production Issues

### Build Fails

**Symptom:** `node ace build` throws errors

**Diagnosis:**

```bash
# Check TypeScript errors
npm run typecheck

# View detailed build output
node ace build --verbose

# Check for circular dependencies
```

**Solutions:**

```bash
# Fix TypeScript errors first
npm run typecheck

# Ignore errors temporarily (not recommended)
node ace build --ignore-ts-errors

# Clear build directory
rm -rf build/
node ace build

# Check tsconfig.json for correct paths
{
  "compilerOptions": {
    "outDir": "./build",
    "rootDir": "./"
  }
}
```

### Production Server Crashes

**Symptom:** Built app crashes on `node server.js`

**Diagnosis:**

```bash
# Check production logs
NODE_ENV=production node server.js

# Verify environment variables
cat .env

# Check if production dependencies are installed
npm ci --production
```

**Common Issues:**

1. **Missing APP_KEY**
   ```bash
   # Solution: Set in production .env
   APP_KEY=your_production_key
   ```

2. **Database connection in production**
   ```bash
   # Run migrations with force flag
   node ace migration:run --force

   # Check production DB credentials
   ```

3. **Port configuration**
   ```bash
   # Use PORT environment variable
   PORT=80 node server.js

   # Or set in .env
   PORT=80
   HOST=0.0.0.0
   ```

## Performance Issues

### Slow Query Performance

**Symptom:** API responses are slow

**Diagnosis:**

```typescript
// Enable query logging
// config/database.ts
{
  connection: 'pg',
  connections: {
    pg: {
      debug: true  // Shows queries in console
    }
  }
}
```

**Solutions:**

```typescript
// Add indexes in migrations
this.schema.alterTable('posts', (table) => {
  table.index('user_id')
  table.index(['is_published', 'created_at'])
})

// Use preload instead of N+1 queries
// Bad: N+1 queries
const posts = await Post.all()
for (const post of posts) {
  await post.load('user')  // N queries
}

// Good: Single query with join
const posts = await Post.query().preload('user')

// Use pagination
const posts = await Post.query().paginate(page, 20)
```

### Memory Leaks

**Symptom:** Server memory usage keeps growing

**Solutions:**

```typescript
// Close database connections properly
// Don't keep models in memory unnecessarily

// Use streams for large datasets
const stream = Post.query().stream()
for await (const post of stream) {
  // Process one at a time
}

// Limit query results
const posts = await Post.query().limit(100)
```

## Testing Issues

### Tests Failing

**Symptom:** Tests fail unexpectedly

**Diagnosis:**

```bash
# Run specific test
node ace test tests/functional/posts.spec.ts

# Run with verbose output
node ace test --verbose

# Check test database configuration
```

**Solutions:**

```typescript
// Use test database
// config/database.ts
{
  connection: env.get('DB_CONNECTION'),
  connections: {
    pg: {
      client: 'pg',
      connection: {
        database: env.get('DB_DATABASE') + '_test'  // Separate test DB
      }
    }
  }
}

// Reset database before tests
test.group('Posts', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })
})
```

## Common Error Messages

### "Cannot find module"

```bash
# Solution: Check import paths and aliases
# Ensure adonisrc.ts has correct alias configuration
# Restart TypeScript server in IDE
```

### "E_INVALID_SESSION_DRIVER"

```bash
# Solution: Install session package
node ace add @adonisjs/session

# Configure session driver in config/session.ts
```

### "E_UNAUTHORIZED_ACCESS"

```bash
# Solution: Check authentication middleware
# Verify user is logged in
# Check token in Authorization header
```

### "ECONNREFUSED"

```bash
# Solution: Database server not running
# Start PostgreSQL: pg_ctl start
# Start MySQL: mysql.server start
# Check connection details in .env
```

## Debug Tools

### Useful Debug Commands

```bash
# List all routes with details
node ace list:routes --middleware

# Inspect configuration
node ace inspect:rcfile

# Check migration status
node ace migration:status

# Test with tinker (REPL)
node ace tinker

# Check TypeScript compilation
npm run typecheck

# View database seeders
ls database/seeders/
```

### Enable Debug Mode

```typescript
// .env
NODE_ENV=development
LOG_LEVEL=debug

// config/app.ts
{
  logger: {
    enabled: true,
    level: env.get('LOG_LEVEL', 'info')
  }
}

// In code
import logger from '@adonisjs/core/services/logger'

logger.debug('Debug message', { data })
logger.info('Info message')
logger.error('Error occurred', error)
```
