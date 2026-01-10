# Worktree Manager

Intelligent Git worktree manager with TypeScript/Bun - automates worktree creation, branch management, and GitHub issue integration.

## Features

### Core Features

- **Zero Installation**: Uses Bun runtime, no npm install required
- **GitHub Integration**: Automatic issue fetching and parsing via GitHub CLI
- **Smart Branch Naming**: AI-powered branch name generation with Claude CLI (optional)
- **Automated Setup**: Auto-installs dependencies, copies .env files, opens terminal
- **Multi-Terminal Support**: Hyper, iTerm2, Warp, Terminal.app
- **Package Manager Detection**: Auto-detects pnpm, npm, yarn, or bun
- **Configuration Profiles**: Customizable profiles for different workflows
- **Worktree History**: Tracks all created worktrees with metadata
- **Cleanup Tools**: Prune and remove old worktrees

### Advanced Features

- **Environment File Copying**: Automatically copies all .env files to worktree
- **Dependency Installation**: Auto-installs dependencies with detected package manager
- **Terminal Integration**: Opens terminal with Claude CLI in plan mode
- **Raycast Integration**: Native Raycast script for quick access
- **Structured Logging**: AdonisJS-inspired logging with debug mode
- **Error Handling**: Comprehensive error handling and recovery
- **Git Operations**: Safe worktree creation, removal, and branch management

## Architecture

```
worktree-manager/
├── src/                           # TypeScript/Bun source
│   ├── index.ts                   # Main entry point
│   ├── cli.ts                     # CLI interface
│   └── lib/
│       ├── types.ts               # Type definitions
│       ├── config.ts              # Configuration management
│       ├── logger.ts              # Structured logging
│       ├── formatters.ts          # Output formatting
│       ├── git-bridge.ts          # Git operations
│       ├── github-integration.ts  # GitHub CLI integration
│       ├── package-manager.ts     # Package manager detection
│       ├── file-utils.ts          # File operations
│       ├── terminal-launcher.ts   # Terminal app orchestration
│       └── worktree-manager.ts    # Main orchestration
├── config/                        # Configuration files
│   ├── default.json               # Default settings
│   └── profiles/                  # Custom profiles
├── scripts/                       # Utility scripts
│   ├── install.sh                 # Installation script
│   └── terminals/
│       └── launcher.sh            # Universal terminal launcher (all terminals)
└── .worktrees.json               # Worktree history (auto-generated)
```

## Installation

### Prerequisites

- Bun: JavaScript/TypeScript runtime
- Git: Version control system
- GitHub CLI (gh): Required for GitHub integration

### Setup

Run the installation script to check dependencies:

```bash
~/.claude/scripts/worktree-manager/scripts/install.sh
```

### Shell Alias

Add this alias to your `~/.zshrc` or `~/.bashrc`:

```bash
alias worktree='bun ~/.claude/scripts/worktree-manager/src/index.ts'
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Raycast Integration

The Raycast script is already available at:

```bash
~/.claude/scripts/raycast/setup-worktree.sh
```

Raycast will automatically detect it if you've added `~/.claude/scripts/raycast` to your Raycast script directories.

## Usage

### Basic Usage

```bash
# Create worktree from GitHub issue
worktree https://github.com/user/repo/issues/123

# List all worktrees
worktree list

# Clean up prunable worktrees
worktree clean

# Force cleanup of all worktrees
worktree clean --force
```

### CLI Options

```
USAGE:
  worktree <github-issue-url> [options]
  worktree list
  worktree clean [--force]

OPTIONS:
  -b, --branch <name>     Custom branch name (overrides auto-generation)
  -o, --output <dir>      Custom worktree base directory
  -p, --profile <name>    Use a configuration profile
  -t, --terminal <app>    Terminal app (Hyper, iTerm2, Warp, Terminal)
  -f, --force             Force cleanup of all worktrees
  --no-deps               Skip dependency installation
  --no-terminal           Don't open terminal automatically
  --debug                 Enable debug logging
  -h, --help              Show help message
  -v, --version           Show version information
```

### Examples

```bash
# Create worktree with default settings
worktree https://github.com/user/repo/issues/123

# Create with custom branch name
worktree https://github.com/user/repo/issues/123 --branch feature-xyz

# Create without installing dependencies
worktree https://github.com/user/repo/issues/123 --no-deps

# Create with specific terminal app
worktree https://github.com/user/repo/issues/123 --terminal iTerm2
worktree https://github.com/user/repo/issues/123 --terminal Warp

# Create without opening terminal
worktree https://github.com/user/repo/issues/123 --no-terminal

# Create with custom output directory
worktree https://github.com/user/repo/issues/123 --output ~/Projects/worktrees

# Combine options
worktree https://github.com/user/repo/issues/123 --terminal Warp --profile fast

# Debug mode
worktree https://github.com/user/repo/issues/123 --debug

# List all worktrees
worktree list

