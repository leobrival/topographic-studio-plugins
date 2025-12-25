---
description: Development workflow guidelines for commits, task execution, worktrees, and project organization
---

# Development Workflow

Standardized workflows for consistent, efficient development.

## Commit Workflow

Use the `/commit` command which follows this process:

### Steps

1. Stage all current files
2. Run validation: `pnpm lint`, `pnpm typecheck`, `pnpm build`
3. Review git diff
4. Create Commitizen-format commit
5. Push to remote

### Commit Message Format

```bash
# Format: type(scope): subject
feat(auth): add JWT token validation
fix(api): handle null response in user endpoint
docs(readme): update installation instructions
refactor(utils): simplify date formatting logic
test(auth): add unit tests for login flow
chore(deps): update dependencies
```

**Types:**

| Type | Description |
|------|-------------|
| feat | New feature |
| fix | Bug fix |
| docs | Documentation |
| refactor | Code refactoring |
| test | Tests |
| chore | Maintenance |
| perf | Performance |
| style | Formatting |

### Example

```bash
git commit -m "feat(user): add profile image upload

- Add multipart form handling
- Implement image resizing
- Store images in S3 bucket

Closes #123"
```

## Task Execution

Use the `/run-task` command for structured development:

### Steps

1. Analyze task requirements (file paths or GitHub issues via `gh cli`)
2. Create implementation plan
3. Make code updates with TypeScript auto-correction
4. Commit changes
5. Create pull requests with comprehensive descriptions

### Task Sources

```bash
# From GitHub issue
/run-task https://github.com/user/repo/issues/123

# From file path
/run-task ./src/components/Button.tsx

# From description
/run-task "Add dark mode toggle to settings page"
```

## Git Worktree Automation

For parallel development on multiple features/issues.

### Usage

```bash
sh ~/scripts/setup-worktree.sh https://github.com/user/repo/issues/123
```

### Workflow

1. Validate GitHub issue URL format
2. Generate kebab-case branch name from issue context
3. Create isolated worktree in `~/Developer/worktrees/`
4. Copy environment files (.env*) to worktree
5. Install dependencies (pnpm/npm/yarn auto-detection)
6. Open terminal with Claude in plan mode

### Benefits

- Isolated feature development
- Main working directory stays clean
- Multiple features in parallel
- Easy context switching

## Project Organization

### External Tool Configuration

Store tool configs in dedicated dot-folders at project root:

```
project-root/
├── .mcp/
│   ├── project.json      # MCP server configurations
│   └── README.md
├── .posthog/
│   ├── project.json      # Analytics configuration
│   └── README.md
├── .vercel/
│   ├── project.json      # Deployment settings
│   └── README.md
├── .figma/
│   ├── project.json      # Design tokens
│   └── README.md
├── .convex/
│   ├── project.json      # Backend configuration
│   └── README.md
├── .neon/
│   ├── project.json      # Database configs
│   └── README.md
└── .railway/
    ├── project.json      # Deployment settings
    └── README.md
```

### Standard File Convention

Each tool folder contains:
- `project.json` - Main configuration
- `README.md` - Documentation and usage guide

### Benefits

- **Proximity**: Configs live with the code
- **Discoverability**: Easy to find settings
- **Version Control**: Track in git
- **Isolation**: Per-project configurations

### Gitignore Considerations

```gitignore
# Ignore sensitive files
.env*
**/secrets.json
**/*credentials*

# Track configurations
!.mcp/
!.vercel/project.json
!.figma/tokens.json
```

## Script Storage

### Temporary Scripts

Store in `/tmp/` directory:

```bash
# Temporary test script
/tmp/test-script.sh

# Temporary data processing
/tmp/process-data.js
```

### Permanent Scripts

Store in appropriate project directory:
- `scripts/` for project scripts
- `~/.claude/scripts/` for global Claude scripts

### When Unsure

**Always ask the user** before creating files if placement is unclear.

## Validation Commands

### Automatic Validation

| File Type | Validation |
|-----------|------------|
| .ts/.tsx | Type checking + Biome linting |
| .js/.jsx | Biome linting |
| .md | Prettier formatting (on save) |
| Bash commands | Security validation (PreToolUse) |

### Manual Validation

```bash
# TypeScript
bun run typecheck
bun run lint

# Markdown
mdfix .
bun run fix:md

# All checks
bun run lint && bun run typecheck && bun run build
```

## Documentation Maintenance

When modifying any script, update:

1. Script's `CLAUDE.md` (architecture, specs)
2. Script's `README.md` (user documentation)
3. Related command files in `commands/`
4. Related Raycast scripts if needed
5. Global `CLAUDE.md` for major changes

## Quick Checklist

### Before Starting Work

- [ ] Understand task requirements
- [ ] Read 3 relevant existing files
- [ ] Create implementation plan

### During Development

- [ ] Follow code quality standards
- [ ] Use minimal scope for variables
- [ ] Validate inputs and outputs
- [ ] Keep functions short

### Before Committing

- [ ] Run linting: `bun run lint:fix`
- [ ] Run type check: `bun run typecheck`
- [ ] Run tests: `bun run test`
- [ ] Review diff: `git diff`
- [ ] Write clear commit message

### After Committing

- [ ] Push to remote
- [ ] Create PR if needed
- [ ] Update documentation
