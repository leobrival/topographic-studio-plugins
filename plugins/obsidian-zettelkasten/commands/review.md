---
description: Review and refine notes - process fleeting notes, improve seedlings, check for orphans
argument-hint: "[--fleeting] [--seedlings] [--orphans] [--all]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "AskUserQuestion", "Skill", "TodoWrite"]
---

# Review and Refine Notes

Process fleeting notes, upgrade seedlings to evergreen, and maintain vault health.

**FIRST**: Load the `obsidian-zettelkasten:zettelkasten-methodology` skill for methodology reference.

## Your Task

Review notes based on: `$ARGUMENTS`

## Review Modes

Parse `$ARGUMENTS`:

1. **--fleeting**: Process fleeting notes (default if no args)
2. **--seedlings**: Review and upgrade seedling notes
3. **--orphans**: Find and connect isolated notes
4. **--all**: Complete vault review
5. **No args**: Default to fleeting notes review

## Workflow

### Mode 1: Process Fleeting Notes (Default)

**Input**: `/review` or `/review --fleeting`

#### Step 1: Find fleeting notes

```bash
# Find all fleeting notes
ls vault/0-inbox/*.md
grep -l "type: fleeting" vault/**/*.md
```

Or Dataview:
```dataview
LIST
FROM #fleeting
SORT file.ctime ASC
```

#### Step 2: Present queue

```
Fleeting Notes to Process: 7

Overdue (past process_by date):
1. 202312100930-fleeting-sleep-decisions.md (5 days overdue)
   "Connection between sleep and decisions"

2. 202312110845-fleeting-boredom-creativity.md (4 days overdue)
   "Boredom leads to creativity"

Due today:
3. 202312150800-fleeting-compound-learning.md
   "Learning compounds like interest"

Future:
4. 202312151200-fleeting-quick-idea.md (due tomorrow)
   "Quick thought about X"

Start processing? (1 / all / skip overdue)
```

#### Step 3: Process each note

For each fleeting note:

1. **Read the note**:
   ```
   Current note: sleep-decisions.md

   Content:
   "Connection between sleep quality and decision making.
   Maybe the prefrontal cortex is affected by sleep deprivation?"

   Context: Thought during morning commute
   ```

2. **Determine action**:
   ```
   Options for this fleeting note:

   1. Transform to permanent note
      - Create atomic Zettel with /zettel
      - This seems substantial enough

   2. Transform to literature note
      - If this came from a source
      - Needs source attribution

   3. Merge with existing note
      - Found: [[decision-fatigue]] might cover this
      - Add as additional insight?

   4. Needs more research
      - Keep as fleeting, extend deadline
      - Add research questions

   5. Discard
      - Not valuable enough to keep
      - Archive or delete

   Choose action (1-5):
   ```

3. **Execute chosen action**:

   **If Transform to permanent**:
   - Guide through /zettel workflow
   - Delete or archive original fleeting

   **If Merge with existing**:
   - Show existing note
   - Add new insight as section
   - Delete fleeting

   **If Needs research**:
   - Extend process_by date
   - Add specific research questions
   - Keep as fleeting

   **If Discard**:
   - Confirm: "Delete or move to archive?"
   - Execute choice

#### Step 4: Summary

```
Fleeting Notes Processed: 5/7

Transformed:
+ [[sleep-quality-decisions]] (new permanent note)
+ [[boredom-creativity-link]] (new permanent note)

Merged:
+ Added insight to [[decision-fatigue]]

Extended:
! compound-learning.md (needs research, +7 days)

Discarded:
- quick-idea.md (archived)

Remaining: 2 fleeting notes
Next review suggested: 2023-12-17
```

### Mode 2: Review Seedlings

**Input**: `/review --seedlings`

#### Step 1: Find seedling notes

```bash
grep -l "status: seedling" vault/2-permanent/*.md
```

#### Step 2: Analyze each seedling

For each seedling, check:
- **Age**: How long has it been a seedling?
- **Links**: How many connections does it have?
- **Completeness**: Is the content thorough?
- **Quality**: Well-written and clear?

#### Step 3: Present seedlings for upgrade

