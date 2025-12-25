---
name: block-chmod-system
enabled: true
event: bash
pattern: chmod\s+\+x\s+\/usr
action: block
---

**Modification permissions système bloquée**

Modifier les permissions dans `/usr` peut compromettre la sécurité du système.

Les fichiers système ne doivent pas être modifiés par des scripts automatisés.
