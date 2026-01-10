# GitHub CLI Common Patterns

Real-world patterns and workflows for common GitHub use cases.

## Repository Management

### Fork and Contribute Workflow

```bash
# Fork repository
gh repo fork owner/repo --clone

# Navigate to cloned repo
cd repo

# Create feature branch
git checkout -b feature/my-feature

# Make your changes
# ...

# Commit and push
git add .
git commit -m "Add feature"
git push origin feature/my-feature

# Create PR from CLI
gh pr create \
  --title "Add my feature" \
  --body "This PR adds..." \
  --head feature/my-feature

# Wait for feedback, make changes if needed
# Merge when approved
gh pr merge $(gh pr list --author @me --state open --limit 1 --json number -q)
```

### Cloning Organization Repos

```bash
# List organization repos
gh repo list myorg

# Clone specific repo
gh repo clone myorg/repo

# Clone all organization repos
for repo in $(gh repo list myorg --json nameWithOwner -q); do
  gh repo clone "$repo"
done
```

### Repository Overview

```bash
# View repository details
gh repo view owner/repo

# View in browser
gh repo view owner/repo --web

# View as JSON
gh repo view owner/repo --json name,description,languages,forkCount,stargazerCount
```

## Issue Management

### Creating Issues with Context

```bash
# Create bug report
gh issue create \
  --title "Bug: Login fails on Firefox" \
  --body "Steps to reproduce:
1. Go to login page
2. Enter credentials
3. Click login

Expected: Login succeeds
Actual: Error message appears" \
  --label "bug,firefox" \
  --assignee @me

# Create feature request
gh issue create \
  --title "Feature: Dark mode" \
  --body "Users request dark mode for accessibility" \
  --label "enhancement,feature-request"

# Create task
gh issue create \
  --title "Task: Update dependencies" \
  --body "Update all npm packages to latest versions" \
  --label "maintenance" \
  --assignee developer1
```

### Managing Issues

```bash
# List issues assigned to you
gh issue list --assignee @me

# List issues by label
gh issue list --label "bug"

# List high-priority issues
gh issue list --label "critical,high" --state open

# View issue and display as JSON
gh issue view 123 --json title,body,labels,assignees

# Close issue with comment
gh issue close 123 --comment "Fixed in PR #456"

# Reopen issue
gh issue reopen 123

# Bulk close issues (careful!)
gh issue list --label "stale" --state open --json number -q | \
  xargs -I {} gh issue close {} --comment "Closing stale issue"
```

### Issue Automation

```bash
# Create issue from template
gh issue create \
  --title "Weekly sync" \
  --body "$(cat .github/issue_template/weekly_sync.md)" \
  --label "meeting,recurring"

# List and track open issues
gh issue list --state open \
  --json number,title,labels,assignees \
  --template '{{range .}}[{{.number}}] {{.title}}{{end}}'
```

## Pull Request Workflows

### Creating Pull Requests

```bash
# Create feature PR
gh pr create \
  --title "Feature: Add user authentication" \
  --body "Implements OAuth2 login flow

Fixes #42

## Changes
- Add auth endpoints
- Add login page
- Add session management" \
  --label "feature,auth" \
  --reviewer reviewer1,reviewer2 \
  --draft

# Create bug fix PR
gh pr create \
  --title "Fix: Correct null pointer exception" \
  --body "Fixes #123" \
  --label "fix,critical"

# Create from existing branch
git push origin feature/my-feature
gh pr create \
  --head feature/my-feature \
  --base main \
  --title "My feature" \
  --body "Description"
```

### Managing Pull Requests

```bash
# List your open PRs
gh pr list --author @me --state open

# List PRs awaiting your review
gh pr list --reviewer @me --state open

# View PR with full details
gh pr view 123 --web

# View PR diff
gh pr diff 123

# Checkout PR branch locally
gh pr checkout 456

# Review and approve
gh pr review 456 --approve --body "Looks great!"

# Request changes
gh pr review 456 --request-changes --body "Please update X"

# Merge with squash
gh pr merge 456 --squash --delete-branch

# Merge rebase strategy
gh pr merge 456 --rebase --delete-branch
```

### PR Status Tracking

```bash
# List PRs by status
gh pr list --state open
gh pr list --state draft
gh pr list --state merged
gh pr list --state closed

# Filter by label
gh pr list --label "needs-review"

# Track PR with notifications
gh pr view 123 --json statusCheckRollup -q | jq .

# List stale PRs
gh pr list --state open --json number,updatedAt,title | \
  jq '.[] | select(.updatedAt < now - 86400*7)'
```

## GitHub Actions & CI/CD

### Monitoring Workflows

```bash
# List recent runs
gh run list

# List failed runs
gh run list --status failure

# List runs for specific workflow
gh run list --workflow=ci.yml

# View run details
gh run view 123456 --log

# Follow run in real-time
gh run view 123456 --log | tail -f
```

### Debugging Workflows

```bash
# View workflow logs
gh run view 123456 --log

# Check workflow configuration
gh api repos/owner/repo/actions/workflows/ci.yml

# Rerun failed jobs
gh run rerun 123456 --failed

# Rerun entire workflow
gh run rerun 123456

# Cancel stuck workflow
gh run cancel 123456
```