```
Seedling Notes: 12 found

Ready for upgrade (5+ links, 30+ days old):
1. [[atomic-habits-core]] - 7 links, 45 days old
   Action: Upgrade to evergreen?

2. [[decision-fatigue]] - 6 links, 35 days old
   Action: Upgrade to evergreen?

Needs work (few links, mature enough):
3. [[time-blocking-method]] - 1 link, 60 days old
   Action: Find more connections? (/link)

4. [[pomodoro-technique]] - 2 links, 40 days old
   Action: Expand content or find links?

Still developing (recent):
5. [[compound-effect-habits]] - 3 links, 5 days old
   Action: Keep as seedling, check in 3 weeks

Review which notes? (1,2 / all ready / skip)
```

#### Step 4: Upgrade process

For each note to upgrade:

1. **Review content quality**:
   - Read the full note
   - Check for completeness
   - Verify it's atomic

2. **Review connections**:
   - Are links meaningful?
   - Missing obvious connections?

3. **Upgrade or improve**:
   ```
   Reviewing: atomic-habits-core.md

   Quality check:
   ✓ Atomic - single clear idea
   ✓ Autonomous - understandable alone
   ✓ Connected - 7 meaningful links
   ✓ Personal - written in your words
   ⚠ Minor: Could add one more supporting link

   Upgrade to evergreen? (y/n/improve first)
   ```

4. **If upgrading**:
   - Change `status: seedling` → `status: evergreen`
   - Update `modified` date
   - Optionally add "maturity note"

### Mode 3: Fix Orphans

**Input**: `/review --orphans`

#### Step 1: Find orphan notes

```bash
# Notes with no outgoing links
# Notes with no incoming links
# Notes not in any MOC
```

#### Step 2: Present orphans

```
Orphan Notes Found: 8

No outgoing links:
1. [[isolated-idea]] - Has 2 incoming, 0 outgoing
2. [[standalone-thought]] - Has 0 incoming, 0 outgoing

No incoming links:
3. [[unpopular-concept]] - Has 3 outgoing, 0 incoming
4. [[forgotten-note]] - Has 1 outgoing, 0 incoming

Not in any MOC:
5. [[uncategorized-note]] - Has links but no MOC

Process orphans? (all / 1,2,3 / skip)
```

#### Step 3: Fix each orphan

Use /link workflow for each:
- Find related notes
- Create connections
- Add to appropriate MOC

### Mode 4: Complete Vault Review

**Input**: `/review --all`

#### Comprehensive review:

```
Starting Complete Vault Review...

Phase 1: Fleeting Notes
- Found: 7 fleeting notes
- Overdue: 3
[Process fleeting notes...]

Phase 2: Seedling Notes
- Found: 12 seedlings
- Ready for upgrade: 4
- Needs attention: 3
[Review seedlings...]

Phase 3: Orphan Notes
- Orphans found: 8
- Recommended: Fix top 5
[Fix orphans...]

Phase 4: Vault Health Check
- Total notes: 127
- Average links: 3.2 per note
- MOC coverage: 78%
- Stale notes (180+ days no edit): 12

Report complete. See summary below.
```

## Vault Health Metrics

After any review, show health metrics:

```
Vault Health Report

Notes: 127 total
├── Permanent: 89 (70%)
├── Literature: 23 (18%)
├── MOC: 8 (6%)
└── Fleeting: 7 (6%)

Status Distribution:
├── Evergreen: 34 (38%)
├── Budding: 28 (31%)
└── Seedling: 27 (30%)

Connectivity:
├── Average links per note: 3.2
├── Orphan notes: 8 (9%)
├── Well-connected (5+ links): 23 (26%)
└── MOC coverage: 78%

Recommendations:
1. Process 3 overdue fleeting notes
2. Upgrade 4 ready seedlings
3. Connect 8 orphan notes
4. Review 12 stale notes

Run /review --all to address these.
```

## Daily Review Shortcut

For daily practice, suggest:

```
Quick Daily Review (5 min)

/review --fleeting

This processes:
- Overdue fleeting notes first
- Today's due notes
- Optionally: quick orphan check

Best time: Morning or end of day
```

## Error Handling

**If no notes to review**:
```
No notes need review right now!

Vault is healthy:
- 0 overdue fleeting notes
- 0 orphan notes
- All seedlings actively growing

Next suggested review: 2023-12-20
Keep capturing ideas with /fleeting!
```

**If too many notes**:
```
Found 50+ notes needing review.

Suggest focused approach:
1. Start with overdue fleeting (7 notes)
2. Then oldest seedlings (10 notes)
3. Defer orphans for weekend session

Process in batches? (start with fleeting / all at once)
```
