# Vercel CLI Troubleshooting Guide

Common issues and solutions for Vercel deployments and CLI operations.

## Authentication & Setup

### Cannot Login to Vercel

**Symptom:** `vercel login` fails or hangs

**Diagnosis:**

```bash
# Check authentication status
vercel whoami

# Verify CLI is installed
vercel --version

# Check network connectivity
curl -I https://vercel.com
```

**Solutions:**

```bash
# Try fresh login
vercel logout
vercel login

# Use token-based authentication
vercel --token $VERCEL_TOKEN whoami

# Create token in dashboard and use directly
vercel --token your-token-here deploy --prod
```

### Project Not Linked

**Symptom:** "Error: No project found" when running `vercel`

**Diagnosis:**

```bash
# Check if project is linked
vercel status

# List available projects
vercel project ls
```

**Solutions:**

```bash
# Link existing Vercel project
vercel link

# Or initialize and create new project
vercel init

# Verify link succeeded
vercel status
```

## Deployment Issues

### Deployment Fails During Build

**Symptom:** Build step fails with error message

**Diagnosis:**

```bash
# Check local build works
vercel build

# View detailed build logs
vercel logs https://my-app.vercel.app

# Check environment variables
vercel env ls
```

**Common Causes:**

1. **Missing environment variables** → Add via `vercel env add`
2. **Build command fails** → Test locally with `vercel build`
3. **Node.js version mismatch** → Verify in `vercel.json` or `package.json`
4. **Missing dependencies** → Check `package.json` and `package-lock.json`

**Solutions:**

```bash
# Pull all environment variables
vercel env pull .env.local

# Test build locally
npm install
npm run build

# Set Node.js version in vercel.json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/node@2.15.0" }
  ]
}

# Deploy with explicit build
vercel deploy --prod
```

### Deployment Fails Due to Missing Files

**Symptom:** "COPY failed" or "file not found" error

**Diagnosis:**

```bash
# Check what files are being deployed
ls -la

# Verify .gitignore doesn't exclude needed files
cat .gitignore

# Check vercel.json includes
cat vercel.json | grep include
```

**Solutions:**

```bash
# Create .vercelignore to exclude files
cat > .vercelignore << EOF
node_modules
.env.local
.next/cache
EOF

# Or specify files to include in vercel.json
{
  "include": [".well-known/**"]
}

# Redeploy
vercel deploy --prod
```

### Deployment Hangs or Times Out

**Symptom:** Deployment takes too long or times out

**Diagnosis:**

```bash
# View deployment progress
vercel logs https://my-app.vercel.app

# Check local build time
time vercel build

# Monitor resource usage
vercel inspect https://my-app.vercel.app
```

**Solutions:**

```bash
# Optimize build process locally
npm run build  # Check for slow steps

# Use build cache
# In vercel.json:
{
  "buildCommand": "npm run build",
  "cacheMaxAge": 3600
}

# Remove unused dependencies
npm audit --production

# Check for large build artifacts
du -sh node_modules/

# Deploy with prebuilt option
vercel build
vercel deploy --prebuilt
```

## Runtime Issues

### Application Crashes After Deployment

**Symptom:** Deployment succeeds but app doesn't respond

**Diagnosis:**

```bash
# Check deployment logs
vercel logs https://my-app.vercel.app

# View real-time logs
vercel logs --follow https://my-app.vercel.app

# Inspect deployment
vercel inspect https://my-app.vercel.app
```

**Common Causes:**

1. **Missing environment variables** → Check `vercel env ls`
2. **Port configuration** → Verify server listens on correct port
3. **Database connection errors** → Check connection string
4. **Memory limits** → Check function logs

**Solutions:**

```bash
# Verify environment variables are set
vercel env ls

# Add missing variable
vercel env add DATABASE_URL

# Test locally with environment
vercel env pull .env.local
npm run dev

# Check port configuration (should use process.env.PORT)
# Ensure app listens on PORT or defaults to 3000

# Deploy fix
vercel deploy --prod
```

### 502 Bad Gateway Errors

**Symptom:** Deployment returns 502 Bad Gateway

**Diagnosis:**

```bash
# Check deployment status
vercel inspect https://my-app.vercel.app

# View logs for timeout/crash
vercel logs https://my-app.vercel.app

# Test endpoint locally
curl http://localhost:3000/api/health
```

**Solutions:**

```bash
# Check for infinite loops or deadlocks
# Review recent code changes

# Add health check endpoint
# GET /api/health should respond with 200

# Increase timeout if needed
# In vercel.json:
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  }
}

# Redeploy
vercel deploy --prod
```

### High Response Times

**Symptom:** API responds slowly

**Diagnosis:**

```bash
# Check logs for slow requests
vercel logs https://my-app.vercel.app

# Test from multiple regions
vercel inspect https://my-app.vercel.app | grep regions

# Monitor via dashboard
# (Vercel Analytics)
```

**Solutions:**

```bash
# Add caching headers
# In serverless function:
res.setHeader('Cache-Control', 'max-age=3600, public');

# Deploy to multiple regions
# In vercel.json:
{
  "regions": ["sfo1", "fra1", "sin1"]
}

# Optimize database queries
# Use connection pooling

# Upgrade function memory (via dashboard)
```

## Domain & DNS Issues

### Domain Not Resolving

**Symptom:** Can't access app via custom domain