### Workflow Automation

```bash
# Trigger workflow with inputs
gh workflow run deploy.yml \
  --field environment=production \
  --field version=1.0.0

# List all workflows
gh workflow list

# Enable/disable workflow
gh workflow disable nightly.yml
gh workflow enable nightly.yml

# View workflow status
gh api repos/owner/repo/actions/workflows | jq '.workflows[] | {name, state}'
```

## Release Management

### Creating Releases

```bash
# Create simple release
gh release create v1.0.0 --title "Version 1.0.0"

# Create with release notes
gh release create v1.0.0 \
  --title "Version 1.0.0" \
  --notes "Major new features and improvements"

# Create draft release (for review)
gh release create v1.0.0 --draft

# Create prerelease
gh release create v1.0.0-beta.1 --prerelease

# Create with assets
gh release create v1.0.0 \
  ./dist/app.tar.gz \
  ./dist/app.zip \
  ./CHANGELOG.md

# Create from git tag
git tag v1.0.0 && git push --tags
gh release create v1.0.0 --generate-notes
```

### Managing Releases

```bash
# List releases
gh release list

# View release details
gh release view v1.0.0 --web

# Upload additional assets
gh release upload v1.0.0 ./docs/guide.pdf

# Delete release
gh release delete v1.0.0

# Generate release notes from commits
gh release create v1.0.0 --generate-notes
```

## Team Collaboration

### Managing Reviewers

```bash
# Request multiple reviewers
gh pr create \
  --title "Feature PR" \
  --reviewer user1,user2,user3

# View PR reviews
gh pr view 123 --json reviews

# Review PR as approver
gh pr review 123 --approve

# Review with comment
gh pr review 123 --comment --body "Please check line 45"

# Request changes
gh pr review 123 --request-changes --body "Needs revision"
```

### Code Review Workflow

```bash
# List PRs awaiting your review
gh pr list --reviewer @me --state open

# View PR details
gh pr view 456 --web

# View PR diff locally
gh pr checkout 456
git diff main

# Add review comment
gh pr review 456 --comment --body "Consider using async/await here"

# Approve PR
gh pr review 456 --approve --body "Approved!"

# Request changes
gh pr review 456 --request-changes --body "Please address comments"
```

## Searching and Filtering

### Finding Issues

```bash
# Search for open bugs
gh search issues "bug" --state open --repo owner/repo

# Search for features requested
gh search issues "type:issue is:open label:enhancement"

# Search issues in organization
gh search issues "help wanted" --repo owner/org

# Find stale issues
gh issue list --state open \
  --json number,title,updatedAt | \
  jq '.[] | select(.updatedAt | < now - 86400*30)'
```

### Finding PRs

```bash
# Search for merged feature PRs
gh search prs "feature" --state merged --repo owner/repo

# Find PRs by author
gh pr list --author developer1 --state merged

# Find PRs waiting for review
gh pr list --state open \
  --json number,title,reviewDecision | \
  jq '.[] | select(.reviewDecision == "REVIEW_REQUIRED")'

# Find draft PRs
gh pr list --state open --json isDraft --jq '.[] | select(.isDraft)'
```

## Advanced Workflows

### Batch Operations

```bash
# Close all stale issues
gh issue list --state open --label "stale" --json number -q | \
  while read issue; do
    gh issue close "$issue" --comment "Closing stale issue"
  done

# Label all new issues
gh issue list --state open --json number -q | \
  while read issue; do
    gh issue edit "$issue" --add-label "needs-triage"
  done
```

### CI Integration

```bash
# Create issue from failing test
gh issue create \
  --title "CI: Test failure in payment module" \
  --body "Test 'test_payment_processing' failed
Build: #1234" \
  --label "ci-failure,test" \
  --assignee team-lead

# Comment on PR about CI status
gh pr comment 123 --body "CI checks passed! Ready for review."
```

### Documentation & Templates

```bash
# Create issue from template
cat > issue-template.md << 'EOF'
# Bug Report

## Environment
- OS:
- Version:

## Steps to Reproduce
1.
2.
3.

## Expected Behavior

## Actual Behavior
EOF

gh issue create \
  --title "Bug: " \
  --body "$(cat issue-template.md)" \
  --label "bug"
```

## Scripting Examples

### Dashboard of Your Work

```bash
# Summary of your GitHub activity
echo "=== Your Open Issues ==="
gh issue list --assignee @me --state open -q

echo ""
echo "=== Your Open PRs ==="
gh pr list --author @me --state open -q

echo ""
echo "=== PRs Awaiting Your Review ==="
gh pr list --reviewer @me --state open -q
```

### Automated Reporting

```bash
# Weekly stats
gh run list --limit 7 --json status -q | \
  jq 'group_by(.status) | map({status: .[0].status, count: length})'

# PR metrics
gh pr list --state merged --limit 100 \
  --json mergedAt,author \
  --jq 'map(.author.login) | unique' | wc -l
```
