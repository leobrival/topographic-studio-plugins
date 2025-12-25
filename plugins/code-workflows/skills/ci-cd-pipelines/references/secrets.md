# Secrets Management

Secure credential handling for CI/CD pipelines.

## GitHub Actions Secrets

### Setting Up Secrets

1. Go to Repository Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Enter name and value
4. Use in workflow: `${{ secrets.SECRET_NAME }}`

### Common Secrets

**Vercel:**

- `VERCEL_TOKEN` - Vercel Dashboard > Settings > Tokens
- `VERCEL_ORG_ID` - Run `vercel link`, check `.vercel/project.json`
- `VERCEL_PROJECT_ID` - Run `vercel link`, check `.vercel/project.json`

**Railway:**

- `RAILWAY_TOKEN` - Railway Dashboard > Account > Tokens

**Cloudflare:**

- `CLOUDFLARE_API_TOKEN` - Cloudflare Dashboard > API Tokens
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare Dashboard > Overview

**Other:**

- `NPM_TOKEN` - npm > Access Tokens > Generate
- `CODECOV_TOKEN` - Codecov > Settings > Upload Token
- `TURBO_TOKEN` - Vercel Dashboard > Turborepo

### Environment-Specific Secrets

```yaml
jobs:
  deploy:
    environment: production
    steps:
      - run: echo ${{ secrets.PROD_API_KEY }}
```

### Organization Secrets

For secrets shared across repositories:

1. Go to Organization Settings > Secrets and variables > Actions
2. Create secret with repository access policy

## GitLab CI/CD Variables

### Setting Up Variables

1. Go to Settings > CI/CD > Variables
2. Click "Add variable"
3. Configure protection and masking
4. Use in pipeline: `$VARIABLE_NAME`

### Variable Options

- **Protected** - Only available on protected branches/tags
- **Masked** - Hidden in job logs
- **Expanded** - Variables can reference other variables
- **File** - Create file from variable content

### Common Variables

```yaml
variables:
  REGISTRY: $CI_REGISTRY
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG
```

### Predefined Variables

GitLab provides many built-in variables:

- `$CI_COMMIT_SHA` - Full commit SHA
- `$CI_COMMIT_REF_NAME` - Branch or tag name
- `$CI_PIPELINE_ID` - Pipeline ID
- `$CI_PROJECT_NAME` - Project name
- `$CI_REGISTRY` - Container registry URL

## Security Best Practices

### Never Expose Secrets

```yaml
# BAD - Secret in logs
- run: echo ${{ secrets.API_KEY }}

# GOOD - Use secret directly
- run: curl -H "Authorization: ${{ secrets.API_KEY }}" $URL
```

### Mask Sensitive Output

```yaml
# GitHub Actions
- run: |
    echo "::add-mask::$SECRET_VALUE"
    echo $SECRET_VALUE

# GitLab CI
script:
  - echo "$SECRET" | base64
```

### Rotate Secrets Regularly

1. Generate new token
2. Update CI/CD secret
3. Verify pipelines work
4. Revoke old token

### Use Short-Lived Tokens

```yaml
# GitHub Actions - OIDC for AWS
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789:role/GitHubActions
      aws-region: us-east-1
```

### Limit Secret Scope

```yaml
# Only specific jobs can access
jobs:
  deploy:
    environment: production
    secrets:
      inherit: false
```

## Environment Protection Rules

### GitHub Environments

1. Go to Settings > Environments
2. Create environment (staging, production)
3. Add protection rules:
   - Required reviewers
   - Wait timer
   - Branch restrictions

### GitLab Environments

```yaml
deploy-production:
  environment:
    name: production
    url: https://example.com
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
```

## Secrets in Monorepos

### Per-Package Secrets

```yaml
jobs:
  deploy-api:
    environment: api-production
    env:
      API_KEY: ${{ secrets.API_KEY }}

  deploy-web:
    environment: web-production
    env:
      ANALYTICS_KEY: ${{ secrets.ANALYTICS_KEY }}
```

### Shared Secrets

Use organization/group-level secrets for shared credentials.
