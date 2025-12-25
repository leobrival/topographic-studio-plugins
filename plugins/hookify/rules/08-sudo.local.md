---
name: block-sudo
enabled: true
event: bash
pattern: sudo\s+
action: block
---

**Privilege escalation blocked: sudo**

Commands with `sudo` run with administrator rights and can modify the system.

For security reasons, run these commands manually.
