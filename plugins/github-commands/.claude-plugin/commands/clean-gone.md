---
description: Clean up local branches that no longer exist on remote
allowed-tools: Bash(git fetch:*), Bash(git branch:*), Bash(git for-each-ref:*)
---

## Context

- Current branch: !`git branch --show-current`
- Local branches: !`git branch`
- Remote tracking status: !`git branch -vv`

## Workflow

1. **Fetch and prune remote**

   ```bash
   git fetch --prune
   ```

2. **Find gone branches**
   List branches where upstream is gone:

   ```bash
   git for-each-ref --format '%(refname:short) %(upstream:track)' refs/heads | grep '\[gone\]'
   ```

3. **Delete gone branches**
   For each branch marked as `[gone]`:

   ```bash
   git branch -d <branch-name>
   ```

   Use `-D` (force) only if `-d` fails and after confirming with user.

4. **Report results**

   ```
   Cleaned up branches:
   - feature/old-feature (deleted)
   - fix/resolved-bug (deleted)

   Remaining branches:
   - main
   - develop
   - feature/current-work
   ```

## Usage Examples

```bash
# Clean up stale branches
/clean-gone

# After PR merges
/clean-gone
```

## Notes

- Only deletes fully merged branches by default
- Preserves current branch
- Fetches from remote first to get accurate status
- Reports what was deleted
