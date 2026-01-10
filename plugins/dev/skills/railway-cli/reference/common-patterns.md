# Railway Common Patterns

Real-world patterns and workflows for common Railway use cases.

## Project Setup Workflow

### Initial Project Setup

```bash
# Create and initialize new project
railway login
railway init my-app

# Add database
railway add --database postgres

# Configure environment variables
railway variables set NODE_ENV=production
railway variables set APP_NAME=my-app

# Deploy application
railway up
```

### Link Existing Project

```bash
# Link to existing project
railway link

# Verify connection
railway status

# Load local environment
railway shell
```

## Development Workflow

### Local Development with Environment

```bash
# Link to project
railway link

# Load project environment variables
railway shell

# Run local development server
npm start
# or
python manage.py runserver

# Exit Railway shell
exit
```

### Testing with Production Environment Variables

```bash
# Run local test with production env
railway run npm test

# Run database migration with production env
railway run python manage.py migrate

# Run seed script
railway run node scripts/seed.js
```

## Database Management

### PostgreSQL Setup and Connection

```bash
# Add PostgreSQL database
railway add --database postgres

# Get database URL
railway variables get DATABASE_URL

# Connect to database shell
railway connect postgres

# Run migrations in Railway environment
railway run npm run migrate

# Seed database
railway run npm run seed

# Backup database
railway ssh --command "pg_dump $DATABASE_URL | gzip > backup.sql.gz"
```

### MongoDB Setup and Connection

```bash
# Add MongoDB database
railway add --database mongodb

# Get connection URL
railway variables get MONGO_URL

# Connect to MongoDB shell
railway connect mongo

# List collections
show collections

# Exit MongoDB shell
exit
```

### Redis Cache Setup

```bash
# Add Redis database
railway add --database redis

# Get Redis URL
railway variables get REDIS_URL

# Connect to Redis
railway connect redis

# Test connection
ping

# Flush cache (development only)
FLUSHALL
```

## Environment Management

### Multi-Environment Setup

```bash
# Create staging environment
railway environment new staging

# Switch to staging
railway environment use staging

# Deploy to staging
railway deploy

# Switch back to production
railway environment use production

# Deploy to production
railway deploy

# Verify production deployment
railway logs --follow
```

### Environment-Specific Variables

```bash
# Set different variables per environment
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=info

# Switch to staging
railway environment use staging

# Set staging-specific variables
railway variables set LOG_LEVEL=debug

# Switch back to production
railway environment use production
```

## Domain & SSL Setup

### Configure Custom Domain

```bash
# Generate Railway domain (if needed for testing)
railway domain generate

# Add custom domain
railway domain add mydomain.com
railway domain add api.mydomain.com

# Add wildcard domain
railway domain add *.mydomain.com

# Verify domain in DNS settings
railway domain

# Open dashboard to verify SSL
railway open
```

### Domain Verification

```bash
# Check assigned domain
railway domain

# Verify DNS configuration (from host)
nslookup mydomain.com
dig mydomain.com

# Test HTTPS connectivity
curl -I https://mydomain.com
```

## Deployment Patterns

### Complete Deploy and Verify Workflow

```bash
# Ensure we're in correct environment
railway environment use production

# Review project status
railway status

# Deploy application
railway up

# Follow deployment logs
railway logs --follow

# Verify service is healthy
railway ssh --command "curl http://localhost:3000/health"

# Test public endpoint
curl https://mydomain.com/health

# Check resource usage
railway open  # View in dashboard
```

### Blue-Green Deployment Strategy

```bash
# Create production environment clone
railway environment new production-green

# Deploy to green environment
railway environment use production-green
railway deploy

# Verify green deployment
railway logs --follow
railway ssh --command "curl http://localhost:3000/health"

# Switch traffic (via dashboard or domain routing)
# Update production domain to point to green

# Keep blue for rollback
railway environment use production
railway logs --follow
```

