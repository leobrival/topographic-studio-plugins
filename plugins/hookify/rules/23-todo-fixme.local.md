---
name: warn-todo-fixme
enabled: true
event: file
tool_matcher: Edit|Write
conditions:
  - field: content
    operator: regex_match
    pattern: (TODO|FIXME|HACK|XXX):?
action: warn
---

**TODO/FIXME détecté**

Un commentaire TODO ou FIXME a été ajouté. Assurez-vous de le traiter avant la release.

Bonne pratique : créer une issue pour suivre les TODOs.