# Clean up old worktrees
worktree clean

# Force remove all worktrees
worktree clean --force
```

### Raycast Usage

In Raycast:

1. Type "Setup Git Worktree"
2. Enter GitHub issue URL: `https://github.com/user/repo/issues/123`
3. Select terminal app from dropdown: Hyper, iTerm2, Warp, or Terminal (optional, defaults to Hyper)
4. (Optional) Add options: `--no-deps --debug --profile minimal`
5. Press Enter

**Raycast Arguments**:
- **Argument 1** (required): GitHub issue URL
- **Argument 2** (optional): Terminal app (dropdown selection) - defaults to Hyper if not specified
- **Argument 3** (optional): Additional CLI options

**Terminal Selection**:
The terminal app is selected via the Raycast dropdown interface. This approach:
- Prevents typos and errors
- Provides visual selection
- Works seamlessly with the universal launcher in `scripts/terminals/launcher.sh`
- Defaults to Hyper if not specified

**Modular Raycast Script**:
The Raycast script is organized with separate functions:
- `validate_requirements()`: Checks prerequisites (Bun, worktree-manager)
- `build_worktree_command()`: Constructs the command with proper arguments
- `main()`: Orchestrates execution flow

This modular approach makes the script easier to maintain and extend.

## Configuration

### Default Configuration

Located at `config/default.json`:

```json
{
  "worktreeBasePath": "~/Developer/worktrees",
  "defaultBranch": "main",
  "autoInstallDeps": true,
  "packageManager": "auto",
  "copyEnvFiles": true,
  "openTerminal": true,
  "terminalApp": "Hyper",
  "integrations": {
    "github": {
      "enabled": true,
      "autoFetchIssue": true
    },
    "claude": {
      "enabled": true,
      "autoGenerateBranchName": true,
      "autoStartPlanMode": true
    }
  },
  "cleanup": {
    "autoCleanMerged": false,
    "maxAge": 30,
    "keepRecent": 10
  }
}
```

### Configuration Options

**Paths**:
- `worktreeBasePath`: Base directory for worktrees (default: `~/Developer/worktrees`)
- `defaultBranch`: Default branch to base worktrees on (default: `main`)

**Automation**:
- `autoInstallDeps`: Auto-install dependencies (default: `true`)
- `packageManager`: Package manager to use (`auto`, `pnpm`, `npm`, `yarn`, `bun`)
- `copyEnvFiles`: Copy .env files to worktree (default: `true`)
- `openTerminal`: Open terminal after creation (default: `true`)
- `terminalApp`: Terminal app to use (`Hyper`, `iTerm2`, `Warp`, `Terminal`)

**Integrations**:
- `github.enabled`: Enable GitHub CLI integration
- `github.autoFetchIssue`: Auto-fetch issue details
- `claude.enabled`: Enable Claude CLI integration
- `claude.autoGenerateBranchName`: Use AI for branch naming
- `claude.autoStartPlanMode`: Start Claude in plan mode

**Cleanup**:
- `autoCleanMerged`: Auto-cleanup merged branches
- `maxAge`: Maximum age in days for worktrees
- `keepRecent`: Keep N most recent worktrees

### Custom Profiles

Create custom profiles in `config/profiles/` to define different workflow behaviors.

**Available Profiles**:
- **minimal**: No automation, manual setup
- **fast**: Quick setup without Claude CLI
- **full**: All features enabled

**config/profiles/minimal.json**:
```json
{
  "autoInstallDeps": false,
  "openTerminal": false,
  "integrations": {
    "claude": {
      "autoGenerateBranchName": false,
      "autoStartPlanMode": false
    }
  }
}
```

**Note**: Profiles do not include terminal selection. The terminal is always specified via:
- CLI: `--terminal` flag
- Raycast: Dropdown selection (Argument 2)
- Default: Hyper (from `config/default.json`)

Use with:
```bash
worktree https://github.com/user/repo/issues/123 --profile minimal --terminal iTerm2
```

## Workflow

### Typical Workflow

1. **Parse Issue URL**: Extract owner, repo, and issue number
2. **Fetch Issue**: Use `gh` CLI to get issue details
3. **Generate Branch Name**: Use Claude CLI or fallback to simple generation
4. **Create Worktree**: Create isolated git worktree with new branch
5. **Copy .env Files**: Find and copy all environment files
6. **Install Dependencies**: Auto-detect package manager and install
7. **Open Terminal**: Launch terminal with Claude in plan mode
8. **Save History**: Track worktree metadata for future reference

### Generated Structure

```
~/Developer/worktrees/
└── project-name-worktree/
    └── issue-123-feature-name/
        ├── .env
        ├── node_modules/
        └── ... (project files)
```

## Integrations

### GitHub CLI

**Required**: Yes

Install and authenticate:
```bash
brew install gh
gh auth login
```

