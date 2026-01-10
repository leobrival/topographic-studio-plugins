# Neon Troubleshooting Guide

Common issues and solutions for Neon project management, database operations, and connection problems.

## Authentication Issues

### Cannot Authenticate

**Symptom:** `neon auth` fails or OAuth flow doesn't open

**Diagnosis:**

```bash
# Check if already authenticated
neon me

# Check configuration directory
ls -la ~/.config/neonctl/

# Verify API key is set
echo $NEON_API_KEY
```

**Solutions:**

```bash
# Perform fresh authentication
neon auth

# Use explicit API key
export NEON_API_KEY=<your_api_key>
neon projects list --api-key $NEON_API_KEY

# Clear cached credentials
rm -rf ~/.config/neonctl/
neon auth
```

### Invalid API Key

**Symptom:** "Unauthorized" or "Invalid credentials" error

**Diagnosis:**

```bash
# Verify API key exists
echo $NEON_API_KEY | wc -c

# Test connection
neon me --api-key $NEON_API_KEY
```

**Solutions:**

```bash
# Generate new API key from Neon dashboard
neon auth

# Check key format (should be long string)
# Set key explicitly
export NEON_API_KEY=<new_key>

# Update config file
~/.config/neonctl/config.toml
```

## Project Issues

### Project Not Found

**Symptom:** "Project not found" error when accessing project

**Diagnosis:**

```bash
# List all accessible projects
neon projects list

# Verify project ID format
neon projects get <project_id>
```

**Solutions:**

```bash
# Ensure correct project ID
neon projects list -o json | jq -r '.[] | .id' | head -5

# Check organization membership
neon orgs list

# Verify permissions in Neon dashboard
```

### Cannot Create Project

**Symptom:** `neon projects create` fails

**Diagnosis:**

```bash
# Check if project name is unique
neon projects list -o json | jq -r '.[] | .name'

# Verify region is valid
neon projects create --name test --region invalid-region
```

**Solutions:**

```bash
# Use unique project name
neon projects create --name myapp-$(date +%s) --region aws-us-east-1

# Use valid region
# Available: aws-us-east-1, aws-us-west-2, aws-eu-west-1, etc.

# Check organization limits
neon orgs list -o json | jq '.[] | .project_count'
```

### Cannot Delete Project

**Symptom:** "Cannot delete project" or "Project has active resources"

**Solutions:**

```bash
# Ensure no active connections
# Delete all branches first (except main)
neon branches list --project-id <project_id> -o json | \
  jq -r '.[] | select(.name != "main") | .id' | \
  xargs -I {} neon branches delete {}

# Then delete project
neon projects delete <project_id>
```

## Branch Issues

### Branch Not Found

**Symptom:** "Branch not found" when accessing branch

**Diagnosis:**

```bash
# List all branches
neon branches list --project-id <project_id>

# Get branch ID format
neon branches list --project-id <project_id> -o json | jq '.[].id'
```

**Solutions:**

```bash
# Use correct branch ID (not name)
neon branches list --project-id <project_id> -o json | \
  jq '.[] | select(.name=="feature_x") | .id'
```

### Cannot Create Branch

**Symptom:** `neon branches create` fails

**Diagnosis:**

```bash
# Check parent branch exists
neon branches get --project-id <project_id> <parent_branch_id>

# Verify project has space for branches
neon projects get <project_id>
```

**Solutions:**

```bash
# Create from main branch
neon branches create --project-id <project_id> --name new_feature --parent-id <main_branch_id>

# Use unique branch name
neon branches list --project-id <project_id> -o json | jq '.[].name'

# Ensure sufficient plan resources
```

### Missing Compute on Branch

**Symptom:** Branch exists but can't connect (compute resource missing)

**Diagnosis:**

```bash
# Check branch compute status
neon branches get <branch_id> -o json | jq '.compute_endpoints'

# Verify compute is attached
neon branches list --project-id <project_id> -o json | \
  jq '.[] | select(.id=="<branch_id>") | .compute_endpoints'
```

**Solutions:**

```bash
# Add compute to branch
neon branches add-compute <branch_id> --size small

# Check available sizes: small, medium, large

# Wait for compute to initialize (usually 30-60 seconds)
sleep 60
neon branches get <branch_id>
```

## Database Issues

### Database Not Found

**Symptom:** "Database not found" error

**Diagnosis:**

```bash
# List all databases in branch
neon databases list --branch-id <branch_id>

# Verify database name
neon databases list --branch-id <branch_id> -o json | jq '.[] | .name'
```

**Solutions:**

```bash
# Use correct database name
neon databases list --branch-id <branch_id>

# Database might exist on different branch
neon branches list --project-id <project_id> | grep -A 5 <branch_name>
```

### Cannot Create Database

**Symptom:** `neon databases create` fails

**Diagnosis:**

```bash
# Verify branch exists
neon branches get <branch_id>

# Check database limit
neon databases list --branch-id <branch_id> | wc -l
```

**Solutions:**

```bash
# Use unique database name
neon databases list --branch-id <branch_id> -o json | jq '.[].name'

# Create with unique name
neon databases create --branch-id <branch_id> --name app_db_$(date +%s)

# Check plan limits
```

## Role Issues

### Role/User Not Found

**Symptom:** "Role not found" when accessing user

**Diagnosis:**

```bash
# List all roles
neon roles list --branch-id <branch_id>

# Verify role name
neon roles list --branch-id <branch_id> -o json | jq '.[].name'
```

