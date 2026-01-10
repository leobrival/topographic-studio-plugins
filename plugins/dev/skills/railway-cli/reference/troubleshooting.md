# Railway Troubleshooting Guide

Common issues and solutions for Railway deployments, services, and environments.

## Deployment Issues

### Deployment Fails to Start

**Symptom:** Deployment shows error status or doesn't start

**Diagnosis:**
```bash
# Check deployment status
railway status

# View detailed logs
railway logs --tail 50

# Check specific service
railway logs --service [service-name]

# Inspect deployment
railway open  # View in dashboard
```

**Common Causes:**
1. **Application crashes on startup** → Check application logs for errors
2. **Missing environment variables** → Verify with `railway variables`
3. **Port already in use** → Check if service is using correct port
4. **Insufficient resources** → Check memory and CPU limits
5. **Build failures** → Check build logs in deployment view

**Solutions:**
```bash
# View full deployment logs
railway logs --tail 100

# Verify environment variables are set
railway variables

# Check which variables application expects
grep -r "process.env\." src/

# Redeploy with verbose output
railway deploy --yes

# Check service health
railway ssh --command "curl http://localhost:3000/health"
```

### Deployment Stuck in Building

**Symptom:** Deployment stays in "Building" status indefinitely

**Diagnosis:**
```bash
# Check logs for build progress
railway logs --follow

# Check service status
railway status

# View in dashboard
railway open
```

**Solutions:**
```bash
# Cancel current deployment
railway down

# Wait for resources
railway status

# Redeploy
railway up

# If still stuck, check build timeout and resource limits in dashboard
# Increase timeout or optimize build process
```

### Application Starts But Service Unreachable

**Symptom:** Deployment shows healthy but service unavailable

**Diagnosis:**
```bash
# Verify port mapping
railway ssh --command "netstat -tlnp"

# Test application locally
railway ssh --command "curl http://localhost:3000"

# Check if application started correctly
railway logs --tail 50

# Verify port configuration
railway open  # Check port in dashboard
```

**Solutions:**
```bash
# Ensure application listens on correct port
# Common issue: app binds to localhost only
# Fix: app should bind to 0.0.0.0

# Verify port in Railway configuration
# Port should match what application exposes

# Test connection
railway ssh --command "curl -v http://localhost:3000"

# Check firewall/network configuration
railway open  # Verify service is exposed
```

## Service Connection Issues

### Cannot Connect to Database

**Symptom:** Application fails to connect to database

**Diagnosis:**
```bash
# Get database connection URL
railway variables get DATABASE_URL

# Check if database service is running
railway service --list

# Test database connectivity
railway ssh --command "curl postgres://[host]:[port]"

# Verify database variables in application
railway variables | grep DATABASE

# Check application logs
railway logs --tail 100
```

**Common Causes:**
1. **Wrong database URL format** → Check `DATABASE_URL` format
2. **Database not initialized** → Run migrations
3. **Network isolation** → Services must be on same environment
4. **Credentials incorrect** → Verify username/password

**Solutions:**
```bash
# Verify database is running
railway service

# Check connection string format
railway variables get DATABASE_URL

# Test direct connection
railway connect postgres
# If fails, check database status in dashboard

# Ensure application uses correct URL
railway run echo $DATABASE_URL

# Run migrations if needed
railway run npm run migrate

# Verify from application
railway logs --follow
```

### Service-to-Service Communication Fails

**Symptom:** Services can't communicate with each other

**Diagnosis:**
```bash
# List all services
railway service --list

# Check environment variables linking services
railway variables | grep URL

# Test connectivity between services
railway ssh --command "curl http://api-service:3000"

# Check network configuration
railway open  # Verify in dashboard
```

**Solutions:**
```bash
# Use service names for internal communication
# Services communicate via: service-name:port

# Example: Connect web to API
railway variables set API_URL=http://api:3000

# Verify from web service
railway ssh --service web --command "curl http://api:3000/health"

# If still failing:
# 1. Ensure both services in same environment
# 2. Check that services are deployed
# 3. Verify port numbers are correct
```

## Environment Variable Issues

### Variables Not Available in Application

