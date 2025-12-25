---
name: block-system-binary-write
enabled: true
event: bash
pattern: \/usr\/bin\/.*\s+>
action: block
---

**System binary modification blocked**

Writing to `/usr/bin/` can corrupt essential system tools.

System binaries should never be modified by scripts.
