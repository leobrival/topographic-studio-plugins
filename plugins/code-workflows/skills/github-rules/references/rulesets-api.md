# Rulesets API Reference

Modern GitHub rulesets for repository and organization-level rules.

## List Rulesets

```bash
# List repository rulesets
gh api repos/{owner}/{repo}/rulesets

# List organization rulesets
gh api orgs/{org}/rulesets

# Get specific ruleset
gh api repos/{owner}/{repo}/rulesets/{ruleset_id}
```

## Create Ruleset

```bash
gh api repos/{owner}/{repo}/rulesets \
  --method POST \
  --input ruleset.json
```

## Update Ruleset

```bash
gh api repos/{owner}/{repo}/rulesets/{ruleset_id} \
  --method PUT \
  --input ruleset.json
```

## Delete Ruleset

```bash
gh api repos/{owner}/{repo}/rulesets/{ruleset_id} --method DELETE
```

## Ruleset Structure

```json
{
  "name": "Rule name",
  "target": "branch",
  "enforcement": "active",
  "conditions": {},
  "rules": [],
  "bypass_actors": []
}
```

### Target Types

- `branch` - Apply to branches
- `tag` - Apply to tags

### Enforcement Levels

- `disabled` - Rule not enforced
- `active` - Rule enforced
- `evaluate` - Rule evaluated but not enforced (audit mode)

## Conditions

### Branch/Tag Name Patterns

```json
{
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH", "refs/heads/release/*"],
      "exclude": ["refs/heads/hotfix/*"]
    }
  }
}
```

**Special patterns:**

- `~DEFAULT_BRANCH` - Repository default branch
- `~ALL` - All refs
- `refs/heads/*` - All branches
- `refs/tags/*` - All tags

### Repository Selection (Org Rulesets)

```json
{
  "conditions": {
    "repository_name": {
      "include": ["*-api", "*-web"],
      "exclude": ["test-*"]
    }
  }
}
```

## Available Rules

### Pull Request Rules

```json
{
  "type": "pull_request",
  "parameters": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews_on_push": true,
    "require_code_owner_review": false,
    "require_last_push_approval": false,
    "required_review_thread_resolution": true
  }
}
```

### Required Status Checks

```json
{
  "type": "required_status_checks",
  "parameters": {
    "required_status_checks": [
      {"context": "ci", "integration_id": null}
    ],
    "strict_required_status_checks_policy": true
  }
}
```

### Required Deployments

```json
{
  "type": "required_deployments",
  "parameters": {
    "required_deployment_environments": ["staging"]
  }
}
```

### Required Signatures

```json
{
  "type": "required_signatures"
}
```

### Linear History

```json
{
  "type": "required_linear_history"
}
```

### Prevent Actions

```json
{"type": "creation"},
{"type": "update"},
{"type": "deletion"},
{"type": "non_fast_forward"}
```

### Commit Metadata

```json
{
  "type": "commit_message_pattern",
  "parameters": {
    "name": "Conventional commits",
    "pattern": "^(feat|fix|docs|style|refactor|test|chore)(\\(.+\\))?!?: .+",
    "operator": "regex",
    "negate": false
  }
}
```

```json
{
  "type": "commit_author_email_pattern",
  "parameters": {
    "pattern": "@company.com$",
    "operator": "regex",
    "negate": false
  }
}
```

### Branch Name Pattern

```json
{
  "type": "branch_name_pattern",
  "parameters": {
    "pattern": "^(feature|bugfix|hotfix)/[a-z0-9-]+$",
    "operator": "regex",
    "negate": false
  }
}
```

## Bypass Actors

```json
{
  "bypass_actors": [
    {
      "actor_id": 5,
      "actor_type": "RepositoryRole",
      "bypass_mode": "always"
    }
  ]
}
```

### Actor Types

- `RepositoryRole` - Repository role (1=read, 2=triage, 4=write, 5=maintain, 6=admin)
- `Team` - Team ID
- `Integration` - GitHub App ID
- `OrganizationAdmin` - Org admins

### Bypass Modes

- `always` - Can always bypass
- `pull_request` - Can bypass via PR only

## Common Patterns

### Protect Default Branch

```json
{
  "conditions": {
    "ref_name": {
      "include": ["~DEFAULT_BRANCH"],
      "exclude": []
    }
  }
}
```

### Protect All Release Branches

```json
{
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/release/*", "refs/heads/main"],
      "exclude": []
    }
  }
}
```

### Protect Semantic Version Tags

```json
{
  "conditions": {
    "ref_name": {
      "include": ["refs/tags/v[0-9]*"],
      "exclude": ["refs/tags/v*-beta*", "refs/tags/v*-alpha*"]
    }
  }
}
```

## Export/Import Rulesets

### Export

```bash
gh api repos/{owner}/{repo}/rulesets/{id} | jq > ruleset-backup.json
```

### Import

```bash
# Remove id and other generated fields before import
jq 'del(.id, .node_id, .created_at, .updated_at)' ruleset-backup.json > import.json
gh api repos/{owner}/{repo}/rulesets --method POST --input import.json
```
