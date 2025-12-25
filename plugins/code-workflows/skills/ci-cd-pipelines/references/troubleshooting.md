# Troubleshooting CI/CD Pipelines

Common issues and solutions for GitHub Actions and GitLab CI.

## GitHub Actions Issues

### Action Fails with Permission Denied

**Error:**

```text
Error: HttpError: Resource not accessible by integration
```

**Solution:**

```yaml
permissions:
  contents: write
  packages: write
  pull-requests: write
```

### Cache Not Working

**Symptoms:**

- Dependencies downloaded every run
- Slow builds

**Solutions:**

1. Check cache key matches:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

2. Use built-in caching:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

### Workflow Not Triggering

**Check:**

- Branch name matches trigger
- File path is correct (`.github/workflows/`)
- YAML syntax is valid
- Workflow is enabled (Actions tab)

**Debug:**

```yaml
on:
  push:
    branches: ['**'] # All branches for testing
```

### Concurrency Issues

**Problem:** Multiple runs conflict.

**Solution:**

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Artifact Upload Fails

**Error:**

```text
Warning: No files were found with the provided path
```

**Solution:**

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build
    path: |
      dist/
      !dist/**/*.map
    if-no-files-found: error
```

### Docker Build Slow

**Solutions:**

1. Use BuildKit cache:

```yaml
- uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

2. Multi-stage builds with cache mounts:

```dockerfile
FROM node:22 AS builder
RUN --mount=type=cache,target=/root/.npm npm ci
```

## GitLab CI Issues

### Pipeline Stuck in Pending

**Causes:**

- No available runners
- Runner tags don't match

**Solutions:**

1. Check runner status in Settings > CI/CD > Runners
2. Remove or adjust tags:

```yaml
job:
  tags: [] # Use any available runner
```

### Cache Miss Every Time

**Solution:**

```yaml
cache:
  key:
    files:
      - pnpm-lock.yaml
  paths:
    - .pnpm-store/
  policy: pull-push
```

### Variables Not Available

**Check:**

- Variable is not protected (or branch is protected)
- Variable name matches exactly
- Use `$VAR` or `${VAR}` syntax

**Debug:**

```yaml
script:
  - echo "VAR is set to ${MY_VAR:-UNSET}"
```

### Job Dependencies Not Working

**Wrong:**

```yaml
deploy:
  needs: build
```

**Correct:**

```yaml
deploy:
  needs:
    - job: build
      artifacts: true
```

### Docker-in-Docker Not Working

**Solution:**

```yaml
variables:
  DOCKER_HOST: tcp://docker:2376
  DOCKER_TLS_CERTDIR: "/certs"

services:
  - docker:27-dind
```

## Common Cross-Platform Issues

### Environment Variables Not Expanding

**GitHub Actions:**

```yaml
env:
  VERSION: ${{ github.sha }}
```

**GitLab CI:**

```yaml
variables:
  VERSION: $CI_COMMIT_SHA
```

### Secrets Not Available in Forks

**GitHub:** Secrets not passed to fork PRs by default.

**Solution:**

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

### Timeout Issues

**GitHub Actions:**

```yaml
jobs:
  build:
    timeout-minutes: 30
```

**GitLab CI:**

```yaml
job:
  timeout: 30 minutes
```

### Node.js Memory Issues

**Solution:**

```yaml
env:
  NODE_OPTIONS: "--max-old-space-size=4096"
```

### SSL Certificate Errors

**Solution:**

```yaml
env:
  NODE_TLS_REJECT_UNAUTHORIZED: "0" # Only for testing!
```

**Better:**

```yaml
- name: Install CA Certificates
  run: apt-get update && apt-get install -y ca-certificates
```

## Debugging Techniques

### Enable Debug Logging

**GitHub Actions:**

Set repository secret: `ACTIONS_STEP_DEBUG=true`

**GitLab CI:**

```yaml
variables:
  CI_DEBUG_TRACE: "true"
```

### SSH into Runner

**GitHub Actions:**

```yaml
- uses: mxschmitt/action-tmate@v3
  if: failure()
```

### Print Environment

```yaml
- name: Debug Info
  run: |
    echo "Event: ${{ github.event_name }}"
    echo "Ref: ${{ github.ref }}"
    env | sort
```

### Check File Permissions

```yaml
- run: ls -la
- run: stat ./script.sh
```

## Performance Optimization

### Parallelize Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
```

### Use Matrix Builds

```yaml
strategy:
  matrix:
    node: [20, 22]
  fail-fast: false
```

### Skip Unnecessary Steps

```yaml
- name: Run Tests
  if: github.event_name != 'schedule'
```

### Use Smaller Runners

```yaml
runs-on: ubuntu-latest # Cheaper than macos-latest
```

### Minimize Artifact Size

```yaml
- uses: actions/upload-artifact@v4
  with:
    compression-level: 9
    retention-days: 1
```
