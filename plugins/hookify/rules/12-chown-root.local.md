---
name: block-chown-root
enabled: true
event: bash
pattern: chown\s+root
action: block
---

**Root ownership change blocked**

Transferring ownership to root can make files inaccessible and create security vulnerabilities.

Run manually if needed.
