---
name: block-etc-shadow
enabled: true
event: bash
pattern: \/etc\/shadow
action: block
---

**Accès au fichier shadow bloqué**

Le fichier `/etc/shadow` contient les mots de passe hashés du système.

Cet accès est strictement interdit pour des raisons de sécurité.
