---
description: Perform manual merge to main branch with automated conflict resolution and PR management
allowed-tools: Bash(git *), Bash(gh *), Bash(npm run *), Bash(pnpm *), Bash(yarn *), Read, Write, Edit
---

Complete merge workflow from current branch to main with conflict resolution.

## Workflow

### 1. Prepare for Merge

**Check current state:**

```bash
# Verify on feature branch
git branch --show-current

# Ensure all changes committed
git status

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Uncommitted changes found"
  # Run /commit if needed
fi
```

**Fetch latest main:**

```bash
git fetch origin main
```

**Preview merge conflicts:**

```bash
git diff origin/main...HEAD
```

### 2. Create Pull Request

**Finalize changes:**
- If uncommitted changes exist, run `/commit` first
- Ensure all validation passes (lint, typecheck, tests)

**Create PR:**

```bash
gh pr create \
  --base main \
  --title "[Feature] Clear description" \
  --body "## Changes
- Implemented [feature]
- Fixed [issue]

## Testing
- All tests passing
- TypeScript compilation passes
- Linting passes

## Related Issues
Closes #123"
```

### 3. Conflict Detection & Resolution

**Check for conflicts:**

```bash
gh pr view --json mergeable,mergeStateStatus
```

**If conflicts detected:**

1. **Analyze conflicts:**

   ```bash
   git merge-tree $(git merge-base HEAD origin/main) HEAD origin/main
   ```

2. **Resolution strategy:**

   **Automatic resolution (when safe):**
   - Both modified same file, different sections: Accept both changes
   - One added, one modified: Accept both changes
   - Formatting conflicts: Accept current branch (already validated)

   **Manual resolution required:**
   - Both modified same lines: Analyze semantics
   - Deleted vs modified: Understand intent
   - Complex logic conflicts: Ask user for guidance

3. **Apply resolution:**

   ```bash
   git checkout main
   git pull origin main
   git merge <feature-branch>
   # Resolve conflicts
   # Test the merged code
   ```

4. **Verify resolution:**
   - Run full test suite
   - Run type checker
   - Run linter
   - Ensure build passes

### 4. Quality Assurance

**Run validation suite:**

```bash
MANAGER=$(
  if [ -f "pnpm-lock.yaml" ]; then echo "pnpm"
  elif [ -f "yarn.lock" ]; then echo "yarn"
  elif [ -f "bun.lockb" ]; then echo "bun"
  else echo "npm"
  fi
)

$MANAGER run lint
$MANAGER run typecheck
$MANAGER run test
$MANAGER run build
```

**Wait for CI checks:**

```bash
gh pr checks
```

### 5. Complete Merge

**Merge PR:**

```bash
gh pr merge --auto --squash --delete-branch
```

Options:
- `--squash`: Squash all commits into one (cleaner history)
- `--merge`: Keep all commits (preserve history)
- `--rebase`: Rebase and merge (linear history)
- `--delete-branch`: Clean up feature branch

**Verify merge:**

```bash
git checkout main
git pull origin main
git log --oneline -5
```

**Cleanup:**

```bash
# Delete local feature branch
git branch -d <feature-branch>

# Verify remote cleanup
gh pr list --state closed --limit 5
```

### 6. Post-Merge Summary

```
Merge Complete

Branch: feature/user-authentication
PR: #123 - Add user authentication
Merge type: Squash

Summary:
- X files changed
- Y insertions, Z deletions
- 0 conflicts (or N auto-resolved)
- All CI checks passed

Main branch updated successfully.
```

## Conflict Resolution Strategies

1. **Accept Current Branch (feature)**: When feature branch has validated changes
2. **Accept Main Branch**: When main has critical fixes
3. **Merge Both**: When changes are in different sections
4. **Smart Merge**: Analyze semantics and combine logically
5. **Ask User**: When conflict is ambiguous or complex

## Usage Examples

```bash
# Basic usage
/merge-to-main

# After feature complete
/merge-to-main
```

## Error Handling

- **Uncommitted changes**: Run `/commit` first
- **CI checks failing**: Fix issues before merge
- **Complex conflicts**: Ask user for guidance
- **Not authenticated**: Run `gh auth login`
- **No PR found**: Create PR first

## Notes

- Automatically detects and resolves simple conflicts
- Asks for guidance on complex conflicts
- Runs full validation before merge
- Cleans up branches after merge
- Provides detailed merge summary
