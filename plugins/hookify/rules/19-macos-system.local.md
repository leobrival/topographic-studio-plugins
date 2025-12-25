---
name: warn-macos-system
enabled: true
event: bash
pattern: \/System\/
action: warn
---

**macOS system directory access detected**

The `/System/` directory contains critical macOS system files.

Verify that this access is necessary and intentional.
