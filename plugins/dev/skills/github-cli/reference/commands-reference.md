# GitHub CLI Commands Reference

Complete reference for all `gh` CLI commands with detailed options and flags.

## Authentication

### `gh auth login`

Authenticate with GitHub.

```bash
# Interactive login
gh auth login

# Login with HTTPS
gh auth login --web

# Login with SSH
gh auth login --ssh

# Login to GitHub Enterprise
gh auth login --hostname github.enterprise.com
```

### `gh auth logout`

Log out from GitHub.

```bash
# Logout from GitHub
gh auth logout

# Logout from specific host
gh auth logout --hostname github.enterprise.com
```

### `gh auth status`

Check authentication status.

```bash
# Show authentication status
gh auth status

# Show for specific host
gh auth status --hostname github.enterprise.com
```

## Repository Management

### `gh repo create`

Create a new repository.

```bash
# Create interactively
gh repo create

# Create with name
gh repo create my-repo

# Create from template
gh repo create my-repo --template owner/template-repo

# Create as public
gh repo create my-repo --public

# Create as private
gh repo create my-repo --private
```

### `gh repo clone`

Clone a repository.

```bash
# Clone repository
gh repo clone owner/repo

# Clone to specific directory
gh repo clone owner/repo ./my-dir

# Clone with SSH
gh repo clone owner/repo -- --config core.sshCommand="ssh -i ~/.ssh/id_ed25519"
```

### `gh repo fork`

Fork a repository.

```bash
# Fork current repository
gh repo fork

# Fork specific repository
gh repo fork owner/repo

# Fork and clone
gh repo fork owner/repo --clone

# Fork to organization
gh repo fork owner/repo --org myorg
```

### `gh repo list`

List repositories.

```bash
# List your repositories
gh repo list

# List with limit
gh repo list --limit 10

# List organization repositories
gh repo list myorg

# List by visibility
gh repo list --visibility public
gh repo list --visibility private

# Filter by language
gh repo list --language go
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

# View as JSON
gh repo view --json name,description
```

## Issues

### `gh issue create`

Create a new issue.

```bash
# Create interactively
gh issue create

# Create with title and body
gh issue create --title "Bug: Login fails" --body "Description"

# Create with labels
gh issue create --title "Bug" --label "bug,critical"

# Assign to user
gh issue create --title "Task" --assignee @me

# Assign to multiple users
gh issue create --title "Task" --assignee user1,user2

# Add milestone
gh issue create --title "Task" --milestone "v1.0"
```

### `gh issue list`

List issues.

```bash
# List open issues
gh issue list

# List all issues
gh issue list --state all

# List by status
gh issue list --state closed

# Filter by assignee
gh issue list --assignee @me

# Filter by label
gh issue list --label "bug"

# Filter by author
gh issue list --author me

# Limit results
gh issue list --limit 20
```

### `gh issue view`

View an issue.

```bash
# View issue by number
gh issue view 123

# View in browser
gh issue view 123 --web

# View as JSON
gh issue view 123 --json title,body,state
```

### `gh issue close`

Close an issue.

```bash
# Close issue
gh issue close 123

# Close with comment
gh issue close 123 --comment "Fixed in PR #456"
```

### `gh issue reopen`

Reopen an issue.

```bash
# Reopen issue
gh issue reopen 123
```

## Pull Requests

### `gh pr create`

Create a pull request.

```bash
# Create interactively
gh pr create

# Create with title and body
gh pr create --title "Fix bug" --body "Description"

# Create draft PR
gh pr create --draft

# Create with labels
gh pr create --title "Fix" --label "fix,reviewed"

# Request reviewers
gh pr create --title "PR" --reviewer user1,user2

# Assign to users
gh pr create --title "PR" --assignee user1,user2

# Link to issue
gh pr create --title "Fix" --body "Fixes #123"
```

### `gh pr list`

List pull requests.

```bash
# List open PRs
gh pr list

# List all PRs
gh pr list --state all

# Filter by status
gh pr list --state merged

# Filter by author
gh pr list --author @me

# Filter by reviewer
gh pr list --reviewer me

# Limit results
gh pr list --limit 20
```

### `gh pr view`

View a pull request.

```bash
# View PR by number
gh pr view 123

# View in browser
gh pr view 123 --web

# View PR diff
gh pr diff 123

# View as JSON
gh pr view 123 --json title,body,state
```

### `gh pr checkout`

Check out a pull request.

```bash
# Checkout PR branch
gh pr checkout 123

# Checkout by URL
gh pr checkout https://github.com/owner/repo/pull/123
```

### `gh pr merge`

Merge a pull request.

```bash
# Merge PR (default)
gh pr merge 123

# Squash and merge
gh pr merge 123 --squash

# Rebase and merge
gh pr merge 123 --rebase

# Merge and delete branch
gh pr merge 123 --delete-branch

# Merge without CI checks
gh pr merge 123 --admin
```

