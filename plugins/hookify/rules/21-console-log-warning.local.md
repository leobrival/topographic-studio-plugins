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

**console.log détecté**

Les `console.log` devraient être retirés avant la mise en production.

Alternatives :
- Utiliser un logger structuré (pino, winston)
- Supprimer avant commit
- Utiliser des breakpoints pour le debug