### Rollback Strategy

```bash
# List recent deployments
railway logs --tail 20

# Check deployment ID of last working version
railway status

# Redeploy previous version
railway redeploy --deployment [previous-deployment-id]

# Verify rollback
railway logs --follow
railway status
```

## CI/CD Integration

### GitHub Actions Deployment

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --ci
```

### GitLab CI Deployment

```yaml
deploy:
  stage: deploy
  image: node:18
  only:
    - main
  script:
    - npm install -g @railway/cli
    - railway up --ci
  environment:
    name: production
    url: https://mydomain.com
```

### GitLab CI with Environment Variables

```yaml
deploy:
  stage: deploy
  script:
    - npm install -g @railway/cli
    - railway variables set VERSION=$CI_COMMIT_SHA
    - railway variables set BUILD_TIME=$(date)
    - railway up --ci
  environment:
    name: production
```

## Service Communication Patterns

### Multi-Service Architecture

```bash
# Add web service
railway add --template express

# Add API service
railway add --template api

# Add background worker
railway add --template worker

# Configure service discovery (via environment variables)
railway variables set API_URL=http://api:3000
railway variables set WORKER_QUEUE_URL=redis://redis:6379

# Deploy all services
railway up
```

### Service-to-Service Communication

```bash
# Connect services through environment variables
railway variables set INTERNAL_API_URL=http://api-service:3000
railway variables set DATABASE_URL=postgres://db-service:5432/mydb

# Within application, use these URLs for internal communication
# Example: fetch('http://api-service:3000/internal/endpoint')
```

## Monitoring and Debugging

### Real-Time Log Monitoring

```bash
# Follow all service logs
railway logs --follow

# Follow specific service logs
railway logs --service web --follow

# View logs with timestamps
railway logs --timestamps

# View last 200 lines
railway logs --tail 200
```

### SSH for Debugging

```bash
# Access service shell
railway ssh

# Run diagnostic commands
railway ssh --command "ps aux"
railway ssh --command "df -h"
railway ssh --command "netstat -tlnp"

# Check application logs directly
railway ssh --command "tail -f /app/logs/application.log"

# Test internal connectivity
railway ssh --command "curl http://database:5432"
```

### Resource Monitoring

```bash
# Check memory usage (from dashboard)
railway open

# Monitor via SSH
railway ssh --command "free -h"
railway ssh --command "top -b -n 1"

# Check disk usage
railway ssh --command "du -sh /app"
```

## Secrets Management

### Secure Variable Storage

```bash
# Set sensitive variables (encrypted in Railway)
railway variables set API_KEY=secret-key-value
railway variables set DATABASE_PASSWORD=secret-password
railway variables set JWT_SECRET=secret-jwt-key

# Variables are encrypted at rest and in transit
# Never commit .env files with secrets

# Rotate secrets
railway variables delete OLD_API_KEY
railway variables set NEW_API_KEY=new-secret-key
```

### Environment-Specific Secrets

```bash
# Set different secrets per environment
railway variables set STRIPE_KEY=pk_test_xxx

# Switch to production
railway environment use production

# Set production secret
railway variables set STRIPE_KEY=pk_live_yyy

# Switch back to development
railway environment use development
```

## Backup and Recovery

### Database Backup

```bash
# Create backup from Railway environment
railway run pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz

# For MongoDB
railway run mongodump --uri=$MONGO_URL --archive=backup-$(date +%Y%m%d).archive

# Download backup to local machine
railway ssh --command "tar czf /tmp/backup.tar.gz /app/data" > backup.tar.gz
```

### Restore from Backup

```bash
# Restore PostgreSQL backup
gunzip < backup-20240101.sql.gz | railway run psql $DATABASE_URL

# Restore MongoDB backup
railway run mongorestore --uri=$MONGO_URL --archive < backup.archive

# Verify restoration
railway connect postgres
# or
railway connect mongo
```
