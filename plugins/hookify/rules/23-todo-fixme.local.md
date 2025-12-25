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

**TODO/FIXME detected**

A TODO or FIXME comment was added. Make sure to address it before release.

Best practice: create an issue to track TODOs.
