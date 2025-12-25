# CODEOWNERS Configuration

Automatically request reviews from specific users or teams.

## File Location

Create `.github/CODEOWNERS` in your repository:

```bash
mkdir -p .github
touch .github/CODEOWNERS
```

## Syntax

```text
# This is a comment
# Each line is a pattern followed by owners

# Default owners for everything
*       @owner @team

# Specific file
README.md    @docs-team

# Directory
/docs/       @docs-team

# File extension
*.js         @frontend-team
*.ts         @frontend-team

# Nested directory (any depth)
**/tests/    @qa-team

# Multiple owners
/api/        @backend-team @security-team
```

## Pattern Matching

```text
# Exact file
LICENSE          @legal-team

# All files with extension
*.md             @docs-team

# Directory (trailing slash)
/src/            @core-team

# Recursive match
**/migrations/   @db-team

# Negation (no owner)
!*.md
```

## Common Configurations

### Monorepo with Packages

```text
# Root files
/*               @core-team
/.github/        @devops-team

# Packages
/packages/api/           @backend-team
/packages/web/           @frontend-team
/packages/shared/        @core-team
/packages/*/package.json @core-team

# Configs
*.config.js      @devops-team
*.config.ts      @devops-team
```

### Frontend Project

```text
# Default
*                @frontend-team

# Components
/src/components/ @ui-team

# Styles
*.css            @design-team
*.scss           @design-team

# Tests
**/*.test.ts     @qa-team
**/*.spec.ts     @qa-team

# Build config
webpack.*        @devops-team
vite.*           @devops-team

# CI/CD
/.github/        @devops-team
```

### Backend Project

```text
# Default
*                @backend-team

# API routes
/src/routes/     @api-team
/src/controllers/ @api-team

# Database
/src/models/     @db-team
/migrations/     @db-team
/prisma/         @db-team

# Security
/src/auth/       @security-team
/src/middleware/auth* @security-team

# Infrastructure
/docker/         @devops-team
/k8s/            @devops-team
```

### Open Source Project

```text
# Core maintainers for everything
*                @maintainers

# Documentation
/docs/           @docs-team @maintainers
*.md             @docs-team

# Security-sensitive files
/src/auth/       @security-maintainers
/src/crypto/     @security-maintainers

# CI/CD (limited access)
/.github/workflows/ @release-maintainers
```

## Integration with Branch Protection

For CODEOWNERS to work:

1. Enable branch protection on target branch
2. Enable "Require review from Code Owners"

```bash
# Via API (Rulesets)
{
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "require_code_owner_review": true
      }
    }
  ]
}
```

## Validation

Check CODEOWNERS syntax:

```bash
# GitHub validates automatically on push
# Check in Settings > Repository > Code review > CODEOWNERS

# Manual validation
gh api repos/{owner}/{repo}/codeowners/errors
```

## Best Practices

1. **Start broad, get specific**: Put general rules first
2. **Use teams over individuals**: Easier to maintain
3. **Document patterns**: Add comments explaining rules
4. **Keep it simple**: Too many rules slow down reviews
5. **Review regularly**: Update when team structure changes

## Troubleshooting

### Owner Not Found

```text
# Error: @unknown-user is not a valid owner
# Solution: Ensure user has at least read access to repo
```

### Pattern Not Matching

```text
# Test pattern matching
git check-ignore -v path/to/file
```

### Multiple Owners Conflict

```text
# Last matching pattern wins
/src/         @team-a
/src/api/     @team-b    # This takes precedence for /src/api/*
```
