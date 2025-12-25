---
name: block-eval-exec
enabled: true
event: bash
pattern: (eval\s*\(|exec\s*\()
action: block
---

**Exécution de code dynamique bloquée**

Les fonctions `eval()` et `exec()` exécutent du code arbitraire et sont vecteurs d'injection.

Risques de sécurité :
- Injection de code
- Exécution non contrôlée
- Escalade de privilèges potentielle
