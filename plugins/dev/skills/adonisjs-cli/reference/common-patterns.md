# AdonisJS Common Patterns

Real-world patterns and workflows for common AdonisJS development scenarios.

## Project Setup Patterns

### New API Project

```bash
# Create new AdonisJS project
npm init adonisjs@latest my-api -- --kit=api

# Navigate to project
cd my-api

# Generate app key
node ace generate:key

# Install database package
node ace add @adonisjs/lucid

# Configure database connection
node ace configure @adonisjs/lucid

# Create initial migration
node ace make:migration users

# Run migrations
node ace migration:run

# Start development server
node ace serve --hmr
```

### Full-Stack Web App Setup

```bash
# Create with web starter kit
npm init adonisjs@latest my-app -- --kit=web

cd my-app

# Generate app key
node ace generate:key

# Add database
node ace add @adonisjs/lucid

# Add authentication
node ace add @adonisjs/auth

# Add session support
node ace add @adonisjs/session

# Add CSRF protection
node ace add @adonisjs/shield

# Run migrations
node ace migration:run

# Start dev server with HMR
node ace serve --hmr
```

## CRUD Resource Patterns

### Complete Resource Workflow

```bash
# Create model with migration, factory, and controller
node ace make:model Post -mfc

# Create validator for the resource
node ace make:validator post --resource

# Create service for business logic
node ace make:service post

# Create policy for authorization
node ace make:policy post

# Run migration
node ace migration:run

# Create seeder for testing
node ace make:seeder Post

# Run seeder
node ace db:seed
```

### Controller Structure

**RESTful API Controller:**

```typescript
// app/controllers/posts_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { createPostValidator, updatePostValidator } from '#validators/post'

export default class PostsController {
  // GET /posts
  async index({ response }: HttpContext) {
    const posts = await Post.all()
    return response.ok(posts)
  }

  // POST /posts
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    const post = await Post.create(payload)
    return response.created(post)
  }

  // GET /posts/:id
  async show({ params, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    return response.ok(post)
  }

  // PUT /posts/:id
  async update({ params, request, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    const payload = await request.validateUsing(updatePostValidator)
    await post.merge(payload).save()
    return response.ok(post)
  }

  // DELETE /posts/:id
  async destroy({ params, response }: HttpContext) {
    const post = await Post.findOrFail(params.id)
    await post.delete()
    return response.noContent()
  }
}
```

### Migration Patterns

**Basic Table Creation:**

```typescript
// database/migrations/xxxxx_create_posts_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('content').notNullable()
      table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
      table.boolean('is_published').defaultTo(false)
      table.timestamp('published_at').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

**Add Column Migration:**

```typescript
// database/migrations/xxxxx_add_slug_to_posts.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug').unique().notNullable().after('title')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug')
    })
  }
}
```

### Model Relationships

**One-to-Many:**

```typescript
// app/models/user.ts
import { BaseModel, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'

export default class User extends BaseModel {
  @hasMany(() => Post)
  declare posts: HasMany<typeof Post>
}

// app/models/post.ts
import { BaseModel, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class Post extends BaseModel {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

// Usage in controller
const user = await User.query().preload('posts')
const post = await Post.query().preload('user').first()
```

**Many-to-Many:**

```typescript
// app/models/post.ts
import { BaseModel, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Tag from '#models/tag'

export default class Post extends BaseModel {
  @manyToMany(() => Tag)
  declare tags: ManyToMany<typeof Tag>
}

// app/models/tag.ts
import { BaseModel, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Post from '#models/post'

export default class Tag extends BaseModel {
  @manyToMany(() => Post)
  declare posts: ManyToMany<typeof Post>
}

// Usage
const post = await Post.query().preload('tags')
await post.related('tags').attach([1, 2, 3])
await post.related('tags').detach([2])
```

## Validation Patterns

### Resource Validator

```typescript
// app/validators/post.ts
import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255),
    content: vine.string().minLength(10),
    isPublished: vine.boolean().optional(),
  })
)

export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().minLength(3).maxLength(255).optional(),
    content: vine.string().minLength(10).optional(),
    isPublished: vine.boolean().optional(),
  })
)
```

### Custom Validation Rules

```typescript
// app/validators/user.ts
import vine from '@vinejs/vine'

const uniqueEmail = vine.createRule(async (value, options, field) => {
  const user = await User.findBy('email', value)
  if (user) {
    field.report('The email has already been taken', 'unique', field)
  }
})

export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().use(uniqueEmail()),
    password: vine.string().minLength(8),
  })
)
```

## Authentication Patterns

### Session Authentication Setup

```bash
# Install required packages
node ace add @adonisjs/auth
node ace add @adonisjs/session

