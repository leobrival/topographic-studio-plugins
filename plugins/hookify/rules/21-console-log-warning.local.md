---
name: warn-console-log
enabled: true
event: file
tool_matcher: Edit|Write
conditions:
  - field: content
    operator: regex_match
    pattern: console\.log\s*\(
action: warn
---

**console.log detected**

`console.log` statements should be removed before production.

Alternatives:
- Use a structured logger (pino, winston)
- Remove before commit
- Use breakpoints for debugging
