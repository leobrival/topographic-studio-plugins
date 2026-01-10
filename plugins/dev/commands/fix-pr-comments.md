---
description: Fetch all unresolved comments from current PR and fix them automatically
allowed-tools: Bash(gh *), Bash(git *), Read, Write, Edit, Grep, Glob
---

Automatically resolve all unresolved PR review comments.

## Workflow

1. **Check authentication**

   ```bash
   gh auth status
   ```

   If not authenticated, stop and ask user to run `gh auth login`.

2. **Detect current PR**

   ```bash
   gh pr view --json number,title,url
   ```

   If no PR found, stop and inform user.

3. **Fetch unresolved comments**

   ```bash
   gh pr view --comments | grep -A 5 "UNRESOLVED"
   ```

   Extract:
   - Comment author
   - File path
   - Line number
   - Comment text
   - Suggested change

4. **Plan fixes**
   - Read all files mentioned in comments
   - Understand context (read 2-3 related files)
   - Create fix plan for each comment:
     - What needs to change
     - Why it needs to change
     - How to implement it

5. **Apply fixes systematically**
   - Fix one comment at a time
   - Read file before editing
   - Apply the fix
   - Verify the fix addresses the comment

6. **Commit and push**

   ```bash
   git add .
   git commit -m "fix: resolve PR review comments"
   git push
   ```

7. **Summary report**

   ```
   Fixed 5 PR comments:
   - src/utils/api.ts:45 - Added error handling
   - src/components/User.tsx:112 - Fixed prop types
   - tests/auth.test.ts:23 - Updated test assertion
   - src/services/payment.ts:67 - Added validation
   - README.md:15 - Fixed typo

   Pushed to branch: feature/user-auth
   PR: https://github.com/user/repo/pull/123
   ```

## Error Handling

- **No PR found**: Inform user and suggest creating one
- **No unresolved comments**: Report success, nothing to fix
- **Not authenticated**: Guide user to authenticate with gh cli
- **Comment ambiguous**: Ask user for clarification

## Usage Examples

```bash
# Basic usage (auto-detects current PR)
/fix-pr-comments

# After receiving review comments
/fix-pr-comments
```

## Notes

- Only fixes unresolved comments
- Commits all fixes in one commit
- Automatically pushes to current branch
- Reads context before making changes