The tool uses `gh` to:
- Fetch issue details (title, body, labels, assignees)
- Parse issue metadata
- Validate repository access

### Claude CLI

**Required**: No (optional)

Install:
```bash
# Follow Claude CLI installation instructions
```

The tool uses `claude` to:
- Generate intelligent branch names from issue context
- Start plan mode for task execution

If Claude CLI is not available, the tool falls back to simple branch name generation.

### Package Managers

**Auto-detected**: pnpm, npm, yarn, bun

The tool automatically detects package managers by looking for:
- `pnpm-lock.yaml` → pnpm
- `bun.lockb` → bun
- `yarn.lock` → yarn
- `package-lock.json` → npm

### Terminal Apps

**Supported**: Hyper, iTerm2, Warp, Terminal.app

**Architecture**: Simplified universal launcher

The tool uses a streamlined architecture with a single launcher script:

- **TerminalLauncher** (`src/lib/terminal-launcher.ts`): TypeScript orchestration layer
  - Detects installed terminals
  - Delegates to universal launcher script
  - Validates execution and handles errors

- **Universal Launcher** (`scripts/terminals/launcher.sh`): Single bash script handling all terminals
  - Takes terminal app name and command as parameters
  - Uses case-based routing to terminal-specific functions
  - Implements AppleScript for Hyper, iTerm2, Terminal.app
  - Uses temporary script approach for Warp
  - Validates terminal installation before launching

**Benefits**:
- **Simplified**: One script instead of four separate files
- **Maintainable**: All terminal logic in a single location
- **Extensible**: Add new terminals by adding a case and function
- **Consistent**: Same error handling and validation for all terminals
- **No duplication**: Shared validation and error handling code

## Advanced Usage

### Manual Branch Names

```bash
worktree https://github.com/user/repo/issues/123 --branch my-custom-branch
```

### Skip Dependency Installation

```bash
worktree https://github.com/user/repo/issues/123 --no-deps
```

### Custom Output Directory

```bash
worktree https://github.com/user/repo/issues/123 --output ~/Custom/Path
```

### Debug Mode

```bash
worktree https://github.com/user/repo/issues/123 --debug
```

### Cleanup Strategies

```bash
# Clean prunable worktrees only
worktree clean

# Force remove all worktrees
worktree clean --force
```

## Troubleshooting

### GitHub CLI not authenticated

```bash
gh auth login
```

### Bun not found

```bash
curl -fsSL https://bun.sh/install | bash
```

Then add to your PATH (usually automatic).

### Permission denied

Make scripts executable:

```bash
chmod +x ~/.claude/scripts/worktree-manager/src/index.ts
chmod +x ~/.claude/scripts/worktree-manager/scripts/*.sh
chmod +x ~/.claude/scripts/raycast/setup-worktree.sh
```

### Terminal not opening

Check your terminal app configuration in `config/default.json`:

```json
{
  "terminalApp": "Hyper"  // or "iTerm2", "Warp", "Terminal"
}
```

### Dependencies not installing

Check package manager installation:

```bash
which pnpm npm yarn bun
```

## Performance

- **Startup**: ~100ms (Bun runtime)
- **Issue Fetch**: ~500ms (GitHub API)
- **Branch Generation**: ~2s (with Claude) or instant (fallback)
- **Worktree Creation**: ~200ms (git operations)
- **Dependency Installation**: Varies by project size
- **Total Time**: ~3-5 minutes for typical project

## Comparison with Original Script

| Feature | Original Script | Worktree Manager |
|---------|----------------|------------------|
| Runtime | Bash | TypeScript/Bun |
| Error Handling | Basic | Comprehensive |
| Logging | Echo statements | Structured logger |
| Configuration | Hardcoded | JSON profiles |
| Package Managers | pnpm/npm/yarn | Auto-detection + bun |
| Branch Naming | Claude CLI only | Claude + fallback |
| Terminal Support | Hyper only | Hyper, iTerm2, Warp, Terminal |
| Cleanup | Manual | Built-in commands |
| History | None | Automatic tracking |
| Extensibility | Limited | Modular architecture |

## Future Enhancements

- [ ] Automatic PR creation after work completion
- [ ] Worktree templates per project
- [ ] Smart cleanup based on branch merge status
- [ ] VS Code workspace integration
- [ ] Multi-repository support
- [ ] Worktree sharing across team
- [ ] Git hooks integration
- [ ] Backup and restore worktrees

## Inspiration

This project architecture is inspired by:

- `~/.claude/scripts/crawler` - TypeScript/Bun + Go hybrid architecture
- `~/.claude/scripts/fetcher` - Modular structure and CLI patterns
- Original `setup-worktree.sh` - Core workflow and requirements
- AdonisJS Logger - Structured logging patterns

## License

Part of the Claude Code configuration system.

## Support

For issues and feature requests:
1. Check the troubleshooting section
2. Run with `--debug` flag for detailed logs
3. Review configuration in `config/default.json`
