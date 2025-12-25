---
name: block-rm-rf
enabled: true
event: bash
pattern: rm\s+-rf
action: block
---

**Destructive command blocked: rm -rf**

This command recursively and forcefully deletes all files.

Alternatives:
- `rm -ri`: interactive deletion with confirmation
- `trash`: move to trash bin
- Check the path with `ls` first
