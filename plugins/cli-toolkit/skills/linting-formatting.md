---
description: Linting and formatting standards with Biome for TypeScript/JavaScript and Prettier + markdownlint for Markdown
---

# Linting and Formatting

Standardized code quality tools for consistent, maintainable code.

## Tool Selection

| File Type | Tool | Command |
|-----------|------|---------|
| TypeScript/JavaScript | Biome | `bun run lint` |
| Markdown | Prettier + markdownlint-cli2 | `mdfix .` |

## Biome - TypeScript/JavaScript

**Why Biome?**

- 10-100x faster than ESLint + Prettier (written in Rust)
- All-in-one: linting, formatting, import organization
- Zero config with sensible defaults

### Configuration

Create `biome.json` at project root:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.5/schema.json",
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  }
}
```

### Usage

```bash
# Check code without modifying
bun run lint

# Check and auto-fix issues
bun run lint:fix

# Format code only
bun run format
```

### When to Use Biome

- ALWAYS for TypeScript/JavaScript verification
- BEFORE committing code changes
- AFTER creating or editing .ts/.tsx/.js/.jsx files
- INSTEAD OF ESLint or Prettier for new projects

### Code Style Enforced

| Style | Value |
|-------|-------|
| Indentation | Tabs |
| Quotes | Double (`"`) |
| Semicolons | Optional (ASI) |
| Imports | Auto-organized |
| Template literals | Preferred |

### Tool Priority

```
Biome (preferred) > ESLint > Prettier > TSLint (deprecated)
```

Use ESLint/Prettier only if:
- Project already uses them
- Biome is not available

## Markdown - Prettier + markdownlint

**Why not Biome for Markdown?**
Biome does not yet support Markdown (planned after HTML/CSS).

### Configuration

Create `.markdownlint.json` at project root:

```json
{
  "default": true,
  "MD001": true,
  "MD003": { "style": "atx" },
  "MD004": { "style": "dash" },
  "MD007": { "indent": 2 },
  "MD010": { "code_blocks": false },
  "MD013": false,
  "MD024": { "siblings_only": true },
  "MD025": true,
  "MD026": { "punctuation": ".,;:!" },
  "MD029": false,
  "MD030": { "ul_single": 1, "ol_single": 1, "ul_multi": 1, "ol_multi": 1 },
  "MD032": true,
  "MD033": { "allowed_elements": ["br", "img", "a", "span", "div", "details", "summary", "Option"] },
  "MD034": false,
  "MD036": false,
  "MD040": false,
  "MD041": false,
  "MD046": { "style": "fenced" },
  "MD049": { "style": "underscore" },
  "MD050": { "style": "asterisk" },
  "MD058": true,
  "MD060": false
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "lint:md": "markdownlint-cli2 '**/*.md' '!node_modules/**/*.md'",
    "fix:md": "markdownlint-cli2 --fix '**/*.md' '!node_modules/**/*.md' && prettier --write '**/*.md'"
  }
}
```

### Global CLI Tool

Use `mdfix` for quick formatting:

```bash
# Fix a single file
mdfix file.md

# Fix all .md files in a directory
mdfix docs/

# Fix all .md files recursively
mdfix '**/*.md'

# Fix current directory
mdfix
```

### Markdown Style Enforced

| Style | Value |
|-------|-------|
| Headings | ATX style (`#`) |
| Lists | Dash (`-`) |
| Code blocks | Fenced (```) |
| Line length | Disabled |
| Tables | Prettier-formatted |

## Project Setup Checklist

### New TypeScript/JavaScript Project

1. Install Biome: `bun add -d @biomejs/biome`
2. Create `biome.json` (copy from above)
3. Add scripts to `package.json`
4. Run `bun run lint:fix`
5. Commit configuration files

### New Project with Markdown

1. Create `.markdownlint.json` (copy from above)
2. Add Markdown scripts to `package.json`
3. Run `mdfix .`
4. Commit configuration files

## Integration

### Claude Code Hooks

PostToolUse hooks automatically run:
- Biome on Edit/Write for .ts/.tsx/.js/.jsx files
- Type checking for TypeScript files

### Editor Integration

**Zed:**
```json
{
  "format_on_save": "on",
  "formatter": "biome"
}
```

**VS Code:**
- Install Biome extension
- Install Prettier + markdownlint extensions

## Quick Reference

```bash
# TypeScript/JavaScript
bun run lint        # Check
bun run lint:fix    # Fix
bun run format      # Format only

# Markdown
bun run lint:md     # Check
bun run fix:md      # Fix
mdfix .             # Global CLI
```
