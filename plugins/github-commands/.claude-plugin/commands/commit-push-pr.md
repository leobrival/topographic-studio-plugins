---
description: Commit, push, and open a pull request in one command
allowed-tools: Bash(git checkout:*), Bash(git add:*), Bash(git status:*), Bash(git push:*), Bash(git commit:*), Bash(git diff:*), Bash(git branch:*), Bash(git log:*), Bash(gh pr create:*)
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Workflow

1. **Check current branch**
   - If on `main` or `master`, create a new branch first
   - Branch name should be descriptive (e.g., `feat/add-feature`)

2. **Stage all changes**

   ```bash
   git add .
   ```

3. **Create commit**
   - Follow Commitizen convention
   - Format: `type(scope): description`

4. **Push to origin**

   ```bash
   git push -u origin <branch-name>
   ```

5. **Create Pull Request**

   ```bash
   gh pr create --title "[Title]" --body "[Description]"
   ```

   PR body should include:
   - Summary of changes
   - Testing done
   - Related issues (if any)

## Usage Examples

```bash
# Basic usage
/commit-push-pr

# After implementing a feature
/commit-push-pr
```

## Notes

- Creates new branch if on main/master
- Commits with conventional commit format
- Pushes and creates PR in one workflow
- Uses `gh` CLI for PR creation