**Symptom:** Application can't access environment variables

**Diagnosis:**
```bash
# List all variables
railway variables

# Check specific variable
railway variables get VARIABLE_NAME

# Verify variable is loaded
railway run printenv | grep VARIABLE_NAME

# Check in application logs
railway logs | grep undefined
```

**Solutions:**
```bash
# Set missing variable
railway variables set NEW_VAR=value

# Reload application
railway redeploy

# Verify variable loads
railway run printenv

# Check application code uses correct variable name
# JavaScript: process.env.VAR_NAME
# Python: os.environ.get('VAR_NAME')
# Ruby: ENV['VAR_NAME']

# For .env file import
railway variables set --from-file .env

# Redeploy after setting variables
railway redeploy
```

### Variables Leaking to Wrong Environment

**Symptom:** Staging sees production variables

**Diagnosis:**
```bash
# Check current environment
railway environment

# List variables for current env
railway variables

# Switch and check other environment
railway environment use [env-name]
railway variables
```

**Solutions:**
```bash
# Variables should be environment-specific
# Make sure you're in correct environment before setting

# Switch to correct environment
railway environment use staging

# Set staging-specific variable
railway variables set API_KEY=staging-key

# Switch to production
railway environment use production

# Verify different key is set
railway variables get API_KEY
```

## Domain and SSL Issues

### Custom Domain Not Working

**Symptom:** Custom domain doesn't resolve or shows SSL error

**Diagnosis:**
```bash
# Check assigned domain
railway domain

# Test DNS resolution
nslookup mydomain.com
dig mydomain.com @8.8.8.8

# Test HTTPS
curl -I https://mydomain.com

# Check SSL certificate
openssl s_client -connect mydomain.com:443

# View in dashboard
railway open
```

**Common Causes:**
1. **DNS not updated** → DNS changes take time to propagate
2. **Domain not added to Railway** → Run `railway domain add`
3. **SSL certificate pending** → Wait for issuance (usually < 5 min)
4. **Incorrect domain** → Verify domain spelling

**Solutions:**
```bash
# Add domain to Railway
railway domain add mydomain.com

# Add www subdomain
railway domain add www.mydomain.com

# Generate Railway domain for testing
railway domain generate

# Update DNS records to point to Railway
# Check dashboard for DNS target

# Wait for SSL certificate (usually < 5 minutes)
# Monitor in dashboard under Domains

# Test when ready
curl https://mydomain.com
```

### SSL Certificate Issues

**Symptom:** SSL certificate warning or missing

**Diagnosis:**
```bash
# Check certificate status
# Navigate to Railway dashboard > Domains

# Test certificate
curl -v https://mydomain.com

# View certificate details
openssl s_client -connect mydomain.com:443 -showcerts
```

**Solutions:**
```bash
# Railway auto-provisions Let's Encrypt certificates
# Usually within 5 minutes of domain addition

# If certificate not issued:
# 1. Verify DNS resolution is working
# 2. Check domain is correctly added
# 3. Wait longer (sometimes takes 10-15 minutes)

# Remove and re-add domain to trigger re-provisioning
railway domain remove mydomain.com
railway domain add mydomain.com

# Monitor status in dashboard
railway open
```

## Resource and Performance Issues

### Out of Memory

**Symptom:** Service crashes with memory errors or killed

**Diagnosis:**
```bash
# Check current memory usage
railway open  # View in dashboard

# Check from SSH
railway ssh --command "free -h"
railway ssh --command "ps aux"

# Check application logs for memory errors
railway logs --tail 50
```

**Solutions:**
```bash
# Increase memory allocation (via dashboard)
# Railway > Service > Settings > Resource Allocation

# Monitor process memory
railway ssh --command "top -b -n 1 | head -20"

# Optimize application code
# 1. Check for memory leaks
# 2. Optimize queries/caching
# 3. Stream large data instead of loading in memory

# Restart service to free memory
railway redeploy

# Check logs after restart
railway logs --follow
```

### High CPU Usage

**Symptom:** Service slow, CPU at 100%

**Diagnosis:**
```bash
# Check CPU usage
railway open  # View in dashboard

# Check from SSH
railway ssh --command "top -b -n 1"

# Check application logs for infinite loops
railway logs --tail 100
```

