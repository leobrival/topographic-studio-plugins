---
name: block-rm-force-wildcard
enabled: true
event: bash
pattern: rm\s+-f.*\/\*$
action: block
---

**Suppression forcée wildcard bloquée**

La commande `rm -f /*` force la suppression sans confirmation.

Cette opération est irréversible et potentiellement catastrophique.
