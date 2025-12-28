---
description: Find and create meaningful links between notes
argument-hint: "<note-path or topic> [--orphans] [--suggest]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion", "Skill", "TodoWrite"]
---

# Find and Create Links

Discover connections between notes and strengthen your Zettelkasten network.

**FIRST**: Load the `obsidian-zettelkasten:zettelkasten-methodology` skill for methodology reference.

## Your Task

Find and create links based on: `$ARGUMENTS`

## Modes

Parse `$ARGUMENTS` to determine mode:

1. **Specific note**: Link a particular note to others
2. **--orphans**: Find and connect orphan notes (no links)
3. **--suggest**: Suggest links across the vault
4. **Topic keyword**: Find notes related to a topic

## Workflow

### Mode 1: Link Specific Note

**Input**: `/link 202312150930-compound-habits.md` or `/link compound habits`

#### Step 1: Find the note

```bash
# By filename
ls vault/2-permanent/*compound-habits*.md

# By content
grep -rl "compound habits" vault/2-permanent/*.md
```

Read the note to understand its content.

#### Step 2: Analyze for connections

Extract:
- Main concept/idea
- Keywords and themes
- Existing links (to avoid duplicates)
- Questions raised
- Related domains

#### Step 3: Search for related notes

```bash
# By keywords from note
grep -rl "keyword1\|keyword2" vault/2-permanent/*.md

# By similar tags
grep -l "tags:.*similar-tag" vault/2-permanent/*.md

# Exclude already linked notes
```

#### Step 4: Present connection opportunities

```
Analyzing: compound-effect-habits.md

Found 8 potential connections:

STRONG connections (high relevance):
1. [[consistency-over-intensity]]
   - Both emphasize small repeated actions
   - Suggested link: "This supports [[compound-effect-habits]] by showing..."

2. [[habit-stacking]]
   - Related technique for building habits
   - Suggested link: "[[habit-stacking]] is a practical application of..."

MODERATE connections (thematic):
3. [[delayed-gratification]]
   - Related psychological concept
   - Suggested link: "Requires [[delayed-gratification]] mindset"

4. [[exponential-growth-mental-model]]
   - Mathematical basis for compound effect
   - Suggested link: "Based on [[exponential-growth-mental-model]]"

WEAK connections (explore):
5. [[investment-principles]]
   - Compound interest parallel
   - Suggested link: "Similar to compound interest in [[investment-principles]]"

Which links should I add? (1,2,3 / all / none / custom)
```

#### Step 5: Create links with context

For each approved connection:

1. **Add outgoing link** to source note:
   ```markdown
   ## Connections

   - Supports [[consistency-over-intensity]] by providing the mechanism
   - Applied through [[habit-stacking]] technique
   - Requires [[delayed-gratification]] mindset
   ```

2. **Optionally add incoming link** to target note:
   - Ask: "Add reciprocal link in [[target-note]]?"
   - If yes, add contextual backlink

### Mode 2: Find Orphan Notes

**Input**: `/link --orphans`

#### Step 1: Find orphan notes

```bash
# Notes with no outgoing links
for file in vault/2-permanent/*.md; do
  if ! grep -q '\[\[' "$file"; then
    echo "$file"
  fi
done
```

Or use Dataview query:
```dataview
LIST
FROM "2-permanent"
WHERE length(file.outlinks) = 0
```

#### Step 2: Also check for notes with no incoming links

```bash
# Notes never referenced by others
# Compare all [[links]] against all filenames
```

#### Step 3: Present orphans

```
Found 5 orphan notes (no connections):

1. [[isolated-note-1]] (created 2023-12-10)
   Topic: psychology, decision-making
   Action: Find links?

2. [[isolated-note-2]] (created 2023-12-08)
   Topic: productivity
   Action: Find links?

3. [[isolated-note-3]] (created 2023-12-05)
   Topic: learning
   Action: Find links?

Options:
- Process all (find links for each)
- Select specific notes (1,3)
- Add to MOC instead
- Archive if no longer relevant
```

#### Step 4: Process each orphan

For each selected orphan:
1. Read the note
2. Search for related notes
3. Suggest connections
4. Create links (with user approval)

### Mode 3: Suggest Links Across Vault

**Input**: `/link --suggest`

#### Step 1: Analyze vault structure

```bash
# Count notes by folder
find vault -name "*.md" | wc -l

# Find clusters (notes with many shared tags)
```

#### Step 2: Identify weak connections

Look for:
- Notes with same tags but no links
- Notes mentioning same concepts
- Notes in same MOC but not linked

#### Step 3: Present suggestions

```
Vault Analysis Complete

Current state:
- Total notes: 127
- Permanent notes: 89
- Average links per note: 3.2
- Orphan notes: 7

Suggested connections:

HIGH VALUE (same topic, no link):
1. [[note-a]] ↔ [[note-b]]
   Both discuss "decision fatigue" but aren't linked

2. [[note-c]] → [[note-d]]
   Note C references concept explained in Note D

STRUCTURAL (strengthen MOC):
3. [[psychology-moc]] should include [[cognitive-biases]]
   Highly relevant, currently missing

LOW FRICTION (quick wins):
4. [[recent-note]] → [[established-note]]
   New note could link to well-connected hub

Process these suggestions? (all / select / skip)
```

### Mode 4: Topic-Based Linking

**Input**: `/link decision making`

#### Step 1: Find all notes about topic

```bash
grep -rl "decision making\|decision-making" vault/2-permanent/*.md
```

#### Step 2: Analyze connections within topic

Check which of these notes link to each other.

#### Step 3: Suggest missing connections

```
Notes about "decision making": 8 found

Connection map:
[[decision-fatigue]] ← → [[willpower-depletion]] ✓ linked
[[decision-fatigue]] ← → [[cognitive-load]] ✗ not linked
[[heuristics]] ← → [[cognitive-biases]] ✓ linked
[[paradox-of-choice]] ← → [[satisficing]] ✗ not linked

Missing connections:
1. [[decision-fatigue]] ↔ [[cognitive-load]]
   Both relate to mental resource limits

2. [[paradox-of-choice]] ↔ [[satisficing]]
   Satisficing is a solution to paradox of choice

Create these links? (y/n/customize)
```

## Link Quality Guidelines

### Good Links

- **Contextual**: Explain why the connection exists
- **Bidirectional thinking**: Consider both directions
- **Meaningful**: Not just "related" but specifically how

### Avoid

- **Link dumping**: Random "Related:" lists
- **Over-linking**: Not everything needs to connect
- **Forced connections**: If you can't explain why, don't link

## Output Format

After processing:

```
Link Analysis Complete

Note: compound-effect-habits.md

Added links:
+ → [[consistency-over-intensity]] (supports)
+ → [[habit-stacking]] (applies)
+ ← [[atomic-habits-literature]] (sources)

Skipped:
- [[investment-principles]] (too tangential)

Updated MOCs:
+ Added to [[productivity-moc]]

Stats:
- Outgoing links: 2 → 5
- Incoming links: 1 → 2
- Connected notes: 3 → 7
```

## Error Handling

**If note not found**:
```
Could not find note matching "compound habits"

Did you mean:
1. compound-effect-habits.md
2. habit-formation.md
3. compound-interest.md

Or search for something else?
```

**If no connections found**:
```
No obvious connections found for [[niche-topic]]

This note might be:
1. Too specialized - consider broader connections
2. In a new area - create related notes first
3. Needing different keywords - try synonyms

Suggestions:
- Create a MOC for this new topic
- Write 2-3 related notes to build a cluster
- Review if this note is truly atomic
```
