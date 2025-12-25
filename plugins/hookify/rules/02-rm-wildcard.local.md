---
name: block-rm-wildcard
enabled: true
event: bash
pattern: rm\s+.*\/\*$
action: block
---

**Suppression wildcard bloquée**

La commande `rm /*` ou `rm path/*` supprime tous les fichiers d'un répertoire.

Alternatives :
- Lister d'abord : `ls path/*`
- Supprimer fichier par fichier
- Utiliser `rm -i` pour confirmation
