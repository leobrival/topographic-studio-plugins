---
name: warn-debugger
enabled: true
event: file
tool_matcher: Edit|Write
conditions:
  - field: content
    operator: contains
    pattern: debugger
action: warn
---

**Statement debugger détecté**

Le mot-clé `debugger` ne doit pas être présent en production.

Supprimez-le avant de commit.
