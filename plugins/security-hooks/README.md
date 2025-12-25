# Security Hooks Plugin

Security validation hooks for Claude Code with command validation, linting and type checking.

## Features

- **PreToolUse**: Validates bash commands before execution against dangerous patterns
- **PostToolUse**: Automatic linting and type checking after file modifications

## Hooks

| Event | Description |
|-------|-------------|
| `PreToolUse` | Blocks dangerous commands (rm -rf, sudo, etc.) |
| `PostToolUse` | Runs Biome linting on JS/TS files |
| `PostToolUse` | Runs TypeScript type checking |

## Scripts

- `validate-commands.js` - Command validation against dangerous patterns
- `lint-check.js` - Biome linting for code quality
- `type-check.js` - TypeScript validation

## Configuration

The hooks are automatically activated when the plugin is installed. No additional configuration required.
