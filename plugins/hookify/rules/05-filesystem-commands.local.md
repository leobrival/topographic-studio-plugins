---
name: block-mkfs
enabled: true
event: bash
pattern: mkfs\.
action: block
---

**Filesystem creation blocked: mkfs**

Commands `mkfs.*` format partitions and erase all data.

Irreversible operation - run manually with confirmation.
