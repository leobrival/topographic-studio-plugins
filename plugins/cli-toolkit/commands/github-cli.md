---
title: GitHub CLI
description: GitHub CLI commands for managing repositories and issues
allowed-tools: [Bash(gh *), Bash(git *)]
---

Concise cheat-sheet of `gh` commands to manage repositories, issues, PRs and GitHub workflows.

## Authentication

### `gh auth login`

Authenticate with GitHub.

```bash
# Authenticate with GitHub
gh auth login

# Check authentication status
gh auth status

# Sign out of GitHub
gh auth logout
```

## Repositories

### `gh repo create`

Create a new repository.

```bash
# Create a new repository
gh repo create

# Create with specific name
gh repo create my-project

# Create from template
gh repo create --template owner/template-repo
```

### `gh repo clone`

Clone a repository.

```bash
# Clone a repository
gh repo clone owner/repo

# Clone to specific directory
gh repo clone owner/repo ./my-dir
```

### `gh repo list`

List repositories.

```bash
# List your repositories
gh repo list

# List organization repositories
gh repo list myorg

# Limit results
gh repo list --limit 10
```

### `gh repo view`

View repository details.

```bash
# View current repository
gh repo view

# View specific repository
gh repo view owner/repo

# View in browser
gh repo view --web
```

### `gh repo fork`

Fork a repository.

```bash
# Fork current repository
gh repo fork

# Fork specific repository
gh repo fork owner/repo
```

## Issues

### `gh issue create`

Create a new issue.

```bash
# Create issue interactively
gh issue create

# Create with title and body
gh issue create --title "Bug report" --body "Description"

# Assign to user
gh issue create --assignee @me
```

### `gh issue list`

List repository issues.

```bash
# List open issues
gh issue list

# List all issues
gh issue list --state all

# Filter by assignee
gh issue list --assignee @me
```

### `gh issue view`

View an issue.

```bash
# View issue by number
gh issue view 123

# View in browser
gh issue view 123 --web
```

### `gh issue close`

Close an issue.

```bash
# Close issue
gh issue close 123

# Close with comment
gh issue close 123 --comment "Fixed in PR #456"
```

## Pull Requests

### `gh pr create`

Create a pull request.

```bash
# Create PR interactively
gh pr create

# Create with title and body
gh pr create --title "Fix bug" --body "Description"

# Create draft PR
gh pr create --draft
```

### `gh pr list`

List pull requests.

```bash
# List open PRs
gh pr list

# List all PRs
gh pr list --state all

# Filter by author
gh pr list --author @me
```

### `gh pr view`

View a pull request.

```bash
# View PR by number
gh pr view 123

# View in browser
gh pr view 123 --web

# Show diff
gh pr diff 123
```

### `gh pr checkout`

Checkout a pull request locally.

```bash
# Checkout PR branch
gh pr checkout 123

# Checkout by URL
gh pr checkout https://github.com/owner/repo/pull/123
```

### `gh pr merge`

Merge a pull request.

```bash
# Merge PR
gh pr merge 123

# Squash and merge
gh pr merge 123 --squash

# Rebase and merge
gh pr merge 123 --rebase
```

### `gh pr close`

Close a pull request.

```bash
# Close PR
gh pr close 123

# Close with comment
gh pr close 123 --comment "Not needed anymore"
```

## Core Commands

```bash
gh browse              # Open repository in browser
gh browse --settings   # Open repository settings page

gh codespace create    # Create a new codespace
gh codespace list      # List available codespaces
gh codespace ssh       # SSH into a codespace

gh gist create         # Create a new gist
gh gist list           # List your gists
gh gist view           # View a gist

gh org list            # List organizations you belong to
gh org view            # View organization details

gh project list        # List project boards
gh project view        # View project board details

gh release create      # Create a new release
gh release list        # List repository releases
gh release view        # View release details
```

## GitHub Actions

### `gh run list`

List workflow runs.

