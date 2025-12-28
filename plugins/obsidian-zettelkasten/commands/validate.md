---
description: Validate notes frontmatter, structure, and links using Bun/TypeScript validators
argument-hint: "[vault-path]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "AskUserQuestion", "TodoWrite"]
---

# Validate Zettelkasten Notes

Run validation checks on your Obsidian vault using TypeScript validators.

## Your Task

Validate notes in the vault specified by `$ARGUMENTS` (or detect automatically).

## Interactive Workflow

### Step 1: Detect or Ask for Vault Path

If `$ARGUMENTS` is empty or no vault path provided:

1. Try to auto-detect vault:
   ```bash
   ls -d ~/Documents/Obsidian* ~/Obsidian* 2>/dev/null | head -5
   ```

2. If multiple vaults found or none detected, use `AskUserQuestion`:
   ```
   question: "Which Obsidian vault do you want to validate?"
   header: "Vault"
   options:
     - label: "~/Documents/Obsidian/MyVault"
       description: "Detected vault"
     - label: "Enter custom path"
       description: "Specify a different location"
   ```

### Step 2: Ask Validation Type

Use `AskUserQuestion` to determine what to validate:

```
question: "What do you want to validate?"
header: "Validators"
multiSelect: true
options:
  - label: "All (Recommended)"
    description: "Run frontmatter, structure, and link validators"
  - label: "Frontmatter"
    description: "Check YAML metadata (id, title, dates, type, status)"
  - label: "Structure"
    description: "Check note atomicity, headings, word count"
  - label: "Links"
    description: "Check broken links, orphans, weak connections"
```

### Step 3: Ask Validation Options

Use `AskUserQuestion` for additional options:

```
question: "Validation options?"
header: "Options"
multiSelect: true
options:
  - label: "Normal mode (Recommended)"
    description: "Errors fail, warnings are informational"
  - label: "Strict mode"
    description: "Treat warnings as errors"
  - label: "Auto-fix"
    description: "Attempt to fix common issues automatically"
  - label: "Generate report"
    description: "Save results to a markdown file"
```

### Step 4: Run Validators

Based on user choices, execute the appropriate validators:

```bash
cd $VAULT/.scripts && bun run validate $VAULT [options]
```

**Validator Commands:**
- Full: `bun run validate $VAULT`
- Frontmatter: `bun run validate:frontmatter $VAULT`
- Structure: `bun run validate:structure $VAULT`
- Links: `bun run validate:links $VAULT`

**Options:**
- Strict: `--strict`
- Output JSON: `--output json --file report.json`
- Output Markdown: `--output markdown --file report.md`

### Step 5: Present Results

Display a formatted report:

```
ZETTELKASTEN VALIDATION REPORT

Vault: /Users/you/Documents/Obsidian/MyVault
Time: 2024-01-15T10:30:00Z

--- Summary ---
  Total notes:  127
  Valid:        120 (94.5%)
  Invalid:      7
  Errors:       12
  Warnings:     23

--- Notes by Type ---
  permanent     89
  literature    23
  moc           8
  fleeting      7

--- Issues Found ---

FAIL compound-habits.md
  ERROR [frontmatter] Missing required field "id"
  WARN  [structure] Note has 7 H2 sections. Consider splitting

FAIL orphan-note.md
  WARN  [links] Orphan note: no incoming or outgoing links
```

### Step 6: Offer Next Actions

If issues were found, use `AskUserQuestion`:

```
question: "Issues found. What would you like to do next?"
header: "Next step"
options:
  - label: "Auto-fix issues"
    description: "Attempt to fix 5 fixable issues automatically"
  - label: "Review manually"
    description: "Run /review to examine each issue"
  - label: "Find connections"
    description: "Run /link to fix orphan notes"
  - label: "Done"
    description: "Exit validation"
```

## Prerequisites Check

Before running validators, check:

```bash
# Check for Bun
which bun || echo "Bun not installed"

# Check if scripts exist in vault
ls $VAULT/.scripts/package.json 2>/dev/null || echo "Scripts not installed"
```

If prerequisites missing, offer to install:

```
question: "Validation scripts not found. Install them?"
header: "Install"
options:
  - label: "Yes, install now (Recommended)"
    description: "Copy scripts and install dependencies"
  - label: "No, cancel"
    description: "Exit without validating"
```

## Validator Details

### Frontmatter Validator
- Valid YAML syntax
- Required fields (id, title, created, type, status)
- ID format (YYYYMMDDHHmm)
- Date format (ISO 8601)
- Valid type/status values
- Source fields for literature notes

### Structure Validator
- Atomicity (single concept per note)
- H1 heading present
- No heading level jumps
- Word count limits by type
- No placeholder text (TODO, FIXME)

### Link Validator
- All links resolve to existing notes
- No self-referencing links
- Orphan notes detection
- Weakly connected notes (< 2 links)
- Broken links count

## Auto-Fix Capabilities

When auto-fix is enabled:

1. **Missing ID**: Generate from filename timestamp or current time
2. **Missing dates**: Set from file modification time
3. **Missing type**: Infer from folder structure
4. **Missing status**: Default to "seedling"

Always confirm before applying fixes:

```
question: "Found 5 fixable issues. Apply fixes?"
header: "Confirm"
options:
  - label: "Yes, fix all"
    description: "Apply all automatic fixes"
  - label: "Review each"
    description: "Confirm each fix individually"
  - label: "No, skip"
    description: "Don't apply any fixes"
```