**Solutions:**
```bash
# Identify problematic process
railway ssh --command "ps aux | grep node"

# Optimize application code
# 1. Profile application (use Node Inspector, Python cProfile)
# 2. Optimize algorithms
# 3. Add caching

# Increase CPU allocation (via dashboard)

# Restart service
railway redeploy

# Monitor after restart
railway logs --follow
```

### Slow Deployments

**Symptom:** Build takes very long time

**Diagnosis:**
```bash
# Check deployment logs
railway logs --follow

# Monitor build progress
railway status

# View detailed deployment in dashboard
railway open
```

**Solutions:**
```bash
# Optimize build process
# 1. Use .dockerignore to exclude unnecessary files
# 2. Cache dependencies
# 3. Use smaller base images

# Examples:
# Remove heavy dev dependencies from production build
# Use multi-stage builds
# Pre-build dependencies

# Increase build timeout (via dashboard settings)

# Clear build cache if needed
# Contact Railway support for cache clearing
```

## SSH and Access Issues

### Cannot SSH Into Service

**Symptom:** SSH command fails or hangs

**Diagnosis:**
```bash
# Verify service is running
railway status

# Check service health
railway open  # View in dashboard

# Try with verbose output
railway ssh --command "whoami"
```

**Solutions:**
```bash
# Ensure service is deployed and healthy
railway status

# Wait for deployment to complete
railway logs --follow

# Once healthy, SSH should work
railway ssh

# If still failing:
# 1. Check if service has sufficient resources
# 2. Restart service: railway redeploy
# 3. Contact Railway support
```

## Logging and Monitoring

### Logs Not Appearing

**Symptom:** No logs visible even though service is running

**Diagnosis:**
```bash
# Check if service is logging correctly
railway logs

# Verify service is actually running
railway status

# Check service health
railway open
```

**Solutions:**
```bash
# Ensure application logs to stdout
# Logs must go to stdout/stderr, not files

# JavaScript: use console.log instead of file logging
# Python: configure logging to stdout
# Ruby: use $stdout.puts or logger

# Redeploy to apply changes
railway redeploy

# View logs
railway logs --follow

# Check for errors that prevent logging startup
railway logs --tail 100
```

### Too Many Logs / Disk Full

**Symptom:** Deployment shows disk full or logs huge

**Diagnosis:**
```bash
# Check disk usage
railway ssh --command "df -h"

# Check log file sizes
railway ssh --command "du -sh /var/log"

# View recent logs
railway logs --tail 200
```

**Solutions:**
```bash
# Reduce logging verbosity
railway variables set LOG_LEVEL=info

# Redeploy with updated logging
railway redeploy

# Clean up old logs (use SSH)
railway ssh --command "rm /var/log/*.old"

# Configure log rotation (in application or deployment config)

# Monitor usage after changes
railway ssh --command "df -h"
```

## Account and Token Issues

### RAILWAY_TOKEN Invalid or Expired

**Symptom:** CI/CD deployments fail with authentication error

**Diagnosis:**
```bash
# Test token locally
RAILWAY_TOKEN=your-token railway status

# Check token in dashboard
# Navigate to Account Settings > Tokens
```

**Solutions:**
```bash
# Generate new token
# Go to Railway Dashboard > Account Settings > Tokens > Generate

# Update in CI/CD configuration
# Set RAILWAY_TOKEN to new value

# Rotate regularly for security
# Delete old token after updating

# Ensure no trailing whitespace in token
echo -n "your-token" | wc -c
```

### Cannot Authenticate

**Symptom:** `railway login` fails

**Diagnosis:**
```bash
# Check authentication status
railway whoami

# View stored credentials
cat ~/.railway/credentials.json  # Check if file exists

# Test network connectivity
curl -I https://api.railway.app
```

**Solutions:**
```bash
# Login again
railway logout
railway login

# Use browserless login in CI
railway login --browserless

# Use token instead
export RAILWAY_TOKEN=your-token
railway status

# Clear cached credentials if needed
rm -f ~/.railway/credentials.json
railway login
```
