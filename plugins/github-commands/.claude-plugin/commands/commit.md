---
description: Create a git commit following Commitizen convention with validation and push
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*), Bash(git push:*), Bash(git branch:*), Bash(git log:*), Bash(npm run *), Bash(pnpm *), Bash(yarn *), Bash(bun *)
model: haiku
---

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Workflow

1. **Detect package manager**
   - Check for `pnpm-lock.yaml` -> pnpm
   - Check for `package-lock.json` -> npm
   - Check for `yarn.lock` -> yarn
   - Check for `bun.lockb` -> bun

2. **Stage all changes**

   ```bash
   git add .
   ```

3. **Run validation** (use parallel subagents if available)
   - `[package-manager] lint` (if exists in package.json)
   - `[package-manager] typecheck` (if exists in package.json)
   - `[package-manager] build` (if exists in package.json)

   If any validation fails, stop and report errors.

4. **Review staged diff**

   ```bash
   git diff --staged
   ```

5. **Create commit**
   - Follow Commitizen convention
   - Keep commit message simple and clear
   - Format: `type(scope): description`

   Types:
   - `feat`: New feature
   - `fix`: Bug fix
   - `refactor`: Code refactoring
   - `docs`: Documentation
   - `test`: Tests
   - `chore`: Maintenance

   Examples:
   - `feat: add user authentication`
   - `fix: resolve memory leak in parser`
   - `refactor: simplify validation logic`
   - `docs: update API documentation`

6. **Push to remote**

   ```bash
   git push
   ```

## Usage Examples

```bash
# Basic usage
/commit

# After making changes
/commit
```

## Notes

- All files are automatically staged
- Validation runs before commit (lint, typecheck, build)
- Commit message follows conventional commits
- Automatically pushes to current branch
