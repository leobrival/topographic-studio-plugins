---
name: warn-path-traversal
enabled: true
event: bash
pattern: \.\.\/
action: warn
---

**Path traversal detected**

Sequences `../` can be used to access unauthorized parent directories.

Verify that the target path is the expected one.
