---
description: Validate notes frontmatter, structure, and links using Bun/TypeScript validators
argument-hint: "[--frontmatter] [--structure] [--links] [--all] [--strict] [--fix]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "AskUserQuestion", "Skill", "TodoWrite"]
---

# Validate Zettelkasten Notes

Run validation checks on your Obsidian vault using TypeScript validators.

## Your Task

Validate notes based on: `$ARGUMENTS`

## Validation Modes

Parse `$ARGUMENTS`:

1. **--frontmatter**: Validate YAML frontmatter only
2. **--structure**: Validate note structure only
3. **--links**: Validate links and connections
4. **--all**: Run all validators (default if no args)
5. **--strict**: Treat warnings as errors
6. **--fix**: Attempt to auto-fix issues

## Prerequisites

Check if scripts are installed:

```bash
# Check for Bun
which bun

# Check if dependencies installed
ls $VAULT/.scripts/node_modules 2>/dev/null || echo "Need to install"
```

If not installed:
```bash
cd $VAULT/.scripts && bun install
```

## Workflow

### Step 1: Detect Vault

```bash
# Find vault
VAULT=$(ls -d ~/Documents/Obsidian* 2>/dev/null | head -1)

# Check for scripts directory
if [ ! -d "$VAULT/.scripts" ]; then
  echo "Scripts not found. Installing..."
fi
```

### Step 2: Run Validators

#### Full Validation (default)

```bash
cd $VAULT/.scripts && bun run validate $VAULT
```

#### Frontmatter Only

```bash
cd $VAULT/.scripts && bun run validate:frontmatter $VAULT
```

#### Structure Only

```bash
cd $VAULT/.scripts && bun run validate:structure $VAULT
```

#### Links Only

```bash
cd $VAULT/.scripts && bun run validate:links $VAULT
```

### Step 3: Parse Output

The validators output structured results. Parse and present:

```
ZETTELKASTEN VALIDATION REPORT

Vault: /Users/you/Documents/Obsidian/MyVault
Time: 2024-01-15T10:30:00Z

─ Summary ─
  Total notes:  127
  Valid:        120 (94.5%)
  Invalid:      7
  Errors:       12
  Warnings:     23

─ Notes by Type ─
  permanent     89
  literature    23
  moc           8
  fleeting      7

─ Notes by Status ─
  evergreen     34
  budding       28
  seedling      27

─ Issues ─
  Orphan notes: 5
  Broken links: 3
  Missing frontmatter: 2

─ Invalid Notes ─

FAIL compound-habits.md
  ERROR [frontmatter] Missing required field "id"
  WARN  [structure] Note has 7 H2 sections. Consider splitting

FAIL literature-note.md
  ERROR [source.title] Source is missing title

FAIL orphan-note.md
  WARN  [links] Orphan note: no incoming or outgoing links
```

### Step 4: Offer Fixes (if --fix)

For fixable issues, offer to auto-repair:

```
Found 5 fixable issues:

1. Missing ID (3 notes)
   - compound-habits.md
   - new-idea.md
   - random-thought.md

   Fix: Generate ID from filename timestamp or current time

2. Missing modified date (2 notes)
   - old-note.md
   - untouched.md

   Fix: Set modified to file modification time

Apply fixes? (all / select / skip)
```

#### Auto-Fix Logic

**Missing ID**:
```typescript
// Generate from filename if timestamp pattern
const match = filename.match(/^(\d{12})/);
if (match) {
  frontmatter.id = match[1];
} else {
  // Use current timestamp
  frontmatter.id = new Date().toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 12);
}
```

**Missing dates**:
```typescript
// Get file stats
const stats = await Bun.file(path).stat();
frontmatter.modified = stats.mtime.toISOString();
if (!frontmatter.created) {
  frontmatter.created = stats.birthtime.toISOString();
}
```

**Missing type**:
```typescript
// Infer from folder
if (path.includes('/0-inbox/')) frontmatter.type = 'fleeting';
if (path.includes('/1-literature/')) frontmatter.type = 'literature';
if (path.includes('/2-permanent/')) frontmatter.type = 'permanent';
if (path.includes('/3-moc/')) frontmatter.type = 'moc';
```

### Step 5: Report Results

```
Validation Complete

Summary:
├── Notes validated: 127
├── Valid: 125 (98.4%)
├── Fixed: 5
├── Remaining issues: 2

Remaining Issues:
1. broken-link.md - Links to non-existent note
   Action: Remove link or create target note

2. too-long.md - Exceeds 1000 word limit
   Action: Split into multiple notes

Run /review to address these manually.
```

## Validator Details

### Frontmatter Validator

Checks:
- [ ] Valid YAML syntax
- [ ] Required fields present (by note type)
- [ ] ID format (YYYYMMDDHHmm)
- [ ] Date format (ISO 8601)
- [ ] Valid type value
- [ ] Valid status value
- [ ] Source fields for literature notes
- [ ] Aliases array format
- [ ] Tags array format

### Structure Validator

Checks:
- [ ] Atomicity (single concept)
- [ ] H1 heading present
- [ ] No heading level jumps
- [ ] Required sections by type
- [ ] Word count limits
- [ ] Content not empty
- [ ] No placeholder text
- [ ] Quote density for permanent notes
- [ ] Connections section for linked notes

### Link Validator

Checks:
- [ ] All links resolve to existing notes
- [ ] No self-referencing links
- [ ] No duplicate links
- [ ] Orphan notes detection
- [ ] Weakly connected notes
- [ ] Broken links count

## Configuration

Create `.validaterc.json` in vault root:

```json
{
  "strict": false,
  "exclude": [
    ".vectors",
    ".obsidian",
    "templates",
    "archive"
  ],
  "rules": {
    "frontmatter": {
      "requireId": true,
      "requireType": true,
      "requireStatus": false
    },
    "structure": {
      "maxWordCount": 1000,
      "minWordCount": 50,
      "requireH1": true
    },
    "links": {
      "minLinks": 1,
      "checkOrphans": true
    }
  }
}
```

## Output Formats

### JSON Report

```bash
bun run validate $VAULT --output json --file report.json
```

### Markdown Report

```bash
bun run validate $VAULT --output markdown --file report.md
```

## Integration with Review

After validation, suggest:

```
Validation found issues that /review can help with:

1. Orphan notes (5) → /review --orphans
2. Weak connections (12) → /link --suggest
3. Fleeting notes overdue (3) → /review --fleeting

Run these commands to address issues.
```

## Error Handling

**If scripts not found**:
```
Validation scripts not installed.

Install with:
1. Copy scripts to vault: cp -r plugin/scripts $VAULT/.scripts
2. Install dependencies: cd $VAULT/.scripts && bun install

Or run: /validate --install
```

**If Bun not installed**:
```
Bun runtime not found.

Install with:
curl -fsSL https://bun.sh/install | bash

Or use npm:
npm install && npm run validate
```