# Create auth scaffolding
node ace make:controller auth/login
node ace make:controller auth/register
node ace make:middleware auth
```

**Login Controller:**

```typescript
// app/controllers/auth/login_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class LoginController {
  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)
    await auth.use('web').login(user)

    return response.redirect('/dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect('/login')
  }
}
```

### API Token Authentication

```typescript
// app/controllers/auth/tokens_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class TokensController {
  async store({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return response.created({ token: token.value!.release() })
  }

  async destroy({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.noContent()
  }
}
```

## Service Layer Pattern

```typescript
// app/services/post_service.ts
import Post from '#models/post'
import type { CreatePostData, UpdatePostData } from '#types/post'

export default class PostService {
  async createPost(userId: number, data: CreatePostData) {
    const post = await Post.create({
      ...data,
      userId,
    })

    // Additional business logic
    await this.notifySubscribers(post)

    return post
  }

  async updatePost(postId: number, data: UpdatePostData) {
    const post = await Post.findOrFail(postId)
    await post.merge(data).save()

    return post
  }

  async publishPost(postId: number) {
    const post = await Post.findOrFail(postId)

    post.isPublished = true
    post.publishedAt = DateTime.now()

    await post.save()
    await this.notifySubscribers(post)

    return post
  }

  private async notifySubscribers(post: Post) {
    // Business logic for notifications
  }
}
```

**Usage in Controller:**

```typescript
// app/controllers/posts_controller.ts
import PostService from '#services/post_service'

export default class PostsController {
  async store({ request, auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const data = await request.validateUsing(createPostValidator)

    const postService = new PostService()
    const post = await postService.createPost(user.id, data)

    return response.created(post)
  }
}
```

## Event-Driven Patterns

### Event and Listener Setup

```bash
# Create event
node ace make:event order_placed

# Create listener
node ace make:listener send_order_confirmation --event=order_placed
```

**Event Class:**

```typescript
// app/events/order_placed.ts
import { BaseEvent } from '@adonisjs/core/events'
import type Order from '#models/order'

export default class OrderPlaced extends BaseEvent {
  constructor(public order: Order) {
    super()
  }
}
```

**Listener Class:**

```typescript
// app/listeners/send_order_confirmation.ts
import emitter from '@adonisjs/core/services/emitter'
import mail from '@adonisjs/mail/services/main'
import OrderPlaced from '#events/order_placed'

export default class SendOrderConfirmation {
  async handle(event: OrderPlaced) {
    await mail.send((message) => {
      message
        .to(event.order.email)
        .subject('Order Confirmation')
        .htmlView('emails/order_confirmation', { order: event.order })
    })
  }
}

// Register listener
emitter.on(OrderPlaced, [SendOrderConfirmation])
```

**Emit Event:**

```typescript
// In controller or service
import emitter from '@adonisjs/core/services/emitter'
import OrderPlaced from '#events/order_placed'

const order = await Order.create(data)
emitter.emit(new OrderPlaced(order))
```

## Testing Patterns

### Functional Test

```typescript
// tests/functional/posts/create.spec.ts
import { test } from '@japa/runner'
import User from '#models/user'

test.group('Posts create', () => {
  test('creates a new post', async ({ client, assert }) => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'secret',
    })

    const response = await client
      .post('/posts')
      .loginAs(user)
      .json({
        title: 'Test Post',
        content: 'This is a test post',
      })

    response.assertStatus(201)
    response.assertBodyContains({
      title: 'Test Post',
      content: 'This is a test post',
    })
  })
})
```

### Unit Test

```typescript
// tests/unit/services/post_service.spec.ts
import { test } from '@japa/runner'
import PostService from '#services/post_service'

test.group('Post service', () => {
  test('generates correct slug from title', async ({ assert }) => {
    const service = new PostService()
    const slug = service.generateSlug('This is a Test Post!')

    assert.equal(slug, 'this-is-a-test-post')
  })
})
```

## Database Seeding Patterns

### Factory Definition

```typescript
// database/factories/user_factory.ts
import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    return {
      email: faker.internet.email(),
      password: 'secret',
      fullName: faker.person.fullName(),
    }
  })
  .build()
```

### Seeder with Relationships

```typescript
// database/seeders/database_seeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { UserFactory } from '#database/factories/user_factory'

export default class DatabaseSeeder extends BaseSeeder {
  async run() {
    // Create users with posts
    const users = await UserFactory.with('posts', 5).createMany(10)

    // Create specific admin user
    const admin = await UserFactory.merge({
      email: 'admin@example.com',
      isAdmin: true,
    }).create()
  }
}
```

## Production Build Pattern

```bash
# Build application
node ace build

# Navigate to build directory
cd build

# Install production dependencies only
npm ci --production

# Set environment to production
export NODE_ENV=production

# Run migrations
node ace migration:run --force

# Start production server
node server.js

# Or with PM2
pm2 start server.js --name "my-api"
```

## Custom Command Pattern

```typescript
// commands/cleanup_old_posts.ts
import { BaseCommand } from '@adonisjs/core/ace'
import { args, flags } from '@adonisjs/core/ace'
import Post from '#models/post'
import { DateTime } from 'luxon'

export default class CleanupOldPosts extends BaseCommand {
  static commandName = 'cleanup:old-posts'
  static description = 'Delete posts older than specified days'

  @args.number({ description: 'Number of days' })
  declare days: number

  @flags.boolean({ description: 'Perform dry run' })
  declare dryRun: boolean

  async run() {
    const threshold = DateTime.now().minus({ days: this.days })

    const query = Post.query().where('created_at', '<', threshold.toISO())

    if (this.dryRun) {
      const count = await query.count('* as total')
      this.logger.info(`Would delete ${count[0].total} posts`)
      return
    }

    const deleted = await query.delete()
    this.logger.success(`Deleted ${deleted} posts`)
  }
}
```

**Usage:**

```bash
# Run command
node ace cleanup:old-posts 30

# Dry run
node ace cleanup:old-posts 30 --dry-run
```