### `gh pr close`

Close a pull request.

```bash
# Close PR
gh pr close 123

# Close with comment
gh pr close 123 --comment "Not needed anymore"
```

### `gh pr review`

Manage PR reviews.

```bash
# Approve PR
gh pr review 123 --approve

# Request changes
gh pr review 123 --request-changes --body "Needs revision"

# Comment on PR
gh pr review 123 --comment --body "Looks good!"
```

## GitHub Actions

### `gh run list`

List workflow runs.

```bash
# List recent runs
gh run list

# Filter by workflow
gh run list --workflow=ci.yml

# Filter by status
gh run list --status failure

# Filter by branch
gh run list --branch main

# Limit results
gh run list --limit 10
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

# View as JSON
gh run view 123456 --json status,conclusion
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
# Cancel run
gh run cancel 123456
```

### `gh workflow list`

List workflows.

```bash
# List all workflows
gh workflow list

# List with details
gh workflow list --all
```

### `gh workflow run`

Trigger a workflow.

```bash
# Trigger workflow
gh workflow run ci.yml

# Trigger with inputs
gh workflow run deploy.yml --field environment=production

# Trigger on branch
gh workflow run ci.yml --ref main
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

## Releases

### `gh release create`

Create a release.

```bash
# Create release
gh release create v1.0.0

# Create with title and notes
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes"

# Create as draft
gh release create v1.0.0 --draft

# Create as prerelease
gh release create v1.0.0 --prerelease

# Create with assets
gh release create v1.0.0 ./build/app.tar.gz ./build/app.zip
```

### `gh release list`

List releases.

```bash
# List releases
gh release list

# Limit results
gh release list --limit 10
```

### `gh release view`

View release details.

```bash
# View release
gh release view v1.0.0

# View in browser
gh release view v1.0.0 --web

# View as JSON
gh release view v1.0.0 --json body,tagName
```

### `gh release upload`

Upload assets to release.

```bash
# Upload asset
gh release upload v1.0.0 ./build/app.tar.gz

# Upload multiple assets
gh release upload v1.0.0 ./build/*.tar.gz
```

### `gh release delete`

Delete a release.

```bash
# Delete release
gh release delete v1.0.0
```

## Secrets & Variables

### `gh secret set`

Set a secret.

```bash
# Set secret interactively
gh secret set SECRET_NAME

# Set secret from stdin
gh secret set SECRET_NAME < secret.txt

# Set organization secret
gh secret set SECRET_NAME --org myorg

# Set environment secret
gh secret set SECRET_NAME --env production
```

### `gh secret list`

List secrets.

```bash
# List repository secrets
gh secret list

# List organization secrets
gh secret list --org myorg
```

### `gh variable set`

Set a variable.

```bash
# Set variable
gh variable set VAR_NAME --body "value"

# Set organization variable
gh variable set VAR_NAME --body "value" --org myorg

# Set environment variable
gh variable set VAR_NAME --body "value" --env production
```

### `gh variable list`

List variables.

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

# Limit results
gh search repos "react" --limit 10
```

### `gh search issues`

Search issues.

```bash
# Search issues
gh search issues "bug"

# Search in repository
gh search issues "performance" --repo=owner/repo

# Filter by state
gh search issues "open" --state=open

# Limit results
gh search issues "help wanted" --limit 5
```

### `gh search prs`

Search pull requests.

```bash
# Search PRs
gh search prs "feature"

# Search merged PRs
gh search prs "refactor" --state=merged

# Filter by language
gh search prs "security" --language=go

# Limit results
gh search prs "review" --limit 10
```

## Additional Commands

### `gh api`

Make API requests.

```bash
# GET request
gh api /user

# POST request
gh api /repos/owner/repo/issues -f title="Bug" -f body="Description"

# List paginated results
gh api /repos/owner/repo/issues --paginate
```

### `gh gist`

Manage gists.

```bash
# Create gist
gh gist create file.txt

# List gists
gh gist list

# View gist
gh gist view gistid
```

### `gh label`

Manage labels.

```bash
# Create label
gh label create "bug" --color "ff0000"

# List labels
gh label list

# Delete label
gh label delete "bug"
```

### `gh completion`

Generate shell completion.

```bash
# Zsh completion
gh completion -s zsh

# Bash completion
gh completion -s bash

# Fish completion
gh completion -s fish
```

### `gh config`

Manage configuration.

```bash
# Set value
gh config set editor vim

# Get value
gh config get editor

# List all config
gh config list
```

## Global Flags

All `gh` commands support these flags:

- `--help` — Show help information
- `--version` — Show version information
- `--repo owner/repo` — Select repository
- `--web` — Open in web browser
- `--json` — Output as JSON
