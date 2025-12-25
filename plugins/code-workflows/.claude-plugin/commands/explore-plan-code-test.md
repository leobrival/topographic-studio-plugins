---
description: Explore codebase, create implementation plan, code, and test following structured workflow
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, WebSearch, WebFetch, Task
---

# EPCT Workflow

Explore, Plan, Code, Test - Structured workflow for implementing features.

## Workflow

### 1. Explore

**Objective**: Understand the codebase before making changes.

Use **parallel subagents** to:

- Find all files relevant to the task
- Identify files to edit
- Find example patterns to follow
- Locate tests related to the feature

**Discovery tasks:**

```bash
# Find similar components
grep -r "similar-pattern" src/

# Locate test files
find . -name "*.test.ts" -o -name "*.spec.ts"

# Check existing implementations
grep -r "function-name" src/
```

**Output**: List of files to read and understand.

### 2. Plan

**Objective**: Create detailed implementation plan.

**Steps:**

1. Read all relevant files found in Explore phase
2. Understand existing patterns and conventions
3. Think deeply about the implementation approach
4. Consider edge cases and error handling
5. Plan tests to write
6. Plan documentation updates

**Ask questions if:**

- Requirements are unclear
- Multiple approaches are possible
- Need user input for design decisions

**Output**: Detailed plan with:

- Files to create/modify
- Functions to implement
- Tests to write
- Documentation to update
- Estimated complexity

**Example plan:**

```
## Implementation Plan

### Files to modify:
1. src/components/UserProfile.tsx
   - Add email validation
   - Add loading state

2. src/services/api.ts
   - Create updateProfile endpoint

3. tests/UserProfile.test.ts
   - Add validation tests
   - Add loading state tests

### Steps:
1. Implement email validation regex
2. Add loading state to component
3. Create API service function
4. Write unit tests
5. Update documentation

### Edge cases:
- Invalid email format
- Network timeout
- User cancels while loading
```

### 3. Code

**Objective**: Implement the plan systematically.

**Best practices:**

- Read files before editing
- Follow existing code style
- Use clear variable/function names
- Prefer clarity over cleverness
- Add inline comments only when necessary
- Run auto-formatter when done

**Process:**

1. Start with core functionality
2. Add error handling
3. Add edge case handling
4. Run linter and fix warnings
5. Run type checker and fix errors

**Quality checks:**

```bash
# Run formatter
pnpm format

# Check types
pnpm typecheck

# Run linter
pnpm lint --fix
```

### 4. Test

**Objective**: Verify implementation works correctly.

Use **parallel subagents** to:

- Run unit tests
- Run integration tests
- Run E2E tests (if applicable)
- Test in browser (if UI changes)

**Testing checklist:**

- All tests pass
- New code is covered by tests
- No linter warnings
- No type errors
- Build succeeds

**If tests fail:**

- Analyze failure reason
- Go back to Plan phase
- Think deeply about the issue
- Fix and re-test

**Browser testing** (if needed):

```
Test checklist:
- Component renders correctly
- User interactions work
- Loading states display
- Error states display
- Responsive on mobile
```

### 5. Write Up

**Objective**: Document the work for PR review.

**PR Description should include:**

```markdown
## What was implemented

- Added email validation to user profile
- Implemented loading states
- Created updateProfile API endpoint

## Implementation choices

- Used regex for email validation (more performant than external lib)
- Implemented optimistic UI updates for better UX
- Added debounce to API calls to reduce server load

## Commands run

pnpm typecheck
pnpm lint --fix
pnpm test
pnpm build

## Testing

- All unit tests passing (142 tests)
- Manual testing completed on Chrome/Safari/Firefox
- Mobile responsive verified
```

## When to Use EPCT

**Use EPCT for:**

- New features
- Complex refactors
- Bug fixes requiring investigation
- UI changes

**Don't use EPCT for:**

- Simple typo fixes
- Documentation-only changes
- Dependency updates

## Usage Examples

```bash
# Implement feature from description
/explore-plan-code-test "Add dark mode toggle to settings"

# Fix complex bug
/explore-plan-code-test "Fix memory leak in WebSocket connection"

# Refactor existing code
/explore-plan-code-test "Refactor authentication logic to use new API"
```

## Key Principles

- **Explore before coding**: Understand before changing
- **Plan thoroughly**: Think > Type
- **Code systematically**: Follow the plan
- **Test rigorously**: Verify everything works
- **Document clearly**: Help reviewers understand

Ship quality code. Every time.
