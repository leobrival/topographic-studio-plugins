# Convex Troubleshooting Guide

Common issues and solutions for Convex development and deployment.

## Authentication Issues

### Cannot Login to Convex

**Symptom:** `convex login` fails or hangs

**Diagnosis:**
```bash
# Check authentication status
convex whoami

# Check CLI version
convex --version

# View config location
echo $HOME/.convex/config
```

**Solutions:**
```bash
# Clear credentials and re-login
rm -rf ~/.convex
convex login

# Use authentication token manually
export CONVEX_ADMIN_KEY=your-admin-key
convex deploy

# Check network connectivity
ping prod.convex.cloud
```

### Authentication Token Expired

**Symptom:** "Unauthorized" or "Invalid token" errors

**Solutions:**
```bash
# Re-authenticate
convex logout
convex login

# Or use fresh admin key
convex deploy --admin-key $FRESH_ADMIN_KEY
```

## Development Server Issues

### Development Server Won't Start

**Symptom:** `convex dev` fails to start

**Diagnosis:**
```bash
# Check port availability
lsof -i :3210  # Default admin port

# Check project structure
ls -la convex/

# Verify convex.json exists
cat convex.json
```

**Solutions:**
```bash
# Use different port
convex dev --admin-port 3211

# Clear existing state
convex dev --clear-deployment

# Verbose output for debugging
convex dev --verbose

# Check if project is initialized
convex init
```

### Hot Reload Not Working

**Symptom:** Changes to functions don't reload

**Diagnosis:**
```bash
# Verify watch is enabled
convex dev --watch

# Check file system
ls convex/queries/
ls convex/mutations/
```

**Solutions:**
```bash
# Restart dev server
# Stop with Ctrl+C and run again
convex dev

# Enable explicit watching
convex dev --watch

# Check .convexignore for exclusions
cat .convexignore
```

### Cannot Access Dev Dashboard

**Symptom:** Cannot open http://localhost:3210 or dashboard is blank

**Diagnosis:**
```bash
# Check if port is open
lsof -i :3210

# Check logs for errors
convex dev --verbose
```

**Solutions:**
```bash
# Use different port
convex dev --admin-port 3211

# Open dashboard manually
convex dashboard

# Check firewall settings
sudo ufw allow 3210
```

## Deployment Issues

### Deployment Fails

**Symptom:** `convex deploy` fails with error

**Diagnosis:**
```bash
# Type check code
npm run typecheck  # or tsc

# Verify no syntax errors
node --check convex/queries/*.js

# Test dry run
convex deploy --dry-run
```

**Solutions:**
```bash
# Fix TypeScript errors
convex deploy --typecheck

# Verify project selection
convex deploy --project my-project

# Use verbose mode
convex deploy --verbose

# Check project exists
convex projects list
```

### Schema Validation Errors

**Symptom:** "Schema validation failed" error during deploy

**Solutions:**
```bash
# Review schema file
cat convex/schema.ts

# Check for invalid field definitions
convex deploy --verbose

# Verify Convex schema syntax
# Ensure v.object, v.string, v.number are correct
```

## Function Execution Issues

### Function Not Found Error

**Symptom:** "Function not found" when running `convex run`

**Diagnosis:**
```bash
# List available functions
convex dashboard --functions

# Check file path
ls convex/queries/myFunction.ts

# Verify export statement
grep "export" convex/queries/myFunction.ts
```

**Solutions:**
```bash
# Correct function path format
convex run queries/myFunction

# Export function properly
# export const myFunction = query({...})

# Redeploy after changes
convex deploy
```

### Function Arguments Error

**Symptom:** "Invalid arguments" when running function

**Diagnosis:**
```bash
# Verify argument schema
cat convex/queries/myFunction.ts

# Test with simple arguments
convex run myFunction --args '{}'

# Check argument format
convex run myFunction --args '{"key": "value"}'
```

**Solutions:**
```bash
# Use valid JSON
convex run myFunction --args '{"id": 123}'

# Use args file for complex data
echo '{"id": 123, "name": "test"}' > args.json
convex run myFunction --args-file args.json

# Check function parameter types
# Arguments must match schema validation
```

### Function Returns Undefined

**Symptom:** Query or mutation returns null/undefined unexpectedly

**Solutions:**
```bash
# Add logging to function
console.log("Debug:", value);

# Check return statement
# Ensure function returns a value

# Verify database queries
// db.query("table").collect()

# Monitor logs
convex logs --function myFunction --follow
```

## Data Issues

### Import Fails

**Symptom:** `convex import` fails with error

**Diagnosis:**
```bash
# Verify JSON format
jq . data.json

# Check table exists
convex dashboard --data

# Verify schema compatibility
cat convex/schema.ts
```

**Solutions:**
```bash
# Ensure valid JSON
jq . data.json  # Should work without errors

# Check table name matches
convex import correct-table-name data.json

# Use --replace for updates
convex import users data.json --replace

# Batch import
convex import --all data/
```

### Export Creates Empty File

**Symptom:** Exported data is empty or very small

**Diagnosis:**
```bash
# Check if table has data
convex run queries/countUsers

# View data in dashboard
convex dashboard --data

# Check export format
convex export users --format jsonl
```

**Solutions:**
```bash
# Export from correct environment
convex export users --prod  # For production data

# Check table name is correct
convex export correct-table-name

# List all tables
convex dashboard --data
```

