---
name: warn-etc-passwd
enabled: true
event: bash
pattern: \/etc\/passwd
action: warn
---

**Passwd file access detected**

The `/etc/passwd` file contains user account information.

Verify that this access is intentional and legitimate.
