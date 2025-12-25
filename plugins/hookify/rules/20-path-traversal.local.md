---
name: warn-path-traversal
enabled: true
event: bash
pattern: \.\.\/
action: warn
---

**Traversée de chemin détectée**

Les séquences `../` peuvent être utilisées pour accéder à des répertoires parents non autorisés.

Vérifiez que le chemin cible est bien celui attendu.
