---
description: Detect and fix all project issues - lint, typecheck, tests, build errors
allowed-tools: Bash, Read, Write, Edit, Glob, Grep
---

Comprehensive project health check: detect all validation commands, run them, fix issues, and verify fixes.

## Workflow

### 1. Detect Stack & Project Structure

Identify the project type and available tooling:

**Check for:**
- `package.json` - Node.js/TypeScript project
- `requirements.txt` / `pyproject.toml` - Python project
- `go.mod` - Go project
- `Cargo.toml` - Rust project

**Extract information:**
- Package manager (npm, pnpm, yarn, pip, cargo, etc.)
- Language version
- Framework (Next.js, Express, FastAPI, etc.)
- Testing framework
- Linter configuration

### 2. Discover Available Commands

**Scan `package.json` scripts (Node.js/TypeScript):**

```bash
cat package.json | grep -E "lint|typecheck|type-check|test|build|format|validate"
```

**Common command patterns to detect:**
- `lint` / `eslint` / `biome lint` - Linting
- `typecheck` / `tsc --noEmit` - Type checking
- `test` / `vitest` / `jest` - Unit tests
- `build` - Production build
- `format` / `prettier` - Code formatting

### 3. Run All Validation Commands (Parallel)

Create a comprehensive validation report by running all discovered commands.

**Use parallel subagents** to run:
1. Linting (if available)
2. Type checking (if available)
3. Unit tests (if available)
4. Build (if available)

**For each command:**
- Capture full output
- Record exit code
- Count errors/warnings
- Extract file paths and line numbers from errors

### 4. Analyze & Categorize Issues

Group issues by priority:

1. **Critical** - Blocks build/deploy
   - Build failures
   - Type errors in critical paths
   - Test failures

2. **High Priority** - Code quality issues
   - Linting errors (not warnings)
   - Type errors in non-critical code

3. **Medium Priority** - Maintainability
   - Linting warnings
   - Formatting issues

### 5. Create Fix Plan

Prioritize fixes:
- Phase 1: Critical (blocks ship)
- Phase 2: High Priority
- Phase 3: Medium Priority (optional)

### 6. Execute Fixes

**Fix issues systematically:**

1. **Read the problematic files first**
2. **Apply fixes one category at a time**
3. **Use appropriate strategies:**
   - Type errors: Add missing type annotations, fix incorrect types
   - Lint errors: Remove unused imports, fix naming conventions
   - Build errors: Fix missing dependencies, resolve module issues
   - Test failures: Update broken assertions, fix mock data

4. **Auto-format after fixes:**
   ```bash
   pnpm format  # or prettier --write .
   ```

### 7. Verify Fixes (Re-run Validation)

After applying fixes, re-run all validation commands with parallel subagents.

Compare before/after results and report:
- Issues fixed
- Time taken
- Remaining issues (if any)

### 8. Summary Report

```markdown
# Debug Session Complete

## Project Health: HEALTHY / NEEDS WORK / CRITICAL

**Stack detected:** [Framework info]

## Issues Fixed
- [List of fixed issues]

## Validation Results
- Linting: [status]
- Type checking: [status]
- Tests: [status]
- Build: [status]

## Next Steps
- [Recommendations]
```

## Usage Examples

```bash
# Basic usage
/debug

# After making changes
/debug
```

## Key Principles

- **Detect don't assume**: Scan for actual commands
- **Parallel execution**: Run all checks simultaneously
- **Systematic fixes**: Critical -> High -> Medium -> Low
- **Always verify**: Re-run validation after fixes
- **Context-aware**: Read files before fixing
- **Report clearly**: Show before/after comparison