**Solutions:**

```bash
# Use correct role name
neon roles list --branch-id <branch_id>

# Create missing role
neon roles create --branch-id <branch_id> --name app_user --password secret
```

### Cannot Create Role

**Symptom:** `neon roles create` fails

**Diagnosis:**

```bash
# Verify branch has compute
neon branches get <branch_id> -o json | jq '.compute_endpoints'

# Check role limit
neon roles list --branch-id <branch_id> | wc -l
```

**Solutions:**

```bash
# Ensure branch has compute attached
neon branches add-compute <branch_id> --size small

# Use unique role name
neon roles list --branch-id <branch_id> -o json | jq '.[].name'

# Create role with strong password
neon roles create --branch-id <branch_id> --name newuser --password $(openssl rand -base64 12)
```

## Connection Issues

### Cannot Get Connection String

**Symptom:** `neon connection-string` fails or returns empty

**Diagnosis:**

```bash
# Verify branch exists
neon branches get <branch_id>

# Check if branch has compute
neon branches get <branch_id> -o json | jq '.compute_endpoints'

# Verify database exists
neon databases list --branch-id <branch_id>
```

**Solutions:**

```bash
# Ensure branch has compute
neon branches add-compute <branch_id> --size small

# Create default database if missing
neon databases create --branch-id <branch_id> --name neondb

# Get specific branch connection string
neon connection-string <branch_name>
```

### Connection Timeout

**Symptom:** Cannot connect to database from application

**Diagnosis:**

```bash
# Verify connection string format
neon connection-string

# Check IP allowlist
neon ip-allow list --project-id <project_id>

# Test connectivity
psql <connection_string>
```

**Solutions:**

```bash
# Add client IP to allowlist
neon ip-allow add --project-id <project_id> --ip <your_ip>/32

# Check firewall/network access
# Verify branch has compute active
neon branches get <branch_id> -o json | jq '.compute_endpoints[0].type'

# Wait for branch to be ready (may take 60 seconds after creation)
```

### Wrong Connection String Format

**Symptom:** Connection string missing parameters or malformed

**Diagnosis:**

```bash
# Check connection string output
neon connection-string

# Verify format: postgresql://user:password@host:port/database
```

**Solutions:**

```bash
# Ensure database exists
neon databases list --branch-id <branch_id>

# Recreate with JSON output for debugging
neon connection-string -o json

# Connection string should include: host, port, database, user, password
```

## IP Allowlist Issues

### IP Not Whitelisted

**Symptom:** "Connection refused" or "Host is not allowed to connect"

**Diagnosis:**

```bash
# Check current allowlist
neon ip-allow list --project-id <project_id>

# Identify your IP
curl -s ipinfo.io | jq '.ip'
```

**Solutions:**

```bash
# Add your IP to allowlist
YOUR_IP=$(curl -s ipinfo.io | jq -r '.ip')
neon ip-allow add --project-id <project_id> --ip $YOUR_IP/32

# Allow CIDR range (less secure)
neon ip-allow add --project-id <project_id> --ip 0.0.0.0/0

# For development, allow specific IP range
neon ip-allow add --project-id <project_id> --ip 192.168.1.0/24
```

### Cannot Manage Allowlist

**Symptom:** Permission denied when modifying allowlist

**Solutions:**

```bash
# Verify correct project ID
neon projects list

# Check permissions
neon me

# Use API key with sufficient permissions
export NEON_API_KEY=<full_permissions_key>
```

## Operations & Monitoring

### Long-Running Operation Stuck

**Symptom:** Operation appears stuck or doesn't complete

**Diagnosis:**

```bash
# List active operations
neon operations list --project-id <project_id>

# Check operation status
neon operations list --project-id <project_id> -o json | jq '.[]'
```

**Solutions:**

```bash
# Wait for operation to complete (usually 5-10 minutes)
# Monitor progress
neon operations list --project-id <project_id> --watch

# If truly stuck, try recreating resource
neon branches delete <branch_id>
neon branches create --project-id <project_id> --name new_branch
```

## Regional Issues

### Wrong Region Selected

**Symptom:** Project in unexpected region

**Solutions:**

```bash
# Verify available regions
# aws-us-east-1, aws-us-west-2, aws-eu-west-1, etc.

# Create project in correct region
neon projects create --name myapp --region aws-eu-west-1

# Cannot change region after creation (delete and recreate)
neon projects delete <project_id>
neon projects create --name myapp --region aws-eu-west-1
```

## Rate Limiting

### Too Many API Requests

**Symptom:** "Rate limit exceeded" error

**Solutions:**

```bash
# Add delays between commands in scripts
neon projects list
sleep 1
neon branches list --project-id <project_id>
sleep 1

# Batch operations in single commands
# Use JSON output for scripting with fewer calls
neon projects list -o json | jq '.[]'
```

## General Troubleshooting

### Enable Debug Output

```bash
# Run command with verbose output
neon projects list --debug

# Check logs
cat ~/.config/neonctl/logs.txt

# Set debug environment variable
export NEON_DEBUG=1
neon projects list
```

### Check CLI Version

```bash
# Check installed version
neon --version

# Update to latest version
brew upgrade neonctl
npm update -g neonctl
bun update -g neonctl
```

### Verify Installation

```bash
# Check command availability
which neon

# Test basic command
neon --help

# Verify API connectivity
neon me
```

