---
name: block-eval-exec
enabled: true
event: bash
pattern: (eval\s*\(|exec\s*\()
action: block
---

**Dynamic code execution blocked**

Functions `eval()` and `exec()` execute arbitrary code and are injection vectors.

Security risks:
- Code injection
- Uncontrolled execution
- Potential privilege escalation
