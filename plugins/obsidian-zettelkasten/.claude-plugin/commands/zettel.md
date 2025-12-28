---
description: Create a new atomic permanent note (Zettel) in your Obsidian vault
argument-hint: "<idea or topic>"
allowed-tools: ["Read", "Write", "Glob", "Grep", "AskUserQuestion", "Skill", "TodoWrite"]
---

# Create Permanent Note (Zettel)

Create a new atomic permanent note following Zettelkasten principles.

**FIRST**: Load the `obsidian-zettelkasten:zettelkasten-methodology` skill for methodology reference.

## Your Task

Create a single atomic note from the user's input: `$ARGUMENTS`

## Workflow

### Step 1: Detect Obsidian Vault

Find the user's Obsidian vault:

```bash
# Check common locations
ls -d ~/Documents/Obsidian* 2>/dev/null
ls -d ~/Obsidian* 2>/dev/null
ls -d ~/.obsidian-vaults/* 2>/dev/null
```

If vault not found, use AskUserQuestion:
- "Where is your Obsidian vault?"
- Options: Common paths or "Other" for custom path

### Step 2: Analyze the Input

From `$ARGUMENTS`, extract:
1. **Core idea**: What single concept is being expressed?
2. **Keywords**: Main terms for searching related notes
3. **Potential title**: Kebab-case descriptive title

**Atomicity check**:
- Does this contain multiple ideas? If yes, ask user if they want to split.
- Is this too vague? If yes, ask for clarification.

### Step 3: Find Related Notes

Search the vault for related content:

```bash
# Search by keywords
grep -rl "keyword" vault/2-permanent/*.md
grep -rl "keyword" vault/3-moc/*.md
```

Use Glob to find potential connections:
```
pattern: "**/2-permanent/*.md"
```

Present found connections to user:
- "I found X related notes. Want me to suggest links?"

### Step 4: Generate the Note

Create the note with this structure:

**Filename**: `YYYYMMDDHHmm-kebab-case-title.md`

**Location**: `vault/2-permanent/`

**Content**:
```markdown
---
id: "YYYYMMDDHHmm"
title: "Title in Natural Language"
aliases: []
created: YYYY-MM-DDTHH:mm:ss
modified: YYYY-MM-DDTHH:mm:ss
type: permanent
tags: []
status: seedling
---

# Title in Natural Language

[The atomic idea written clearly in complete sentences.
Self-contained and understandable without other notes.
One concept, thoroughly explained.]

---

## Connections

- Related to [[found-note-1]] because [explain relationship]
- Supports [[found-note-2]] in that [explanation]

## Sources

[If derived from a literature note or source]

## Questions

- [Open questions this raises]
```

### Step 5: Integration

1. **Show the note to user** for approval before writing

2. **After approval, write the file**:
   - Use Write tool to create the note
   - Confirm file creation

3. **Suggest MOC addition**:
   - Check existing MOCs for relevance
   - Ask if user wants to add to a MOC

4. **Report completion**:
   ```
   Created: 202312150930-compound-effect-habits.md

   Location: vault/2-permanent/
   Links: 3 connections suggested
   Status: seedling

   Next steps:
   - Review and refine the note
   - Add to relevant MOC with /moc
   - Find more connections with /link
   ```

## Quality Checks

Before creating, verify:

- [ ] **Atomic**: Contains exactly one idea
- [ ] **Autonomous**: Understandable alone
- [ ] **Titled**: Descriptive kebab-case filename
- [ ] **Linked**: At least one connection suggested
- [ ] **Tagged**: Appropriate tags included
- [ ] **Dated**: Correct timestamp ID

## Examples

### Example 1: Simple idea

**Input**: `/zettel The compound effect of small daily habits`

**Output**:
```markdown
---
id: "202312150930"
title: "The compound effect of small daily habits"
aliases:
  - compound habits
  - habit stacking
created: 2023-12-15T09:30:00
modified: 2023-12-15T09:30:00
type: permanent
tags:
  - habits
  - productivity
  - psychology
status: seedling
---

# The compound effect of small daily habits

Small actions, repeated consistently, produce disproportionately large
results over time. A 1% improvement daily leads to being 37x better
after one year. This principle applies to habits, skills, and knowledge
accumulation.

The power comes not from individual actions but from their accumulation.
Missing one day has minimal impact, but consistency over months
transforms outcomes. This explains why habits feel ineffective initially
but become transformative later.

---

## Connections

- Related to [[atomic-habits-literature]] as source material
- Supports [[consistency-over-intensity]] in that both emphasize regularity
- Contradicts [[big-wins-fallacy]] regarding the importance of small actions

## Questions

- At what point does the compound effect become noticeable?
- How does this apply to negative habits?
```

### Example 2: Complex idea that needs splitting

**Input**: `/zettel Sleep affects memory and also exercise improves mood`

**Response**:
```
This contains two distinct ideas:
1. Sleep affects memory
2. Exercise improves mood

Would you like me to:
- Create two separate notes (recommended for Zettelkasten)
- Focus on just one of these ideas
- Find a connecting theme if one exists
```

## Error Handling

**If vault structure doesn't exist**:
- Offer to create the folder structure
- `mkdir -p vault/0-inbox vault/1-literature vault/2-permanent vault/3-moc`

**If similar note exists**:
- Show the existing note
- Ask: "Link to this instead, or create a new note?"

**If idea is too vague**:
- Ask clarifying questions
- "Can you explain this in more detail?"
- "What specifically do you mean by X?"
