---
name: ci-cd-pipelines
description: Guide for creating and configuring CI/CD pipelines with GitHub Actions or GitLab CI. Use when users need to set up automated workflows for testing, building, deploying applications, or managing secrets. Covers Node.js, Python, Docker, Vercel, Railway, Cloudflare, and multi-environment deployments.
---

# CI/CD Pipeline Configuration

Create production-ready CI/CD pipelines for automated testing, building, and deployment.

## Decision Tree

```
User request → Which platform?
    ├─ GitHub Actions → See assets/github-actions/
    │   ├─ What stack?
    │   │   ├─ Node.js/Bun → node-ci.yml or bun-ci.yml
    │   │   ├─ Python → python-ci.yml
    │   │   ├─ Docker → docker-build.yml
    │   │   └─ Monorepo → turbo-ci.yml
    │   │
    │   └─ What deployment?
    │       ├─ Vercel → vercel-deploy.yml
    │       ├─ Railway → railway-deploy.yml
    │       ├─ Cloudflare → cloudflare-deploy.yml
    │       └─ Docker Registry → docker-build.yml
    │
    └─ GitLab CI → See assets/gitlab-ci/
        ├─ What stack?
        │   ├─ Node.js → node-ci.yml
        │   ├─ Python → python-ci.yml
        │   └─ Docker → docker-build.yml
        │
        └─ What deployment?
            ├─ GitLab Pages → pages-deploy.yml
            ├─ Container Registry → docker-build.yml
            └─ Custom → custom-deploy.yml
```

## Quick Start

### GitHub Actions

1. Create `.github/workflows/` directory
2. Copy relevant template from `assets/github-actions/`
3. Configure secrets (see references/secrets.md)
4. Customize triggers and jobs

### GitLab CI

1. Create `.gitlab-ci.yml` at project root
2. Copy relevant template from `assets/gitlab-ci/`
3. Configure CI/CD variables in Settings
4. Customize stages and jobs

## Template Selection Guide

| Use Case | GitHub Actions | GitLab CI |
|----------|---------------|-----------|
| Node.js CI | `node-ci.yml` | `node-ci.yml` |
| Bun CI | `bun-ci.yml` | - |
| Python CI | `python-ci.yml` | `python-ci.yml` |
| Docker Build | `docker-build.yml` | `docker-build.yml` |
| Monorepo (Turbo) | `turbo-ci.yml` | - |
| Vercel Deploy | `vercel-deploy.yml` | - |
| Railway Deploy | `railway-deploy.yml` | - |
| Cloudflare Deploy | `cloudflare-deploy.yml` | - |
| Release & Changelog | `release.yml` | `release.yml` |

## Common Patterns

### Multi-Environment Deployment

```yaml
# GitHub Actions pattern
on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    environment: ${{ github.ref_name == 'main' && 'production' || github.ref_name }}
```

### Matrix Builds

```yaml
# Test across multiple versions
strategy:
  matrix:
    node-version: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
```

### Caching Dependencies

```yaml
# Node.js with pnpm
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

### Conditional Jobs

```yaml
# Run only on specific conditions
if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

## Reference Files

- **Secrets Management**: See [references/secrets.md](references/secrets.md) for secure credential handling
- **Deployment Strategies**: See [references/deployment-strategies.md](references/deployment-strategies.md) for blue-green, canary, rolling updates
- **Troubleshooting**: See [references/troubleshooting.md](references/troubleshooting.md) for common issues

## Best Practices

1. **Fail fast**: Run linting and type checking before tests
2. **Cache aggressively**: Dependencies, build artifacts, Docker layers
3. **Use environments**: Separate staging/production with approvals
4. **Minimal permissions**: Use least-privilege for tokens
5. **Pin versions**: Lock action versions with SHA or major version
6. **Parallelize**: Split tests across multiple jobs
7. **Artifacts**: Save build outputs for deployment jobs
