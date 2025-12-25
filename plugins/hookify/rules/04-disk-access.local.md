---
name: block-dd-command
enabled: true
event: bash
pattern: dd\s+if=
action: block
---

**Accès disque direct bloqué : dd**

La commande `dd` permet l'écriture directe sur les disques et peut écraser des données système.

Exécutez manuellement si nécessaire avec les privilèges appropriés.
