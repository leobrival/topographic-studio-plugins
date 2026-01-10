# Vercel CLI Common Patterns

Real-world patterns and workflows for common Vercel use cases.

## Development Workflow

### Local Development Setup

```bash
# Authenticate with Vercel
vercel login

# Link project to Vercel
vercel link

# Pull environment variables
vercel env pull .env.local

# Start local dev server
vercel dev

# Test preview deployment
vercel

# Deploy to production when ready
vercel --prod
```

### Team Development

```bash
# List all teams
vercel teams ls

# Switch to specific team
vercel switch my-team

# Pull team project settings
vercel pull

# Deploy to team project
vercel --scope my-team --prod
```

## Deployment Patterns

### Preview to Production Workflow

```bash
# Create preview deployment
vercel

# Test preview deployment
# ...verify at deployment URL...

# Promote to production
vercel promote https://my-app-preview.vercel.app

# Or rollback if needed
vercel rollback https://my-app-prod.vercel.app
```

### Multi-Region Deployment

```bash
# Deploy to specific regions
vercel --regions sfo1,fra1,syd1

# Check deployment info
vercel inspect https://my-app-xyz.vercel.app
```

### CI/CD Deployment

```bash
# In CI/CD pipeline with token
vercel --token $VERCEL_TOKEN --prod --yes

# Build before deploy
vercel build
vercel --prod --prebuilt --token $VERCEL_TOKEN
```

## Environment Management

### Environment Variable Setup

```bash
# List all environment variables
vercel env ls

# Add new variable (interactive)
vercel env add

# Add specific variable for multiple environments
vercel env add API_KEY
# Select: production, preview, development

# Pull all variables to .env.local
vercel env pull .env.local

# Pull for specific environment
vercel env pull --environment=development .env.development.local
```

### Local Development with Environment Variables

```bash
# Pull production environment variables
vercel env pull .env.local

# Start dev server (will use .env.local)
vercel dev

# Or manually set variables
API_KEY=value vercel dev
```

## Domain Configuration

### Complete Domain Setup

```bash
# Add domain to project
vercel domains add mydomain.com my-project

# Verify domain (check DNS)
vercel domains inspect mydomain.com

# Add additional domain
vercel domains add api.mydomain.com my-project

# Transfer existing domain to Vercel
vercel domains transfer-in mydomain.com

# Configure DNS records
vercel dns ls mydomain.com
vercel dns add mydomain.com  # Interactive DNS record setup
```

### Custom Domain with SSL

```bash
# Add domain (auto-SSL with Let's Encrypt)
vercel domains add secure.mydomain.com my-project

# List SSL certificates
vercel certs ls

# Add custom certificate
vercel certs add
```

## Debugging & Inspection

### Deployment Debugging

```bash
# View deployment logs
vercel logs https://my-app-xyz.vercel.app

# Follow logs in real-time
vercel logs --follow https://my-app-xyz.vercel.app

# Inspect deployment details
vercel inspect https://my-app-xyz.vercel.app

# Get deployment information
vercel list --limit 20
```

### Local Development Debugging

```bash
# Start dev server with debug output
vercel dev --debug

# Listen on specific port
vercel dev --listen 3001

# Run build locally
vercel build

# Verify build output
ls -la .vercel/output
```

### Troubleshooting Deployments

```bash
# View recent deployments
vercel ls

# Check which deployment is production
vercel inspect https://my-app.vercel.app

# Rollback to previous deployment
vercel rollback https://my-app.vercel.app

# Redeploy current version
vercel redeploy https://my-app.vercel.app
```

## Project Management

### Project Initialization

```bash
# Initialize new project
vercel init

# Or select specific framework
vercel init next

# Link existing project
cd existing-project
vercel link
```

### Deployment Configuration

```bash
# Create vercel.json
cat > vercel.json << EOF
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["sfo1", "fra1"]
}
EOF

# Deploy with configuration
vercel --prod
```

## Git Integration

### GitHub Deployment Automation

```bash
# Connect GitHub repository
vercel git connect

# Verify connection
vercel git ls

# Deployments now happen automatically on push
# (configured in Vercel dashboard)

# Disconnect if needed
vercel git disconnect
```

## Team Collaboration

### Team Workflow

```bash
# Create team
vercel teams add my-team

# Add team member (via dashboard recommended)
# Members are added via dashboard

# Switch to team context
vercel switch my-team

# Deploy to team project
vercel --prod

# Switch back to personal scope
vercel switch --personal
```

### Environment Sharing Between Team Members

```bash
# One team member pulls environment
vercel env pull .env.local

# Commit to shared repo (without secrets)
git add .env.example
git commit -m "Add env template"

# Other team members pull actual values
vercel env pull .env.local

# Start development
vercel dev
```

## Production Deployment

### Production Readiness Checklist

```bash
# 1. Verify environment variables
vercel env ls

# 2. Test locally
vercel dev

# 3. Create preview deployment
vercel

# 4. Test preview
# ... open preview URL and test ...

# 5. Monitor and promote
vercel logs https://my-app-preview.vercel.app
vercel promote https://my-app-preview.vercel.app

# 6. Verify production
vercel logs https://my-app.vercel.app
```

### Production Monitoring

```bash
# Monitor logs
vercel logs --follow https://my-app.vercel.app

# Check deployment status
vercel inspect https://my-app.vercel.app

# View resource usage and metrics
# (via dashboard)
```

### Rollback Procedure

```bash
# If issues occur in production
# 1. View recent deployments
vercel list

# 2. Identify stable deployment
# 3. Rollback
vercel rollback https://my-app.vercel.app

# 4. Verify
vercel logs --follow https://my-app.vercel.app
```

## Advanced Scenarios

### Multi-Project Deployment

```bash
# Deploy multiple projects
vercel --prod --cwd ./frontend
vercel --prod --cwd ./api

# Or use vercel.json root configuration
```

### Scheduled Redeployments

```bash
# Redeploy to clear cache or refresh data
vercel redeploy https://my-app.vercel.app

# Can be scheduled via cron job or GitHub Actions
```

### Preview Environments per Branch

```bash
# When using Git integration, preview deployments
# are automatically created for pull requests

# Manually create preview for specific branch
vercel deploy --prebuilt

# View all preview deployments
vercel list
```
