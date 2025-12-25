---
name: block-system-binary-write
enabled: true
event: bash
pattern: \/usr\/bin\/.*\s+>
action: block
---

**Modification binaire système bloquée**

L'écriture dans `/usr/bin/` peut corrompre les outils système essentiels.

Les binaires système ne doivent jamais être modifiés par des scripts.
