# GitHub CLI Troubleshooting Guide

Common issues and solutions for GitHub CLI operations.

## Authentication Issues

### Cannot Authenticate

**Symptom:** `gh auth login` fails or credentials not recognized

**Diagnosis:**

```bash
# Check authentication status
gh auth status

# Check config
cat ~/.config/gh/config.yml

# Test API access
gh api /user
```

**Solutions:**

```bash
# Re-authenticate
gh auth logout
gh auth login

# Use specific protocol
gh auth login --web  # Browser-based
gh auth login --ssh  # SSH key

# Troubleshoot OAuth
gh auth login --hostname github.com

# For GitHub Enterprise
gh auth login --hostname github.enterprise.com
```

### Invalid Token

**Symptom:** "Bad credentials" or "Token expired"

**Diagnosis:**

```bash
# Check token status
gh auth status

# View stored credentials
cat ~/.config/gh/config.yml | grep token
```

**Solutions:**

```bash
# Generate new token on GitHub
# https://github.com/settings/tokens

# Clear old credentials
gh auth logout
gh auth login

# Use new token when prompted
```

### Rate Limit Exceeded

**Symptom:** API rate limit errors

**Diagnosis:**

```bash
# Check current rate limit
gh api rate-limit

# View limit details
gh api rate-limit --jq '.rate'
```

**Solutions:**

```bash
# Authenticate (increases limit from 60 to 5000)
gh auth login

# Check rate limit again
gh api rate-limit

# Wait for reset (shown in rate-limit output)

# Reduce request frequency
# Use pagination with --paginate
gh api /repos/owner/repo/issues --paginate
```

## SSH Key Issues

### SSH Keys Not Recognized

**Symptom:** Permission denied when pushing to remote

**Diagnosis:**

```bash
# Check SSH key setup
gh auth status

# Verify SSH keys on account
gh ssh-key list

# Test SSH connection
ssh -T git@github.com
```

**Solutions:**

```bash
# Add SSH key to GitHub
gh ssh-key add ~/.ssh/id_ed25519.pub

# Check key permissions
ls -la ~/.ssh/

# Generate new key if needed
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""

# Add to SSH agent
ssh-add ~/.ssh/id_ed25519

# Reconfigure git
gh auth logout
gh auth login --ssh
```

### SSH Key Passphrase Issues

**Symptom:** Prompted for passphrase repeatedly

**Diagnosis:**

```bash
# Check if SSH agent is running
ps aux | grep ssh-agent

# Check loaded keys
ssh-add -l
```

**Solutions:**

```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add key with passphrase
ssh-add ~/.ssh/id_ed25519

# Make permanent (add to shell profile)
echo 'eval "$(ssh-agent -s)"' >> ~/.bashrc
```

## Repository Issues

### Cannot Clone Repository

**Symptom:** `gh repo clone` fails with authentication error

**Diagnosis:**

```bash
# Check auth status
gh auth status

# Verify repository exists
gh repo view owner/repo

# Test git clone
git clone https://github.com/owner/repo.git
```

**Solutions:**

```bash
# Ensure authenticated
gh auth login

# Try explicit HTTPS
gh repo clone --protocol https owner/repo

# Check for network issues
ping github.com

# For private repos, verify access
gh repo view owner/repo --json isPrivate
```

### Cannot Create Repository

**Symptom:** `gh repo create` fails

**Diagnosis:**

```bash
# Check permissions
gh auth status

# Verify not at limit
gh api /user --jq '.public_repos'
```

**Solutions:**

```bash
# Ensure sufficient permissions
gh auth logout && gh auth login

# Check for naming conflicts
gh repo list --limit 100 | grep desired-name

# Try different name
gh repo create different-name

# For org repos, verify org access
gh auth status
```

## Issue Management

### Cannot Create Issue

**Symptom:** `gh issue create` fails

**Diagnosis:**

```bash
# Check repository access
gh repo view

# Verify not at API limit
gh api rate-limit
```

**Solutions:**

```bash
# Ensure in repository directory
cd repo
gh repo view

# Or specify repository explicitly
gh issue create --repo owner/repo --title "Issue"

# Check for required fields
gh issue create --title "Title" --body "Description"

# For private repos, ensure access
gh auth login
```

### Issue Title Too Long

**Symptom:** "Title is too long" error

**Solutions:**

```bash
# Keep title under 256 characters
gh issue create --title "Short title" --body "Full description in body"
```

## Pull Request Issues

### Cannot Create Pull Request

**Symptom:** `gh pr create` fails

**Diagnosis:**

```bash
# Check branch exists
git branch -a

# Verify repository
gh repo view

# Check if PR already exists
gh pr list
```

**Solutions:**

```bash
# Push branch first
git push origin feature-branch

# Then create PR
gh pr create \
  --head feature-branch \
  --base main \
  --title "PR title"

# Ensure base branch exists
git branch -r | grep base-branch

# For remote branch, use full name
gh pr create --head feature --base upstream/main
```

### Cannot Merge Pull Request

**Symptom:** `gh pr merge` fails with "not permitted" or "conflict"

**Diagnosis:**

```bash
# Check PR status
gh pr view 123

# Check protection rules
gh api repos/owner/repo/branches/main/protection

# Check for conflicts
gh pr diff 123 | grep "^<<<"
```

**Solutions:**

```bash
# Resolve conflicts locally
gh pr checkout 123
# Fix conflicts in editor
git add .
git commit

# Check all required checks passed
gh pr view 123 --json statusCheckRollup

# Update branch if behind
gh pr view 123 --json baseRefName -q | \
  xargs -I {} git merge origin/{}

# Try merge again
gh pr merge 123 --squash

# For admin user, force merge
gh pr merge 123 --admin
```