**Diagnosis:**

```bash
# Check domain is added
vercel domains ls

# Verify DNS records
vercel domains inspect example.com

# Test DNS resolution
nslookup example.com
dig example.com

# Check domain registrar
# Verify nameservers are set correctly
```

**Solutions:**

```bash
# Add domain to Vercel
vercel domains add example.com my-project

# Update nameservers at registrar
# Point to Vercel's nameservers:
# ns1.vercel.com
# ns2.vercel.com

# Wait for DNS propagation (can take 24-48 hours)
# Check progress
nslookup example.com

# Add DNS record if needed
vercel dns add example.com
```

### SSL Certificate Not Valid

**Symptom:** Browser shows certificate warning

**Diagnosis:**

```bash
# Check certificate status
vercel certs ls

# Inspect certificate
vercel inspect https://my-app.vercel.app

# Verify certificate validity
openssl s_client -connect example.com:443
```

**Solutions:**

```bash
# Vercel auto-provides SSL via Let's Encrypt
# Usually works automatically

# If issues persist:
# 1. Ensure domain is verified
vercel domains inspect example.com

# 2. Wait for certificate generation (can take hours)

# 3. For custom certificate
vercel certs add

# Check status again
vercel certs ls
```

## Git Integration Issues

### Git Integration Not Working

**Symptom:** Deployments not triggering on git push

**Diagnosis:**

```bash
# Check git connection
vercel git ls

# Verify GitHub/GitLab authorization
# Check dashboard > Connected Integrations

# Check git webhook
# In repository settings > webhooks
```

**Solutions:**

```bash
# Reconnect git
vercel git disconnect
vercel git connect

# Authorize Vercel in GitHub
# Settings > Installed GitHub Apps > Vercel

# Trigger manual deployment
vercel deploy --prod

# Check webhook logs in repository settings
```

## Environment Variable Issues

### Environment Variables Not Available

**Symptom:** `process.env.KEY` is undefined in deployed app

**Diagnosis:**

```bash
# List environment variables
vercel env ls

# Check in function (add temporary logging)
console.log(Object.keys(process.env))

# Verify in dashboard
# Settings > Environment Variables
```

**Solutions:**

```bash
# Add missing variable
vercel env add MY_VAR

# Or add via dashboard
# Settings > Environment Variables > Add

# For different environments
vercel env add API_KEY
# Select: production, preview, development

# Pull variables locally
vercel env pull .env.local

# Redeploy
vercel deploy --prod
```

### Environment Secrets Not Secure

**Symptom:** Need to store sensitive data securely

**Diagnosis:**

```bash
# Check stored environment variables
vercel env ls

# Verify they're marked as secret
```

**Solutions:**

```bash
# Use vercel.json for non-secrets
{
  "env": {
    "API_ENDPOINT": "https://api.example.com"
  }
}

# Store secrets in environment variables
vercel env add API_KEY

# In dashboard: Settings > Environment Variables
# Check "Sensitive" checkbox

# Never commit secrets to git
# Use .env.local in .gitignore
```

## Performance Issues

### Build Takes Too Long

**Symptom:** Deployment takes many minutes to build

**Solutions:**

```bash
# Identify slow steps
# In package.json, break build into steps

# Use build caching
# In vercel.json:
{
  "cacheMaxAge": 3600
}

# Optimize dependencies
npm audit
npm prune

# Use smaller base image (if using Dockerfile)

# Enable Edge Caching
# In vercel.json:
{
  "caches": {
    "/api/**": {
      "maxAge": 3600
    }
  }
}
```

### Memory or CPU Limits

**Symptom:** Function times out or crashes with limit error

**Solutions:**

```bash
# Increase function timeout in vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60
    }
  }
}

# Note: Serverless functions have CPU limits
# Consider using Vercel Edge Functions for low-latency needs

# Optimize function code
# - Remove unnecessary dependencies
# - Use streaming for large responses
# - Implement pagination

# Monitor resource usage
vercel logs --follow https://my-app.vercel.app
```

## Common Error Messages

### "You have insufficient permissions"

**Solution:**

```bash
# Verify you're on correct team
vercel whoami

# Switch team if needed
vercel switch my-team

# Check dashboard permissions for account
```

### "Conflicting file"

**Solution:**

```bash
# Remove conflicting files
rm -rf node_modules/.bin
npm install

# Or clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "Invalid region"

**Solution:**

```bash
# Use valid regions: sfo1, fra1, sin1, syd1, iad1, icn1, etc.
# Check available regions
vercel inspect https://my-app.vercel.app | grep regions
```

### "Production domain is required"

**Solution:**

```bash
# For production deployment, domain must be set
# Add domain first
vercel domains add example.com my-project

# Or deploy to preview
vercel  # (no --prod flag)
```

## Debug Tools & Tips

### Enable Debug Output

```bash
# Run command with debug flag
vercel deploy --debug

# Or set environment variable
DEBUG=* vercel deploy --prod
```

### Test Deployment Locally

```bash
# Build locally
vercel build

# Verify build output
ls -la .vercel/output

# Test with output files
```

### Check Configuration

```bash
# Validate vercel.json
cat vercel.json | jq .

# View project settings
vercel status
```

### Get Help

```bash
# General help
vercel help

# Command-specific help
vercel help deploy

# Check documentation
# https://vercel.com/docs
```
