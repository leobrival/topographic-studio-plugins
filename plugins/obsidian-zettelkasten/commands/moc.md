---
description: Create or update a Map of Content (MOC) for a topic cluster
argument-hint: "<topic name> [--update]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion", "Skill", "TodoWrite"]
---

# Create/Update Map of Content (MOC)

Create a navigational index for a topic cluster, or update an existing MOC with new notes.

**FIRST**: Load the `obsidian-zettelkasten:zettelkasten-methodology` skill for methodology reference.

## Your Task

Create or update a MOC for: `$ARGUMENTS`

## What is a MOC?

A Map of Content is:
- **Not a folder**: It's a note that links to other notes
- **Not hierarchical**: Provides entry points, not structure
- **Dynamic**: Grows with your knowledge
- **Contextual**: Explains why notes belong together

## Workflow

### Step 1: Parse Arguments

Extract from `$ARGUMENTS`:
- **Topic**: The theme for the MOC
- **--update flag**: If present, update existing MOC

### Step 2: Detect Vault & Check Existing

Find vault:
```bash
ls -d ~/Documents/Obsidian* 2>/dev/null
```

Check for existing MOC:
```bash
grep -il "title.*Topic.*MOC" vault/3-moc/*.md
grep -il "aliases.*Topic.*Map" vault/3-moc/*.md
```

**If MOC exists and --update not specified**:
- Ask: "A MOC for this topic exists. Update it or view it?"

### Step 3: Gather Related Notes

Search for notes related to the topic:

```bash
# Search by topic keyword in content
grep -rl "topic-keyword" vault/2-permanent/*.md

# Search by tag
grep -l "tags:.*topic" vault/2-permanent/*.md

# Search by title
ls vault/2-permanent/*topic*.md 2>/dev/null
```

Use Glob to find candidates:
```
pattern: "**/2-permanent/*.md"
```

Read promising notes to verify relevance.

### Step 4: Organize Notes

Present found notes to user:

```
Found 12 notes related to "Productivity":

Core Concepts (foundational):
- [[deep-work-definition]]
- [[attention-residue]]
- [[time-blocking-method]]

Techniques (actionable):
- [[pomodoro-technique]]
- [[eisenhower-matrix]]
- [[two-minute-rule]]

Psychology (understanding):
- [[decision-fatigue]]
- [[willpower-depletion]]
- [[habit-formation]]

How would you like to organize these?
- Accept this grouping
- Reorganize manually
- Add more notes
```

### Step 5: Create/Update MOC

#### For New MOC

**Filename**: `YYYYMMDDHHmm-moc-topic-name.md`

**Location**: `vault/3-moc/`

**Content**:
```markdown
---
id: "YYYYMMDDHHmm"
title: "Topic Name MOC"
aliases:
  - "Topic Name Map"
  - "Topic Name Index"
created: YYYY-MM-DDTHH:mm:ss
modified: YYYY-MM-DDTHH:mm:ss
type: moc
tags:
  - moc
  - topic-tag
---

# Topic Name Map of Content

[Brief overview: What is this topic about? Why does it matter?
2-3 sentences providing context for someone new to this area.]

---

## Foundations

Start here if you're new to this topic:

- [[foundational-note-1]] - Core concept that everything builds on
- [[foundational-note-2]] - Essential understanding for the rest

## Core Ideas

### Subtopic 1

- [[note-1]] - brief context explaining what this adds
- [[note-2]] - brief context

### Subtopic 2

- [[note-3]] - brief context
- [[note-4]] - brief context

### Subtopic 3

- [[note-5]] - brief context

## Advanced Topics

For deeper exploration:

- [[advanced-note-1]] - where this leads
- [[advanced-note-2]] - edge cases and nuances

---

## Open Questions

Things I'm still exploring:

- Question that needs more research
- Gap in my understanding
- Contradiction I haven't resolved

## Related MOCs

- [[parent-moc]] - broader context
- [[sibling-moc]] - parallel topic
- [[child-moc]] - more specific area

---

## Recently Added

Notes added in the last 30 days:

```dataview
LIST
FROM [[]]
WHERE type = "permanent"
AND file.ctime >= date(today) - dur(30 days)
SORT file.ctime DESC
LIMIT 5
```
```

