# Coolify Troubleshooting Guide

Common issues and solutions for Coolify API and deployment operations.

## Authentication Issues

### Invalid or Missing Token

**Symptom:** `401 Unauthorized` response

**Diagnosis:**
```bash
# Test token validity
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# Check if API is enabled
curl "$COOLIFY_URL/api/health"
```

**Common Causes:**
1. Token expired or revoked
2. Incorrect token format
3. API access disabled
4. Wrong base URL

**Solutions:**
```bash
# Generate new token in Coolify dashboard
# Keys & Tokens > API tokens > Create New Token

# Verify token format (should not include extra spaces or quotes)
export COOLIFY_TOKEN="token-without-spaces"

# Enable API access
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/enable"

# Verify base URL format (must include /api/v1)
export COOLIFY_URL="http://your-ip:8000"
```

### Permission Denied

**Symptom:** `403 Forbidden` response

**Diagnosis:**
```bash
# Check token permissions
# Read-only tokens cannot create/update/delete
```

**Solutions:**
- Regenerate token with appropriate permissions
- Enable "sensitive data" permission if accessing passwords/keys

## Deployment Issues

### Application Won't Start

**Symptom:** Application deploys but exits immediately

**Diagnosis:**
```bash
# Check application logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/logs"

# Get application details
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# Check deployment status
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/deployments"
```

**Common Causes:**
1. **Missing environment variables** → Application crashes due to missing config
2. **Port conflict** → Exposed port already in use
3. **Build failed** → Nixpacks or Dockerfile build errors
4. **Invalid git branch** → Branch doesn't exist

**Solutions:**
```bash
# Verify environment variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"

# Add missing variables
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key": "REQUIRED_VAR", "value": "value"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"

# Change exposed port
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"ports_exposes": "8080"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# Update branch name
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"git_branch": "main"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# Restart after fixes
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/restart"
```

### Build Fails

**Symptom:** Deployment fails during build phase

**Diagnosis:**
```bash
# Check deployment logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/logs"

# List recent deployments
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/deployments"
```

**Common Causes:**
1. **Nixpacks detection failed** → Use custom Dockerfile
2. **Build dependencies missing** → Add build-time environment variables
3. **Dockerfile syntax error** → Validate Dockerfile
4. **Out of memory during build** → Increase server resources

**Solutions:**
```bash
# Switch to Dockerfile type
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "type": "dockerfile",
       "dockerfile": "FROM node:18\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]"
     }' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# Add build-time variable
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "key": "BUILD_ENV",
       "value": "production",
       "is_build_time": true
     }' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"
```

### Git Repository Access Denied

**Symptom:** Cannot clone repository (private repos)

**Diagnosis:**
```bash
# Check application type
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# For private-deploy-key type, verify key exists
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/private-keys"

# For private-gh-app type, verify GitHub App
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps"
```

**Solutions:**
```bash
# For deploy key issues, create new key
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "new-deploy-key",
       "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
     }' \
     "$COOLIFY_URL/api/v1/private-keys"

# Update application with new key UUID
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"private_key_uuid": "new-pk-uuid"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# For GitHub App issues, verify installation
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps/$GH_APP_ID/repositories"
```

## Server Issues

### Cannot Connect to Server

**Symptom:** Server validation fails

**Diagnosis:**
```bash
# Validate server connectivity
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID/validate"

# Get server details
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID"
```

**Common Causes:**
1. **SSH key invalid** → Private key doesn't match server
2. **Firewall blocking SSH** → Port 22 not accessible
3. **Wrong IP or port** → Server details incorrect
4. **SSH user lacks permissions** → User cannot execute Docker commands

**Solutions:**
```bash
# Update server IP and port
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "ip": "correct-ip-address",
       "port": 22
     }' \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID"

# Update SSH key
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"private_key_uuid": "updated-pk-uuid"}' \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID"

# On server, ensure Docker is installed and user has permissions
# ssh into server and run:
# sudo usermod -aG docker $USER
```

### Server Resources Not Available

**Symptom:** Destination UUID not found

**Diagnosis:**
```bash
# List server resources
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers/$SERVER_UUID/resources"

# List all servers
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/servers"
```

**Solutions:**
- Ensure server is properly configured in Coolify dashboard
- Create destination/network in Coolify UI before deploying
- Use correct destination_uuid from server resources list

## Database Issues

### Database Won't Start

**Symptom:** Database container exits immediately

**Diagnosis:**
```bash
# Check database details
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID"

# Restart database
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/restart"
```

**Common Causes:**
1. **Port conflict** → Database port already in use
2. **Missing credentials** → Required passwords not set
3. **Disk space full** → Server out of storage
4. **Corrupted data** → Database files corrupted

**Solutions:**
```bash
# Update database configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "updated-db-name"}' \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID"

# Stop and restart
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/stop"

curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/start"
```

### Backup Configuration Not Working

**Symptom:** Backups not executing

**Diagnosis:**
```bash
# Check backup configuration
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/backups"

# List all backup executions
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/databases/backups"
```

**Solutions:**
```bash
# Update backup configuration
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "enabled": true,
       "frequency": "0 2 * * *",
       "number_of_backups_to_keep": 7
     }' \
     "$COOLIFY_URL/api/v1/databases/$DB_UUID/backup"

# Verify cron syntax (0 2 * * * = daily at 2 AM)
# Minute Hour Day Month DayOfWeek
```

