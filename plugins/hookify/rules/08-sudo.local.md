---
name: block-sudo
enabled: true
event: bash
pattern: sudo\s+
action: block
---

**Élévation de privilèges bloquée : sudo**

Les commandes `sudo` s'exécutent avec les droits administrateur et peuvent modifier le système.

Pour des raisons de sécurité, exécutez ces commandes manuellement.
