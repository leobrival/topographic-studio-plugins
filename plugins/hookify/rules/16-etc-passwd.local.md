---
name: warn-etc-passwd
enabled: true
event: bash
pattern: \/etc\/passwd
action: warn
---

**Accès au fichier passwd détecté**

Le fichier `/etc/passwd` contient les informations des comptes utilisateurs.

Vérifiez que cet accès est intentionnel et légitime.
