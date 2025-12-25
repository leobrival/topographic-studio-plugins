---
name: block-chown-root
enabled: true
event: bash
pattern: chown\s+root
action: block
---

**Changement propriétaire root bloqué**

Transférer la propriété à root peut rendre des fichiers inaccessibles et créer des failles de sécurité.

Exécutez manuellement si nécessaire.
