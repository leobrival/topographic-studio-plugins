---
description: Create a git worktree for a given issue with automated setup using Worktree Manager
allowed-tools: Bash(bun *), Bash(gh *), Bash(cd *)
---

Create isolated git worktree for feature development from GitHub issue using the intelligent Worktree Manager.

## Setup

The Worktree Manager scripts are located in the plugin's `scripts/worktree-manager/` directory.

**First-time setup** (if dependencies not installed):

```bash
cd <plugin-path>/scripts/worktree-manager && bun install
```

## Workflow

1. **Parse argument**
   - If $ARGUMENT is GitHub issue URL: Use directly
   - If $ARGUMENT is issue number: Construct full GitHub URL from current repository
   - Validate URL format: `https://github.com/owner/repo/issues/NUMBER`

2. **Execute Worktree Manager**

   ```bash
   bun <plugin-path>/scripts/worktree-manager/src/index.ts <github-issue-url> [options]
   ```

   Where `<plugin-path>` is the absolute path to the github-commands plugin directory.

   The Worktree Manager will automatically:
   - Fetch issue details via `gh` CLI (title, body, labels, assignees)
   - Generate intelligent branch name using Claude CLI (or fallback to simple generation)
   - Create isolated worktree with new branch
   - Copy all environment files (.env*)
   - Detect and install dependencies (pnpm, npm, yarn, or bun)
   - Open terminal (Hyper, iTerm2, Warp, or Terminal) with Claude in plan mode
   - Save worktree metadata to history

3. **Handle options**

   Support additional options:
   - `--terminal <app>`: Choose terminal app (Hyper, iTerm2, Warp, Terminal)
   - `--no-deps`: Skip dependency installation
   - `--no-terminal`: Don't open terminal automatically
   - `--debug`: Enable debug logging
   - `--branch <name>`: Override auto-generated branch name
   - `--profile <name>`: Use configuration profile (minimal, fast, full)
   - `--output <dir>`: Custom worktree base directory

## Usage Examples

```bash
# From GitHub issue URL (recommended)
/create-worktree https://github.com/user/repo/issues/123

# With specific terminal app
/create-worktree https://github.com/user/repo/issues/123 --terminal iTerm2

# With options
/create-worktree https://github.com/user/repo/issues/123 --no-deps --debug

# Custom branch name
/create-worktree https://github.com/user/repo/issues/123 --branch my-custom-feature

# Skip terminal opening
/create-worktree https://github.com/user/repo/issues/123 --no-terminal
```

## Branch Name Generation

The Worktree Manager uses intelligent branch name generation:

1. **AI-Powered (Claude CLI)**:
   - Analyzes issue title and description
   - Generates contextual branch name
   - Format: `issue-{number}-{description}`
   - Max 50 characters, kebab-case

2. **Fallback (Simple)**:
   - Uses issue number and sanitized title
   - Format: `issue-{number}-{sanitized-title}`

Examples:
- Issue #123 "Add User Authentication" -> `issue-123-add-user-authentication`
- Issue #456 "Fix: Memory Leak in API" -> `issue-456-fix-memory-leak-in-api`

## Additional Commands

```bash
# List all worktrees
bun <plugin-path>/scripts/worktree-manager/src/index.ts list

# Clean up old worktrees
bun <plugin-path>/scripts/worktree-manager/src/index.ts clean

# Force cleanup all worktrees
bun <plugin-path>/scripts/worktree-manager/src/index.ts clean --force
```

## Error Handling

- **Invalid GitHub URL**: Display format error and expected format
- **Not a git repository**: Inform user to run from within a git repo
- **GitHub CLI not authenticated**: Suggest running `gh auth login`
- **Bun not installed**: Provide installation instructions
- **Dependency installation failure**: Report which package manager failed

## Notes

- **Isolated Environments**: Each worktree has its own node_modules
- **Smart Package Manager Detection**: Auto-detects pnpm, npm, yarn, or bun
- **Environment Files**: All .env* files are copied recursively
- **Terminal Integration**: Supports Hyper, iTerm2, Warp, Terminal.app
- **History Tracking**: All worktrees are tracked in `.worktrees.json`
- **Claude Integration**: Terminal opens with `/run-tasks` for the specific issue
