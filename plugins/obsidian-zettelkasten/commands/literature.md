---
description: Create a literature note from a source (book, article, video, podcast)
argument-hint: "<source title> [--author <name>] [--type <book|article|video|podcast>]"
allowed-tools: ["Read", "Write", "Glob", "Grep", "AskUserQuestion", "Skill", "TodoWrite", "WebSearch", "WebFetch"]
---

# Create Literature Note

Create a literature note to capture and process ideas from a source.

**FIRST**: Load the `obsidian-zettelkasten:zettelkasten-methodology` skill for methodology reference.

## Your Task

Create a literature note from the source: `$ARGUMENTS`

## Workflow

### Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- **Source title**: Required
- **Author**: Optional (--author or -a)
- **Type**: Optional (--type or -t): book, article, video, podcast, paper
- **URL**: Optional (--url or -u)

If missing critical info, use AskUserQuestion:
- "Who is the author?"
- "What type of source is this?" (book, article, video, podcast)

### Step 2: Gather Source Information

**If URL provided or source is online**:
- Use WebSearch to find source metadata
- Use WebFetch to get additional details

**If book**:
- Search for author, year, publisher
- ISBN if available

**Build source metadata**:
```yaml
source:
  title: "Source Title"
  author: "Author Name"
  year: 2023
  type: book
  url: ""
  isbn: ""
```

### Step 3: Detect Vault & Check Existing

Find vault:
```bash
ls -d ~/Documents/Obsidian* 2>/dev/null
```

Check if literature note already exists:
```bash
grep -l "title.*Source Title" vault/1-literature/*.md
```

If exists, ask user:
- "A literature note for this source exists. Update it or view it?"

### Step 4: Guide User Through Capture

Use AskUserQuestion to gather content:

**Question 1**: "What are the key ideas from this source?"
- Options: Let user type freely

**Question 2**: "Any notable quotes to include?"
- Options: "Yes, I'll share some" / "No quotes needed"

**Question 3**: "What existing notes might this connect to?"
- Show recent permanent notes from vault
- Options: Suggested notes + "I'll find them later"

### Step 5: Generate Literature Note

**Filename**: `YYYYMMDDHHmm-lit-source-title-kebab.md`

**Location**: `vault/1-literature/`

**Content**:
```markdown
---
id: "YYYYMMDDHHmm"
title: "Notes on Source Title"
aliases:
  - "Author Year"
  - "Short reference"
created: YYYY-MM-DDTHH:mm:ss
modified: YYYY-MM-DDTHH:mm:ss
type: literature
tags:
  - literature-note
  - source-type
source:
  title: "Source Title"
  author: "Author Name"
  year: 2023
  type: book
  url: ""
status: seedling
---

# Notes on Source Title

**Source**: Author Name (Year). _Source Title_

## Summary

[2-3 sentence overview of the source's main argument or content]

## Key Ideas

### [Idea 1 Title]

[Idea in your own words - NOT copied from source]

- Potential permanent note: [[possible-zettel-title]]
- Connects to: [[existing-note]]

### [Idea 2 Title]

[Idea in your own words]

- Potential permanent note: [[possible-zettel-title]]

### [Idea 3 Title]

[Idea in your own words]

## Notable Quotes

> "Exact quote from source" (p. X)

_My interpretation_: What this means to me and how I understand it.

## Permanent Notes to Create

- [ ] Create [[idea-1-zettel]] from Idea 1
- [ ] Create [[idea-2-zettel]] from Idea 2
- [ ] Link to [[existing-topic-moc]]

## Questions Raised

- Question I want to explore further
- Something I disagree with or need to verify

## Related Sources

- [[other-literature-note]] - explores similar themes
```

### Step 6: Post-Creation Workflow

After creating the literature note:

1. **Ask about permanent notes**:
   ```
   I identified 3 potential permanent notes from this source:
   1. [Idea 1] - Core concept about X
   2. [Idea 2] - Interesting insight on Y
   3. [Idea 3] - Contrarian view on Z

   Would you like me to create any of these as permanent notes now?
   Use /zettel to create them later.
   ```

2. **Suggest connections**:
   ```
   This source might connect to:
   - [[existing-note-1]] - similar topic
   - [[existing-moc]] - fits this theme

   Add these connections? (y/n)
   ```

3. **Report completion**:
   ```
   Created: 202312150930-lit-atomic-habits.md

   Source: James Clear (2018). Atomic Habits
   Ideas captured: 5
   Quotes: 2
   Potential Zettel: 3

   Next steps:
   - Create permanent notes with /zettel
   - Process quotes into insights
   - Link to existing knowledge
   ```

## Quality Checks

Before creating, verify:

- [ ] **Source complete**: Title, author, year, type present
- [ ] **Ideas in own words**: Not copy-pasted from source
- [ ] **Actionable**: Clear paths to permanent notes
- [ ] **Connected**: Links to existing knowledge
- [ ] **Attributed**: Quotes have page/timestamp references

## Examples

### Example: Book

**Input**: `/literature "Atomic Habits" --author "James Clear" --type book`

### Example: Article with URL

**Input**: `/literature "The Zettelkasten Method" --url https://example.com/article`

### Example: Video

**Input**: `/literature "Building a Second Brain" --author "Tiago Forte" --type video`

## Error Handling

**If source not found online**:
- Ask user for manual metadata
- Continue without external enrichment

**If user provides only title**:
- Search for source information
- Confirm findings with user

**If ideas are copy-pasted**:
- Warn user: "This looks like a direct quote. Rephrase in your own words for better retention."
- Offer to help rephrase
