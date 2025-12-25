# Hookify Enhanced (Bun Edition)

Enhanced hookify with **24 pre-configured security rules** - uses **Bun runtime** instead of Python.

## Key Features

- **No Python required** - Uses Bun (bundled with macOS via Anthropic)
- **24 ready-to-use security rules**
- **TypeScript codebase** - Type-safe and maintainable
- **Zero dependencies** - Uses Node.js built-in modules only

## Quick Start

```bash
# Add marketplace
/plugin marketplace add leobrival/topographic-studio-plugins

# Install hookify
/plugin install hookify@topographic-studio-plugins
```

## Pre-configured Rules (24 total)

### Bash Commands - Block (16 rules)

| Rule | Pattern | Description |
|------|---------|-------------|
| rm -rf | `rm\s+-rf` | Recursive force delete |
| rm wildcard | `rm\s+.*\/\*$` | Delete all files in directory |
| dd | `dd\s+if=` | Direct disk access |
| mkfs | `mkfs\.` | Filesystem creation |
| sudo | `sudo\s+` | Privilege escalation |
| curl pipe | `curl.*\|\s*(sh\|bash)` | Remote code execution |
| ... | ... | See rules/ directory |

### File Editing (4 rules)

| Rule | Action | Description |
|------|--------|-------------|
| console.log | warn | Debug logging detected |
| hardcoded secrets | block | API keys in code |
| TODO/FIXME | warn | Pending work markers |
| debugger | warn | Debug statements |

## Usage

### List active rules

```bash
/hookify:list
```

### Create custom rule

```bash
/hookify Block npm publish commands
```

### Add rule manually

Create `.claude/hookify.my-rule.local.md`:

```markdown
---
name: my-custom-rule
enabled: true
event: bash
pattern: my-dangerous-command
action: block
---

**My custom warning message**
```

## Technical Details

### Runtime

Uses **Bun** instead of Python:
- Faster startup time
- No Python installation required
- TypeScript support out of the box

### File Structure

```
hookify/
├── .claude-plugin/
│   └── plugin.json
├── hooks/
│   ├── hooks.json          # Hook configuration (uses bun)
│   ├── pretooluse.ts       # PreToolUse hook
│   ├── posttooluse.ts      # PostToolUse hook
│   ├── stop.ts             # Stop hook
│   └── userpromptsubmit.ts # UserPromptSubmit hook
├── core/
│   ├── types.ts            # TypeScript types
│   ├── config-loader.ts    # Rule loader
│   └── rule-engine.ts      # Rule evaluator
├── rules/                  # 24 pre-configured rules
└── commands/               # /hookify commands
```

## License

MIT - Based on hookify by Anthropic, enhanced with Bun runtime and comprehensive security rules.
