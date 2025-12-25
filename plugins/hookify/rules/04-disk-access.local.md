---
name: block-dd-command
enabled: true
event: bash
pattern: dd\s+if=
action: block
---

**Direct disk access blocked: dd**

The `dd` command allows direct disk writing and can overwrite system data.

Run manually if needed with appropriate privileges.
