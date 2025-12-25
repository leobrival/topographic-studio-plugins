---
name: block-rm-wildcard
enabled: true
event: bash
pattern: rm\s+.*\/\*$
action: block
---

**Wildcard deletion blocked**

The command `rm /*` or `rm path/*` deletes all files in a directory.

Alternatives:
- List first: `ls path/*`
- Delete files one by one
- Use `rm -i` for confirmation