## Environment Variable Issues

### Variables Not Applied

**Symptom:** Application not using environment variables

**Diagnosis:**
```bash
# List current variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"
```

**Solutions:**
```bash
# Restart application after adding variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/restart"

# Verify is_build_time vs runtime
# Build-time: Available during build process
# Runtime: Available when container runs

# Add build-time variable
curl -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"key": "BUILD_VAR", "value": "val", "is_build_time": true}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables"

# Redeploy to apply build-time variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?uuid=$APP_UUID"
```

### Bulk Update Fails

**Symptom:** Variables not updated in bulk

**Solutions:**
```bash
# Ensure correct format
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "variables": [
         {"key": "VAR1", "value": "value1"},
         {"key": "VAR2", "value": "value2"}
       ]
     }' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/environment-variables/bulk"

# Restart application after update
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/restart"
```

## Deployment Trigger Issues

### Tag-Based Deployment Not Working

**Symptom:** Deployment by tag fails

**Diagnosis:**
```bash
# Verify application exists
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications"

# Check deployment status
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments"
```

**Solutions:**
```bash
# Ensure tag exists in repository
# Use UUID instead of tag
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/deployments/deploy?uuid=$APP_UUID"

# Check application git_branch is correct
curl -X PATCH \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"git_branch": "main"}' \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"
```

## Service Issues

### Service Type Not Found

**Symptom:** Cannot create service with specified type

**Diagnosis:**
```bash
# List available services (check Coolify docs for supported types)
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services"
```

**Solutions:**
- Use docker-compose type for custom services
- Verify service type name (e.g., "plausible", "n8n", "ghost")
- Check Coolify version for service availability

### Service Environment Variables Not Applied

**Symptom:** Service starts but ignores environment variables

**Solutions:**
```bash
# Restart service after adding variables
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/$SERVICE_UUID/stop"

curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/$SERVICE_UUID/start"

# Or use restart endpoint
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/services/$SERVICE_UUID/restart"
```

## GitHub App Issues

### Repositories Not Loading

**Symptom:** Cannot load repositories via GitHub App

**Diagnosis:**
```bash
# Verify GitHub App registration
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps"

# Try loading repositories
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/github-apps/$GH_APP_ID/repositories"
```

**Common Causes:**
1. GitHub App not installed on repository
2. Installation ID incorrect
3. Private key invalid or expired
4. App permissions insufficient

**Solutions:**
- Reinstall GitHub App in GitHub settings
- Verify installation_id matches GitHub
- Regenerate private key if expired
- Ensure app has repository read permissions

## API Response Issues

### Empty or Null Response

**Symptom:** API returns success but empty data

**Diagnosis:**
```bash
# Check if resource exists
curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID" | jq .

# Verify UUID format
echo $APP_UUID
```

**Solutions:**
- Verify UUID is correct (no extra spaces or quotes)
- Check if resource was deleted
- List all resources to find correct UUID

### Validation Errors (422)

**Symptom:** `422 Unprocessable Entity` with validation errors

**Diagnosis:**
```bash
# View full error response
curl -s -X POST \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{ ... }' \
     "$COOLIFY_URL/api/v1/applications" | jq .
```

**Solutions:**
- Check required fields (project_uuid, server_uuid, destination_uuid)
- Verify field values match expected format
- Ensure UUIDs exist and are valid
- Check that ports_exposes is a string, not integer

## Network and Connectivity Issues

### Connection Timeout

**Symptom:** Curl requests timeout

**Diagnosis:**
```bash
# Test basic connectivity
ping your-coolify-ip

# Test HTTP connection
curl -I "$COOLIFY_URL/api/health"

# Check if port 8000 is accessible
telnet your-coolify-ip 8000
```

**Solutions:**
- Verify Coolify is running
- Check firewall rules allow port 8000
- Ensure correct IP address and URL format
- Try accessing from same network as Coolify

### SSL/TLS Issues

**Symptom:** Certificate errors

**Solutions:**
```bash
# For self-signed certificates, use -k flag
curl -k -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# Or set environment variable
export CURL_CA_BUNDLE=/path/to/cert.pem
```

## Debug Tools

### Useful Debug Commands

```bash
# Pretty print JSON responses
curl -s -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications" | jq .

# Check HTTP status codes
curl -w "\nHTTP Status: %{http_code}\n" \
     -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# View response headers
curl -I -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# Verbose output
curl -v -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# Save response to file
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/logs" > app.log
```

### Systematic Troubleshooting Steps

```bash
# 1. Verify authentication
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/version"

# 2. List all resources
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/resources"

# 3. Check specific resource
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID"

# 4. View logs
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/logs"

# 5. Check deployments
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
     "$COOLIFY_URL/api/v1/applications/$APP_UUID/deployments"
```

## Getting Additional Help

**Coolify Resources:**
- Official Documentation: https://coolify.io/docs
- API Documentation: https://coolify.io/docs/api
- GitHub Issues: https://github.com/coollabsio/coolify
- Discord Community: https://discord.gg/coolify

**Debugging Checklist:**
1. Verify authentication token is valid
2. Check API is enabled (`/api/v1/enable`)
3. Ensure UUIDs are correct
4. Validate JSON syntax
5. Check server connectivity
6. Review application logs
7. Verify environment variables
8. Test with minimal configuration first
