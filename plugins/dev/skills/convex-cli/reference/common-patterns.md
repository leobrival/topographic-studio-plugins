# Convex Common Patterns

Real-world patterns and workflows for common Convex use cases.

## Development Workflow

### Complete Development Cycle

```bash
# Initialize project
convex login
convex init

# Start local development
convex dev

# Make changes to functions...
# Changes auto-reload

# Deploy to production
convex deploy

# Monitor production
convex logs --prod --follow
```

### Local Development with Type Checking

```bash
# Start dev server with TypeScript checking
convex dev --typecheck

# Generate types continuously
convex dev --codegen

# Run and debug a function
convex run queries/getUser --args '{"id": "123"}'
```

## Data Management

### Database Backup & Restore

```bash
# Export all data before major changes
convex export --all --output backup-$(date +%Y%m%d).json

# Export specific table
convex export users --output users-backup.json

# Import data to new environment
convex import users users.json

# Batch import multiple tables
convex import --all data/
```

### Multi-Environment Data Sync

```bash
# Export from production
convex export --all --prod --output prod-backup.json

# Import to development
convex export --all --output dev-data.json

# Use replacement mode for updates
convex import users updated-users.json --replace
```

## Environment Configuration

### Secrets & Configuration Management

```bash
# Set API keys for development
convex env set API_KEY sk_test_123
convex env set DATABASE_URL postgres://localhost/mydb

# Set production secrets
convex env set SECRET_KEY value --prod
convex env set WEBHOOK_SECRET value --prod

# List all environment variables
convex env list
convex env list --prod

# Update multiple vars
convex env set KEY1 value1 KEY2 value2 --prod
```

### Environment Variables by Deployment

```bash
# Development environment
convex env set NODE_ENV development
convex env set LOG_LEVEL debug

# Production environment
convex env set NODE_ENV production --prod
convex env set LOG_LEVEL error --prod

# Staging environment
convex env set NODE_ENV staging --deployment-name staging
```

## Function Development

### Query Function Pattern

```bash
# Development: Test query locally
convex run queries/getUser --args '{"id": "user123"}'

# Production: Run against prod data
convex run queries/getUser --args '{"id": "user123"}'  --prod

# With error handling
convex run queries/complexQuery --args '{"filter": "active"}' --prod
```

### Mutation Function Pattern

```bash
# Create user locally
convex run mutations/createUser --args '{"name": "Alice", "email": "alice@example.com"}'

# Update data in production
convex run mutations/updateUser --args '{"id": "123", "status": "active"}' --prod

# Delete operations
convex run mutations/deleteUser --args '{"id": "123"}' --prod
```

### Action Function Pattern

```bash
# Test action with external services
convex run actions/sendEmail --args '{"to": "user@example.com", "subject": "Test"}'

# Run HTTP action
convex run actions/webhookHandler --args '{"event": "user.created"}' --prod
```

## Deployment Patterns

### Pre-Deployment Checklist

```bash
# Type checking
convex deploy --typecheck

# Preview changes
convex deploy --dry-run

# Deploy with message
convex deploy --message "feat: add user authentication"

# Monitor after deploy
convex logs --prod --follow --limit 50
```

### Automated Deployments

```bash
#!/bin/bash
# Deploy script with validation

# Ensure code is ready
npm test
convex deploy --typecheck

# Tag deployment
convex deploy --message "v1.2.3 - $(git rev-parse --short HEAD)"

# Monitor health
convex logs --prod --limit 10
```

### Zero-Downtime Deployments

```bash
# Export current data
convex export --all --prod --output pre-deploy-backup.json

# Deploy changes
convex deploy --message "feat: new schema"

# Verify deployment
convex logs --prod --limit 20
convex run queries/systemHealth --prod
```

## Team Collaboration

### Team Management

```bash
# List teams
convex teams list

# Switch team
convex teams switch my-team

# Create project in team
convex init --project team-project
convex deploy --project team-project

# View team projects
convex projects list
```

### Multi-Project Setup

```bash
# Set default project
convex config set default-project my-project

# Deploy to specific project
convex deploy --project my-project

# Switch projects
convex projects list
convex init --project another-project
```

## Authentication Setup

### Authentication Configuration

```bash
# Add auth provider
convex auth add

# View configured providers
convex auth list

# Remove provider (if needed)
convex auth remove provider-name

# View auth settings
convex dashboard --settings
```

### Auth Testing

```bash
# Test authentication flow
convex run queries/getCurrentUser

# Verify token handling
convex run mutations/refreshToken --args '{"refreshToken": "xyz"}'
```

## Monitoring & Logging

### Real-Time Log Monitoring

```bash
# Stream all logs
convex logs --follow

# Filter by function
convex logs --function myFunction --follow

# Filter by level
convex logs --level error --follow

# Filter production logs
convex logs --prod --follow --limit 100
```

### Error Tracking

```bash
# View error logs
convex logs --level error

# Error logs from production
convex logs --level error --prod

# Error logs for specific function
convex logs --function errorProneFunction --level error
```

### Performance Monitoring

```bash
# Check function execution
convex logs --function myFunction --limit 50

# View recent activity
convex logs --limit 100

# Monitor dashboard
convex dashboard --logs
```

## Data Import/Export Strategies

### Seed Data Loading

```bash
# Prepare seed data in JSON format
# data/seed-users.json with array of objects

# Import to development
convex import users data/seed-users.json

# Batch import multiple tables
convex import --all data/

# Verify import
convex run queries/countUsers
```

### Data Migration

```bash
# Export from old system
convex export users --output users-migration.json

# Transform if needed
# Create transformed-users.json with updated schema

# Import to new system
convex import users transformed-users.json --replace
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
convex export --all --prod --output "backups/daily-$DATE.json"

# Keep only last 30 days
find backups/ -name "daily-*.json" -mtime +30 -delete
```

## Development Environment Setup

### Project Structure Setup

```bash
# Typical Convex project layout
my-app/
├── convex/
│   ├── _generated/          # Auto-generated types
│   ├── schema.ts            # Database schema
│   ├── queries/             # Query functions
│   ├── mutations/           # Mutation functions
│   ├── actions/             # Action functions
│   └── http.ts              # HTTP actions
├── convex.json              # Convex configuration
├── .env.local               # Local environment variables
└── .env.production          # Production env (in CI/CD)
```

### Development Tools Setup

```bash
# Install dependencies
npm install convex

# Setup TypeScript
npm install -D typescript @types/node

# Start development
npm run dev

# Build and deploy
npm run build
npm run deploy
```

## CI/CD Integration

### GitHub Actions Deployment

```bash
# Set admin key in GitHub Secrets
# Then use in workflow:

convex deploy --admin-key $CONVEX_DEPLOY_KEY
convex logs --prod --limit 10
```

### Automated Testing

```bash
# Test before deploy
npm test

# Type checking
convex deploy --typecheck

# Dry run
convex deploy --dry-run
```
