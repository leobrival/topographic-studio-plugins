---
name: block-etc-shadow
enabled: true
event: bash
pattern: \/etc\/shadow
action: block
---

**Shadow file access blocked**

The `/etc/shadow` file contains hashed system passwords.

This access is strictly forbidden for security reasons.
