---
name: github-cli
description: GitHub CLI (gh) expert for repository management. Use when users need to manage repos, issues, PRs, Actions, secrets, or interact with GitHub.
allowed-tools: Bash(gh:*)
---

# GitHub CLI Guide

GitHub CLI (`gh`) enables command-line management of repositories, issues, pull requests, and GitHub workflows. This guide provides essential workflows and quick references for common GitHub operations.

## Quick Start

```bash
# Authenticate with GitHub
gh auth login

# Check authentication status
gh auth status

# View current repository
gh repo view

# List open issues
gh issue list

# List open pull requests
gh pr list
```

## Common Workflows

### Workflow 1: Fork and Contribute

```bash
# Fork repository
gh repo fork owner/repo

# Clone your fork
gh repo clone your-username/repo

# Create feature branch
cd repo
git checkout -b feature/my-feature

# Make changes, then create PR
gh pr create --title "Add feature" --body "Description of changes"

# Push to GitHub
git push origin feature/my-feature
```

### Workflow 2: Issue Management

```bash
# Create issue
gh issue create --title "Bug: Login fails" --body "Steps to reproduce..."

# List assigned to you
gh issue list --assignee @me

# View issue details
gh issue view 123

# Close issue with comment
gh issue close 123 --comment "Fixed in PR #456"
```

### Workflow 3: Pull Request Review

```bash
# Create PR (draft for review)
gh pr create --draft --title "Work in progress"

# List open PRs
gh pr list

# View PR with diff
gh pr view 123
gh pr diff 123

# Checkout PR branch locally
gh pr checkout 123

# Merge when ready
gh pr merge 123 --squash
```

### Workflow 4: GitHub Actions Management

```bash
# List recent workflow runs
gh run list

# View run details and logs
gh run view 123456 --log

# Rerun failed jobs
gh run rerun 123456 --failed

# Cancel running workflow
gh run cancel 123456

# Trigger workflow manually
gh workflow run ci.yml --field environment=production
```

### Workflow 5: Release Management

```bash
# Create release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes here"

# List releases
gh release list

# View release details
gh release view v1.0.0

# Upload assets to release
gh release upload v1.0.0 ./build/app.tar.gz
```

## Decision Tree

**When to use which command:**

- **To manage repositories**: Use `gh repo` (create, clone, fork, view)
- **To work with issues**: Use `gh issue` (create, list, view, close)
- **To work with PRs**: Use `gh pr` (create, list, view, checkout, merge)
- **To manage workflows**: Use `gh run` and `gh workflow` (list, view, rerun, trigger)
- **To create releases**: Use `gh release` (create, list, view, upload)
- **To manage secrets**: Use `gh secret` (set, list)
- **To manage variables**: Use `gh variable` (set, list)
- **For detailed command syntax**: See [Commands Reference](./reference/commands-reference.md)
- **For complex scenarios**: See [Common Patterns](./reference/common-patterns.md)
- **For troubleshooting**: See [Troubleshooting Guide](./reference/troubleshooting.md)

## Common Patterns

### Repository Management

```bash
# View repository details
gh repo view --web  # Open in browser

# Fork and setup
gh repo fork owner/repo --clone

# List your repositories
gh repo list --limit 20

# List organization repos
gh repo list myorg --visibility public
```

### Issue Workflows

```bash
# Create issue with labels and assignees
gh issue create \
  --title "Bug report" \
  --body "Description" \
  --label "bug,needs-triage" \
  --assignee @me

# Filter issues
gh issue list --state all --assignee @me
gh issue list --label "bug" --state open
```

### Pull Request Workflows

```bash
# Create PR with options
gh pr create \
  --title "Fix: Critical bug" \
  --body "Fixes #123" \
  --label "bug,fix" \
  --reviewer reviewer1,reviewer2

# Merge strategies
gh pr merge 123 --squash     # Squash commits
gh pr merge 123 --rebase     # Rebase merge
gh pr merge 123              # Merge commit (default)
```

### GitHub Actions & Workflows

```bash
# List workflows
gh workflow list

# Enable/disable workflow
gh workflow enable ci.yml
gh workflow disable ci.yml

# Monitor runs
gh run list --workflow=ci.yml --status failure
```

## Troubleshooting

**Common Issues:**

1. **Authentication failed**
   - Solution: Run `gh auth login` and follow prompts
   - See: [Authentication Issues](./reference/troubleshooting.md#authentication-issues)

2. **Can't push to remote**
   - Quick fix: Verify SSH key with `gh auth status`
   - See: [SSH Key Issues](./reference/troubleshooting.md#ssh-key-issues)

3. **PR merge fails**
   - Quick fix: Check branch protection rules with `gh repo view`
   - See: [Merge Conflicts](./reference/troubleshooting.md#merge-conflicts)

4. **Workflow doesn't trigger**
   - Quick fix: Verify branch protection with `gh workflow list`
   - See: [Actions Issues](./reference/troubleshooting.md#workflow-issues)

5. **Rate limit errors**
   - Quick fix: Check limits with `gh api rate-limit`
   - See: [Rate Limiting](./reference/troubleshooting.md#rate-limiting)

For detailed troubleshooting steps, see the [Troubleshooting Guide](./reference/troubleshooting.md).

## Reference Files

**Load as needed for detailed information:**

- **[Commands Reference](./reference/commands-reference.md)** - Complete CLI command documentation with all flags and options. Use when you need exact syntax or flag details for any gh command.

- **[Common Patterns](./reference/common-patterns.md)** - Real-world patterns and workflows for repository management, issue/PR workflows, CI/CD integration, team collaboration, and release management. Use for implementing specific workflows or integrations.

- **[Troubleshooting Guide](./reference/troubleshooting.md)** - Detailed error messages, diagnosis steps, and resolution strategies for authentication, SSH, API, network, and workflow issues. Use when encountering errors or unexpected behavior.

**When to use each reference:**

- Use **Commands Reference** when you need exact syntax, flag combinations, or comprehensive command documentation
- Use **Common Patterns** for implementing team workflows, CI/CD pipelines, or advanced release management
- Use **Troubleshooting** when authentication fails, PRs won't merge, or workflows don't trigger

## Resources

- Official Docs: https://cli.github.com
- GitHub Docs: https://docs.github.com
- GitHub Community: https://github.community
- Repository: https://github.com/cli/cli
