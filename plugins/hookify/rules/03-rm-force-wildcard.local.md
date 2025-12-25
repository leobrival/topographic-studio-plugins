---
name: block-rm-force-wildcard
enabled: true
event: bash
pattern: rm\s+-f.*\/\*$
action: block
---

**Forced wildcard deletion blocked**

The command `rm -f /*` forces deletion without confirmation.

This operation is irreversible and potentially catastrophic.