```bash
# List recent workflow runs
gh run list

# Filter by workflow
gh run list --workflow=ci.yml

# Filter by status
gh run list --status=failure
```

### `gh run view`

View workflow run details.

```bash
# View run details
gh run view 123456

# View logs
gh run view 123456 --log

# View in browser
gh run view 123456 --web
```

### `gh run rerun`

Rerun a workflow.

```bash
# Rerun workflow
gh run rerun 123456

# Rerun failed jobs only
gh run rerun 123456 --failed
```

### `gh run cancel`

Cancel a workflow run.

```bash
# Cancel workflow run
gh run cancel 123456
```

### `gh workflow list`

List repository workflows.

```bash
# List workflows
gh workflow list
```

### `gh workflow run`

Trigger a workflow.

```bash
# Trigger workflow
gh workflow run ci.yml

# Trigger with inputs
gh workflow run deploy.yml --field environment=production
```

### `gh workflow enable`

Enable a workflow.

```bash
# Enable workflow
gh workflow enable ci.yml
```

### `gh workflow disable`

Disable a workflow.

```bash
# Disable workflow
gh workflow disable ci.yml
```

## Cache Management

```bash
# List Actions cache entries
gh cache list

# Delete cache entries
gh cache delete

# Delete all caches
gh cache delete --all
```

## Secrets & Variables

### `gh secret set`

Set repository secrets.

```bash
# Set secret interactively
gh secret set SECRET_NAME

# Set secret from file
gh secret set SECRET_NAME < secret.txt

# Set organization secret
gh secret set SECRET_NAME --org myorg
```

### `gh secret list`

List repository secrets.

```bash
# List repository secrets
gh secret list

# List organization secrets
gh secret list --org myorg
```

### `gh variable set`

Set repository variables.

```bash
# Set variable
gh variable set VAR_NAME --body "value"

# Set organization variable
gh variable set VAR_NAME --body "value" --org myorg
```

### `gh variable list`

List repository variables.

```bash
# List repository variables
gh variable list

# List organization variables
gh variable list --org myorg
```

## Search

### `gh search repos`

Search repositories.

```bash
# Search repositories
gh search repos "machine learning"

# Filter by language
gh search repos "web scraping" --language=python

# Filter by stars
gh search repos "kubernetes" --stars=">1000"
```

### `gh search issues`

Search issues.

```bash
# Search issues
gh search issues "bug"

# Search in specific repository
gh search issues "performance" --repo=owner/repo
```

### `gh search prs`

Search pull requests.

```bash
# Search pull requests
gh search prs "feature"

# Search merged PRs
gh search prs "refactor" --state=merged
```

## Additional Commands

```bash
# Create command aliases
gh alias set

# List command aliases
gh alias list

# Make authenticated GitHub API requests
gh api /user
gh api repos/owner/repo/issues

# Generate shell completion scripts
gh completion -s zsh

# Set configuration values
gh config set editor vim
gh config set git_protocol ssh

# Get configuration values
gh config get editor

# List all configuration
gh config list

# Install CLI extensions
gh extension install owner/gh-extension

# List installed extensions
gh extension list

# Upgrade extensions
gh extension upgrade --all

# Add GPG key to account
gh gpg-key add key.asc

# List GPG keys
gh gpg-key list

# Create repository labels
gh label create "bug" --color="ff0000"

# List repository labels
gh label list

# Add SSH key to account
gh ssh-key add ~/.ssh/id_rsa.pub

# List SSH keys
gh ssh-key list

# Show GitHub CLI status
gh status
```

## Common Usage Examples

```bash
# Complete workflow for contributing
gh repo fork owner/repo
gh repo clone owner/repo
# Make changes...
gh pr create --title "Fix bug" --body "Description"

# Release management
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"
gh release list
gh release view v1.0.0

# Issue management
gh issue create --title "Bug report" --assignee @me
gh issue list --assignee @me
gh issue close 123 --comment "Fixed"

# Workflow debugging
gh run list --status=failure
gh run view 123456 --log
gh run rerun 123456 --failed
```
