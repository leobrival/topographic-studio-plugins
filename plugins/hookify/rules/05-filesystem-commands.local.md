---
name: block-mkfs
enabled: true
event: bash
pattern: mkfs\.
action: block
---

**Création système de fichiers bloquée : mkfs**

Les commandes `mkfs.*` formatent les partitions et effacent toutes les données.

Opération irréversible - exécutez manuellement avec confirmation.