#### For Updating Existing MOC

1. **Read existing MOC**
2. **Find new notes** not already linked
3. **Suggest additions**:
   ```
   Found 3 new notes to add to Productivity MOC:

   - [[new-note-1]] - Suggest under "Techniques"
   - [[new-note-2]] - Suggest under "Core Ideas"
   - [[new-note-3]] - Might need new section "Tools"

   Add these? (y/n/customize)
   ```
4. **Update modified date**
5. **Add to appropriate sections**

### Step 6: Integration

After creating/updating:

1. **Update related notes**:
   - Ask if should add MOC link to included notes
   - Add `Part of [[topic-moc]]` to notes that lack it

2. **Suggest parent MOC**:
   - Check for broader MOC this should link to
   - "Should this MOC link to [[main-index-moc]]?"

3. **Report completion**:
   ```
   Created: 202312150930-moc-productivity.md

   Contains: 12 notes organized into 4 sections
   Dataview query: Included for dynamic updates
   Related MOCs: 2 connected

   Next steps:
   - Add new notes with /zettel
   - Run /moc Productivity --update periodically
   ```

## MOC Quality Checks

Before finalizing:

- [ ] **Overview present**: Brief intro explaining the topic
- [ ] **Entry points clear**: Newcomers know where to start
- [ ] **Notes have context**: Each link explains why it's there
- [ ] **Logical organization**: Sections make sense
- [ ] **Not too flat**: Subtopics group related notes
- [ ] **Not too deep**: Can scan and find things quickly
- [ ] **Related MOCs linked**: Part of larger structure

## Examples

### Example: New MOC

**Input**: `/moc "Personal Knowledge Management"`

**Output creates**:
```markdown
# Personal Knowledge Management MOC

Personal Knowledge Management (PKM) is the practice of capturing,
organizing, and developing knowledge for personal and professional use.

---

## Foundations

- [[what-is-pkm]] - Definition and core concepts
- [[why-pkm-matters]] - Benefits of intentional knowledge management

## Methods

### Zettelkasten

- [[zettelkasten-principles]] - Core methodology
- [[atomic-notes]] - One idea per note
- [[note-linking]] - Creating connections

### Building a Second Brain

- [[code-method]] - Capture, Organize, Distill, Express
- [[progressive-summarization]] - Layered highlighting

## Tools

- [[obsidian-for-pkm]] - Using Obsidian effectively
- [[notion-vs-obsidian]] - Tool comparison

---

## Open Questions

- How to balance capture with processing?
- When does a PKM system become too complex?

## Related MOCs

- [[productivity-moc]]
- [[learning-moc]]
```

### Example: Update existing

**Input**: `/moc "Productivity" --update`

**Output**:
```
Updating Productivity MOC...

Current notes: 12
New notes found: 3

Additions:
+ [[energy-management]] → Section: "Psychology"
+ [[time-boxing-vs-time-blocking]] → Section: "Techniques"
+ [[productivity-systems-comparison]] → New section: "Comparisons"

Updated: 202312150930-moc-productivity.md
Total notes: 15
```

## Error Handling

**If no related notes found**:
```
No notes found related to "Quantum Physics".

Would you like to:
1. Create the MOC anyway (for future notes)
2. Create some foundational notes first with /zettel
3. Search with different keywords
```

**If too many notes found (50+)**:
```
Found 73 notes related to "Programming".

This might be too broad. Consider:
1. Split into multiple MOCs (Frontend, Backend, Algorithms)
2. Focus on a specific subtopic
3. Proceed anyway (might be hard to organize)
```
