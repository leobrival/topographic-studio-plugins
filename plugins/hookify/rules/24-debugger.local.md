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

**Debugger statement detected**

The `debugger` keyword should not be present in production.

Remove it before committing.
