---
name: block-rm-rf
enabled: true
event: bash
pattern: rm\s+-rf
action: block
---

**Commande destructive bloquée : rm -rf**

Cette commande supprime récursivement et de force tous les fichiers.

Alternatives :
- `rm -ri` : suppression interactive avec confirmation
- `trash` : déplacer vers la corbeille
- Vérifier le chemin avec `ls` d'abord
