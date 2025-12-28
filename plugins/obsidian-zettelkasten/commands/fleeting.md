---
description: Quick capture a fleeting idea or thought
argument-hint: "<quick idea or thought>"
allowed-tools: ["Read", "Write", "Glob", "AskUserQuestion", "Skill"]
---

# Create Fleeting Note

Quickly capture an idea before it's lost. Fleeting notes are temporary and should be processed within 24-48 hours.

**FIRST**: Load the `obsidian-zettelkasten:zettelkasten-methodology` skill for methodology reference.

## Your Task

Capture the fleeting idea: `$ARGUMENTS`

## Philosophy

Fleeting notes are:
- **Temporary**: Not meant to last
- **Quick**: Capture over perfection
- **Gateway**: Path to permanent notes
- **Low friction**: No overthinking

## Workflow

### Step 1: Detect Vault

Find vault quickly:
```bash
ls -d ~/Documents/Obsidian*/0-inbox 2>/dev/null || \
ls -d ~/Obsidian*/0-inbox 2>/dev/null
```

If inbox doesn't exist:
```bash
mkdir -p vault/0-inbox
```

### Step 2: Quick Capture

**No questions asked** - just capture immediately.

Generate timestamp:
```bash
date +%Y%m%d%H%M
```

**Filename**: `YYYYMMDDHHmm-fleeting-brief-title.md`

**Location**: `vault/0-inbox/`

### Step 3: Create Note

**Minimal template** - speed is priority:

```markdown
---
id: "YYYYMMDDHHmm"
title: "Brief title from idea"
created: YYYY-MM-DDTHH:mm:ss
type: fleeting
tags:
  - fleeting
  - to-process
process_by: YYYY-MM-DD  # 2 days from now
---

# Brief title

$ARGUMENTS

---

## Context

[When/where this came up - optional]

## Maybe related to

- [[possible-connection]]?

---

**Process by**: YYYY-MM-DD (2 days)
```

### Step 4: Minimal Output

Keep response short:

```
Captured: 202312150930-fleeting-sleep-decisions.md

Idea: Connection between sleep quality and decision making

Process by: 2023-12-17

Tip: Run /review to process fleeting notes
```

## Speed Optimizations

### If Arguments Empty

If user just types `/fleeting` without arguments:

```
Quick capture - type your idea:
```

Wait for input, then capture immediately.

### Minimal Interaction

- No questions unless absolutely necessary
- No waiting for confirmation
- Create immediately, report after

### Batch Capture Mode

If user provides multiple ideas separated by newlines:
- Create one fleeting note per idea
- Report all at once

```
Captured 3 fleeting notes:
1. 202312150930-fleeting-idea-one.md
2. 202312150931-fleeting-idea-two.md
3. 202312150932-fleeting-idea-three.md

Process by: 2023-12-17
```

## Examples

### Example: Simple capture

**Input**: `/fleeting Why do I always procrastinate on important tasks?`

**Output**:
```
Captured: 202312150930-fleeting-procrastination-important.md

Process by: 2023-12-17
```

### Example: With context

**Input**: `/fleeting Heard in podcast: sleep deprivation affects amygdala function`

**Output**:
```
Captured: 202312150930-fleeting-sleep-amygdala.md

Context detected: podcast
Process by: 2023-12-17
```

### Example: Empty call

**Input**: `/fleeting`

**Output**:
```
Quick capture mode. What's on your mind?
```

**User**: `The relationship between boredom and creativity`

**Output**:
```
Captured: 202312150930-fleeting-boredom-creativity.md

Process by: 2023-12-17
```

## Processing Reminders

After 10 fleeting notes in inbox, gently remind:

```
You have 10+ fleeting notes waiting.

Run /review to process them into permanent notes.

Fleeting notes lose value if not processed!
```

## Integration

Fleeting notes connect to:
- `/review` - Process fleeting notes
- `/zettel` - Transform into permanent note
- `/literature` - If from a source, create literature note first

## No Quality Checks

**This is intentional.** Fleeting notes should:
- NOT be perfect
- NOT be complete
- NOT be polished

Just capture. Process later.
