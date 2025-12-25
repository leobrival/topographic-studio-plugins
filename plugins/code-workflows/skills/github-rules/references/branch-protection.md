# Branch Protection Rules (Legacy)

Legacy branch protection API. Use Rulesets for new projects.

## View Current Protection

```bash
# Get protection rules for a branch
gh api repos/{owner}/{repo}/branches/main/protection

# Check if branch is protected
gh api repos/{owner}/{repo}/branches/main | jq '.protected'
```

## Enable Branch Protection

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
```

## Remove Branch Protection

```bash
gh api repos/{owner}/{repo}/branches/main/protection --method DELETE
```

## Protection Settings Reference

### Required Status Checks

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci", "lint", "test"]
  }
}
```

- `strict`: Require branch to be up-to-date before merge
- `contexts`: List of required CI job names

### Required Reviews

```json
{
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 2,
    "require_last_push_approval": true,
    "dismissal_restrictions": {
      "users": ["admin"],
      "teams": ["leads"]
    },
    "bypass_pull_request_allowances": {
      "users": ["bot"],
      "teams": ["release-team"]
    }
  }
}
```

### Restrictions

Limit who can push to the branch:

```json
{
  "restrictions": {
    "users": ["admin"],
    "teams": ["core-team"],
    "apps": ["github-actions"]
  }
}
```

Set to `null` for no restrictions.

### Additional Settings

```json
{
  "enforce_admins": true,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

## Common Configurations

### Minimal Protection

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  -f required_status_checks='{"strict":false,"contexts":[]}' \
  -f enforce_admins=false \
  -F required_pull_request_reviews=null \
  -F restrictions=null
```

### Standard Protection

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": true
}
EOF
```

### Strict Protection

```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --input - << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci", "security"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 2,
    "require_last_push_approval": true
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF
```

## Migration to Rulesets

Branch protection is being superseded by Rulesets. To migrate:

1. Export current protection settings
2. Create equivalent ruleset (see `assets/rulesets/`)
3. Test ruleset on a non-default branch
4. Remove branch protection
5. Apply ruleset to default branch

```bash
# Export current settings
gh api repos/{owner}/{repo}/branches/main/protection > protection.json

# Create ruleset from template
gh api repos/{owner}/{repo}/rulesets \
  --method POST \
  --input assets/rulesets/standard-team.json

# Remove old protection
gh api repos/{owner}/{repo}/branches/main/protection --method DELETE
```
