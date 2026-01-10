---
description: Execute a task from file path or GitHub issue with full implementation workflow
allowed-tools: Bash(gh *), Bash(git *), Bash(npm *), Bash(pnpm *), Bash(yarn *), Read, Write, Edit, Grep, Glob
---

Execute complete implementation workflow from issue or file.

## Workflow

### 1. Parse Task Input

**$ARGUMENT can be:**
- GitHub issue URL: `https://github.com/user/repo/issues/123`
- GitHub issue number: `123`
- File path with instructions: `./tasks/add-feature.md`

### 2. Fetch Task Details

**For GitHub issue:**

```bash
gh issue view $ARGUMENT --json title,body,labels,assignees
```

**For file path:**

```bash
cat $ARGUMENT
```

Extract:
- Task description
- Requirements
- Acceptance criteria
- Technical notes

### 3. Plan Implementation

**Discovery phase:**
- Read all relevant files
- Understand existing patterns
- Identify files to modify
- Find similar implementations

**Create detailed plan:**

```
## Implementation Plan

### Context
[What needs to be built and why]

### Files to modify:
1. src/components/Feature.tsx
2. src/services/api.ts
3. tests/Feature.test.ts

### Steps:
1. [Specific implementation steps]
2. [...]
```

### 4. Implement Changes

**Systematic implementation:**

1. Read files before editing (understand context)
2. Make changes following the plan
3. Run TypeScript type checker continuously
4. Fix type errors immediately
5. Run linter and fix issues
6. Auto-format code

**Auto-correct with TypeScript:**
- Fix type errors as they appear
- Add proper type annotations
- Resolve import issues
- Update interfaces/types

### 5. Commit Changes

**Create clean commit:**

```bash
git add .
git commit -m "feat: [clear description of changes]"
```

Follow Commitizen convention:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `test:` - Test updates
- `docs:` - Documentation

### 6. Create Pull Request

**Generate comprehensive PR:**

```bash
gh pr create --title "[Title]" --body "[Description]"
```

**PR description includes:**

```markdown
## Changes
- Implemented [feature]
- Fixed [issue]

## Testing
- TypeScript compilation passes
- All tests passing
- Linting passes

## Related Issues
Closes #123
```

## Usage Examples

```bash
# From GitHub issue URL
/run-task https://github.com/user/repo/issues/123

# From issue number
/run-task 123

# From task file
/run-task ./tasks/implement-auth.md

# From inline description
/run-task "Add email validation to user profile form"
```

## Error Handling

- **Issue not found**: Verify issue number and repo access
- **File not found**: Check file path is correct
- **Type errors**: Fix all TypeScript errors before committing
- **Tests fail**: Fix tests before creating PR
- **Not authenticated**: Run `gh auth login`

## Notes

- Reads context before making changes
- Runs TypeScript continuously for immediate feedback
- Auto-corrects type errors
- Creates clean, reviewable commits
- Generates comprehensive PR descriptions