### Data Persistence Issues

**Symptom:** Data appears to be lost or inconsistent

**Solutions:**
```bash
# Backup before major operations
convex export --all --output backup.json

# Verify changes persisted
convex run queries/getItem --args '{"id": "xyz"}'

# Check deployment
convex deployments list

# Clear and reimport if needed
# convex data clear --all
convex import users fresh-data.json
```

## Environment Variable Issues

### Environment Variables Not Loading

**Symptom:** Functions can't access environment variables

**Diagnosis:**
```bash
# Check vars are set
convex env list

# Verify in dashboard
convex dashboard --settings

# Check .env.local file exists
cat .env.local
```

**Solutions:**
```bash
# Set environment variable
convex env set MY_KEY my_value

# For production
convex env set MY_KEY my_value --prod

# Verify it's set
convex env get MY_KEY

# Redeploy to pick up changes
convex deploy
```

### .env File Not Being Read

**Symptom:** Variables from .env file not available

**Solutions:**
```bash
# Use env file explicitly
convex env set --env-file .env.local

# Manually set each variable
convex env set API_KEY $(grep API_KEY .env | cut -d= -f2)

# Check .env file format
cat .env
# Should be: KEY=value (no quotes needed)
```

## Logs & Monitoring Issues

### Cannot View Logs

**Symptom:** `convex logs` shows no output

**Diagnosis:**
```bash
# Check if functions are executing
convex run queries/testFunction

# Verify logs are available
convex logs --limit 50

# Check production
convex logs --prod
```

**Solutions:**
```bash
# Follow logs in real-time
convex logs --follow

# Show more lines
convex logs --limit 100

# Filter by function
convex logs --function myFunction --follow

# Check specific deployment
convex logs --prod
```

### Dashboard Not Loading

**Symptom:** Dashboard is blank or won't load

**Solutions:**
```bash
# Open dashboard explicitly
convex dashboard

# Clear browser cache
# Restart dev server
convex dev

# Check browser console for errors
# Open Developer Tools > Console tab

# Try different browser
```

## Type Generation Issues

### Generated Types Not Updating

**Symptom:** TypeScript errors after function changes

**Diagnosis:**
```bash
# Check generated types exist
ls convex/_generated/

# Verify schema file
cat convex/schema.ts
```

**Solutions:**
```bash
# Regenerate types
convex codegen

# During development
convex dev --codegen

# Restart dev server
# Kill convex dev and restart

# Clear generated files
rm -rf convex/_generated/
convex codegen
```

### Type Mismatches

**Symptom:** "Type 'X' is not assignable to type 'Y'" errors

**Solutions:**
```bash
# Regenerate types
convex codegen

# Update imports
import { Doc } from "./_generated/dataModel"

# Check schema matches usage
# Ensure all mutations match schema.ts

# Run type check
npm run typecheck
```

## Performance Issues

### Slow Function Execution

**Symptom:** Functions take too long to execute

**Solutions:**
```bash
# Monitor logs
convex logs --function slowFunction --follow

# Check database queries
// Use batching instead of loops
// Use indexes for filtering

# Profile in dashboard
convex dashboard --functions

# Check environment setup
convex env list
```

### Timeout Errors

**Symptom:** "Function timed out" errors

**Solutions:**
```bash
# Check function logic
cat convex/queries/timeoutFunction.ts

# Move heavy operations to actions
// Use actions for long-running tasks

# Optimize database queries
// Use filters in queries instead of client-side

# Increase timeout if needed (limited by plan)
```

## Project Configuration Issues

### Project Not Found

**Symptom:** "Project not found" error

**Diagnosis:**
```bash
# List available projects
convex projects list

# Check current project setting
cat convex.json

# Verify project exists
convex config show
```

**Solutions:**
```bash
# Set correct project
convex init --project correct-project-name

# Switch projects
convex config set default-project my-project

# Create project if missing
convex projects create
```

### Configuration Corruption

**Symptom:** "Invalid configuration" errors

**Solutions:**
```bash
# Reset configuration
convex config reset

# Reinitialize project
convex reinit

# Verify convex.json format
cat convex.json
# Should be valid JSON

# Restore from backup if needed
```

## Team & Access Issues

### Cannot Access Team Project

**Symptom:** "Access denied" or "Project not found"

**Solutions:**
```bash
# Switch to correct team
convex teams list
convex teams switch my-team

# List projects in team
convex projects list

# Verify project name
convex init --project team-project
```

### Permission Denied Errors

**Symptom:** Cannot deploy or access production

**Solutions:**
```bash
# Verify authentication
convex whoami

# Check team/project permissions
convex teams list

# Use admin key for CI/CD
export CONVEX_ADMIN_KEY=your-admin-key
convex deploy
```

## Best Practices for Troubleshooting

### General Debugging Workflow

```bash
# 1. Check status
convex whoami
convex config show

# 2. Verify project
convex projects list
convex deployments list

# 3. Run in verbose mode
convex dev --verbose
convex deploy --verbose

# 4. Check logs
convex logs --limit 100
convex logs --follow

# 5. View dashboard
convex dashboard
convex dashboard --data
convex dashboard --logs
```

### Common Fixes

```bash
# Restart dev server
# Press Ctrl+C and run again
convex dev

# Clear state
convex dev --clear-deployment

# Redeploy
convex deploy

# Regenerate types
convex codegen

# Re-authenticate
convex logout
convex login
```
