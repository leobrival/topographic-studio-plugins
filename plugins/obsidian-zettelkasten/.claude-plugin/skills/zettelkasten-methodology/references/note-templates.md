# Note Templates

Ready-to-use templates for all Zettelkasten note types.

## Permanent Note Template

```markdown
---
id: "{{date:YYYYMMDDHHmm}}"
title: "{{title}}"
aliases: []
created: {{date:YYYY-MM-DDTHH:mm:ss}}
modified: {{date:YYYY-MM-DDTHH:mm:ss}}
type: permanent
tags: []
status: seedling
---

# {{title}}

<!-- Write ONE atomic idea in your own words -->

{{content}}

---

## Connections

<!-- Link with context: why does this connect? -->

- Related to [[]] because...
- Supports [[]] in that...
- Contrasts with [[]] regarding...

## Sources

<!-- If derived from a source -->

- From: [[literature-note-title]]

## Questions

<!-- Open questions this raises -->

-
```

## Literature Note Template

```markdown
---
id: "{{date:YYYYMMDDHHmm}}"
title: "Notes on {{source_title}}"
aliases:
  - "{{author}} {{year}}"
created: {{date:YYYY-MM-DDTHH:mm:ss}}
modified: {{date:YYYY-MM-DDTHH:mm:ss}}
type: literature
tags:
  - literature-note
  - {{source_type}}
source:
  title: "{{source_title}}"
  author: "{{author}}"
  year: {{year}}
  type: {{book|article|video|podcast|paper}}
  url: ""
status: seedling
---

# Notes on {{source_title}}

**Source**: {{author}} ({{year}}). _{{source_title}}_

## Summary

<!-- 2-3 sentence overview of the source -->

## Key Ideas

### {{Idea 1}}

<!-- In your own words -->

- Relates to [[existing-note]]
- Potential permanent note: {{topic}}

### {{Idea 2}}

<!-- In your own words -->

### {{Idea 3}}

<!-- In your own words -->

## Notable Quotes

> "Exact quote" (p. {{page}})

_My interpretation_:

## Permanent Notes Created

- [ ] [[]] from idea 1
- [ ] [[]] from idea 2

## Questions Raised

-

## Related Sources

- [[other-literature-note]]
```

## Fleeting Note Template

```markdown
---
id: "{{date:YYYYMMDDHHmm}}"
title: "{{brief_title}}"
created: {{date:YYYY-MM-DDTHH:mm:ss}}
type: fleeting
tags:
  - fleeting
  - to-process
process_by: {{date+2d:YYYY-MM-DD}}
---

# {{brief_title}}

<!-- Quick capture - don't overthink -->

{{idea}}

## Context

<!-- When/where did this come up? -->

## Potential Connections

<!-- Quick guesses - verify later -->

- Maybe [[]]?

---

**Status**: Unprocessed
**Process by**: {{date+2d:YYYY-MM-DD}}
```

## MOC Template

```markdown
---
id: "{{date:YYYYMMDDHHmm}}"
title: "{{topic}} MOC"
aliases:
  - "{{topic}} Map"
  - "{{topic}} Index"
created: {{date:YYYY-MM-DDTHH:mm:ss}}
modified: {{date:YYYY-MM-DDTHH:mm:ss}}
type: moc
tags:
  - moc
  - {{topic_tag}}
---

# {{topic}} Map of Content

<!-- Brief overview: what is this topic about? -->

## Overview

{{overview}}

---

## Foundations

<!-- Core concepts to understand first -->

- [[foundational-note]] - why it matters

## Core Ideas

### {{Subtopic 1}}

- [[note-1]] - brief context
- [[note-2]] - brief context

### {{Subtopic 2}}

- [[note-3]] - brief context

## Advanced Topics

- [[advanced-note]] - for deeper exploration

---

## Entry Points

**New to this topic?** Start here:
1. [[intro-note]]
2. [[key-concept-note]]

**Looking for practical application?**
- [[application-note]]

---

## Open Questions

<!-- What's still unclear or unexplored? -->

-

## Related MOCs

- [[parent-moc]]
- [[sibling-moc]]

---

## Dataview Query

```dataview
TABLE status, file.mtime as "Modified"
FROM [[]]
WHERE type = "permanent"
SORT file.mtime DESC
```
```

## Daily Note Template (for Zettelkasten workflow)

```markdown
---
created: {{date:YYYY-MM-DDTHH:mm:ss}}
type: daily
tags:
  - daily
---

# {{date:dddd, MMMM Do YYYY}}

## Inbox Review

<!-- Process fleeting notes from yesterday -->

```dataview
LIST
FROM #fleeting
WHERE process_by <= date(today)
```

## Today's Captures

### Ideas

-

### Quotes

-

### Questions

-

## Notes Created

- [ ] Created [[]]
- [ ] Linked to [[]]

## Tomorrow

- [ ] Process:
```

## Project Note Template

```markdown
---
id: "{{date:YYYYMMDDHHmm}}"
title: "Project: {{project_name}}"
created: {{date:YYYY-MM-DDTHH:mm:ss}}
modified: {{date:YYYY-MM-DDTHH:mm:ss}}
type: project
tags:
  - project
  - {{project_tag}}
status: active
---

# Project: {{project_name}}

## Objective

<!-- What are you trying to accomplish? -->

## Key Questions

1.
2.
3.

## Relevant Notes

<!-- Notes that inform this project -->

- [[note-1]] - how it applies
- [[note-2]] - how it applies

## Progress Log

### {{date:YYYY-MM-DD}}

-

## Outputs

- [ ] Deliverable 1
- [ ] Deliverable 2

## Next Actions

- [ ]
```

## Question Note Template

```markdown
---
id: "{{date:YYYYMMDDHHmm}}"
title: "Q: {{question}}"
created: {{date:YYYY-MM-DDTHH:mm:ss}}
type: question
tags:
  - question
  - {{topic}}
status: open
---

# {{question}}

## Context

<!-- Why is this question important? -->

## Current Understanding

<!-- What do I think I know? -->

## Related Notes

- [[related-note]] - what it suggests

## Research Needed

- [ ] Read about X
- [ ] Explore Y

## Attempts at Answer

### Attempt 1 ({{date}})

---

**Status**: Open | Partially Answered | Answered
```

## Templater Syntax Notes

For Obsidian Templater plugin:

- `{{date:format}}` - Current date/time
- `{{date+2d:format}}` - Date + 2 days
- `{{title}}` - Note title
- `<% tp.file.cursor() %>` - Cursor position

Replace `{{}}` with Templater's `<% %>` syntax for dynamic templates.