### Cannot Checkout PR

**Symptom:** `gh pr checkout` fails

**Diagnosis:**

```bash
# Verify PR exists
gh pr view 123

# Check branch name
gh pr view 123 --json headRefName
```

**Solutions:**

```bash
# Ensure authenticated
gh auth login

# Try explicit PR reference
gh pr checkout 123

# Or checkout branch manually
gh pr view 123 --json headRefName -q | xargs git checkout

# For external PR, enable fetch
git remote add fork https://github.com/forker/repo.git
git fetch fork
```

## Workflow Issues

### Workflow Doesn't Trigger

**Symptom:** Push doesn't trigger workflow

**Diagnosis:**

```bash
# Check workflow exists
gh workflow list

# Check workflow is enabled
gh workflow list --all

# View recent runs
gh run list
```

**Solutions:**

```bash
# Ensure workflow is enabled
gh workflow enable ci.yml

# Check branch filters in workflow
gh api repos/owner/repo/actions/workflows/ci.yml/runs

# Verify branch matches filter
git branch --show-current

# Workflow files must be in default branch
git push origin main

# Re-push to trigger
git commit --allow-empty -m "Trigger workflow"
git push
```

### Workflow Runs Fail

**Symptom:** Workflow fails with error

**Diagnosis:**

```bash
# View run logs
gh run view 123456 --log

# Check step status
gh run view 123456 --json jobs

# Look for error details
gh run view 123456 --log | grep -i error
```

**Solutions:**

```bash
# Rerun failed workflow
gh run rerun 123456

# Rerun only failed steps
gh run rerun 123456 --failed

# Check logs for specific error
gh run view 123456 --log | less

# Review workflow file syntax
cat .github/workflows/ci.yml

# Check environment variables
gh variable list
gh secret list

# For missing secrets, add them
gh secret set SECRET_NAME < secret.txt
```

### Workflow Timeout

**Symptom:** Workflow exceeds 6-hour timeout

**Solutions:**

```bash
# Optimize workflow
# - Run jobs in parallel instead of serial
# - Remove unnecessary steps
# - Increase timeout in workflow file
timeout-minutes: 30

# Split workflow into multiple jobs
jobs:
  build:
    runs-on: ubuntu-latest
    # ... fast operations

  test:
    runs-on: ubuntu-latest
    # ... longer operations
```

## Actions Issues

### Rate Limit on Actions

**Symptom:** Workflow throttled or canceled

**Diagnosis:**

```bash
# Check concurrent job limits
gh api repos/owner/repo/actions/permissions

# View recent runs
gh run list --limit 20
```

**Solutions:**

```bash
# Reduce concurrent workflows
# In workflow file, use concurrency:
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Reduce job parallelism
# In workflow matrix: max-parallel: 2

# Schedule less frequent runs
# In workflow: on: schedule: - cron: '0 2 * * 0'
```

### Missing Artifacts

**Symptom:** Artifact not found in workflow

**Diagnosis:**

```bash
# Check if artifact uploaded
gh run view 123456 --json artifacts

# Check step output
gh run view 123456 --log | grep artifact
```

**Solutions:**

```bash
# Verify upload step
- name: Upload artifact
  uses: actions/upload-artifact@v3
  with:
    name: build
    path: dist/

# Check artifact retention
gh api repos/owner/repo/actions/artifacts | jq '.artifacts[].expires_at'

# Artifacts expire after 90 days
```

## API Issues

### API Request Fails

**Symptom:** `gh api` returns error

**Diagnosis:**

```bash
# Test API access
gh api /user

# Check authentication
gh auth status

# View error details
gh api /repos/owner/repo/issues -v
```

**Solutions:**

```bash
# Verify endpoint exists
gh api /repos/owner/repo/issues

# Use correct HTTP method
gh api -X POST /repos/owner/repo/issues

# Check authentication scope
gh auth status

# For private data, verify token has access
gh auth logout && gh auth login
```

## Search Issues

### No Results Found

**Symptom:** `gh search` returns empty

**Diagnosis:**

```bash
# Test search with broad term
gh search repos "python"

# Check syntax
gh search issues "bug" --state open
```

**Solutions:**

```bash
# Use simpler search terms
gh search repos "react"  # Instead of complex filters

# GitHub search syntax is limited in CLI
# Use full GitHub search on web for complex queries
# https://github.com/search

# Try multiple searches
gh search issues "bug"
gh search issues "feature"
```

## General Troubleshooting

### Enable Debug Logging

```bash
# Run command with debug output
GH_DEBUG=api gh issue list

# Or use verbose flag
gh issue create --help
```

### Check Configuration

```bash
# View current config
gh config list

# View stored configuration
cat ~/.config/gh/config.yml

# Reset configuration
rm ~/.config/gh/config.yml
gh auth login
```

### Clear Cache

```bash
# Clear gh cache
rm -rf ~/.cache/gh

# Or specific cache item
rm -rf ~/.cache/gh/api-cache
```

### Get Help

```bash
# View help for command
gh issue create --help

# Search documentation
# https://cli.github.com/manual

# File issue with gh project
# https://github.com/cli/cli/issues
```

## Common Error Messages

### "repository not found"

- Check repository name spelling
- Verify you have access to repository
- For private repos: `gh auth login`

### "pull request already exists"

- Check `gh pr list` for existing PR
- Use different branch or update existing PR

### "branch not found"

- Push branch first: `git push origin branch-name`
- Verify branch exists: `git branch -a`

### "permission denied"

- Check authentication: `gh auth status`
- Verify permissions on repository
- For admin operations: check if you're repo admin

### "Could not resolve host"

- Check network connection
- Verify GitHub is accessible
- Check firewall/proxy settings
