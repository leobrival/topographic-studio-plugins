---
name: warn-macos-system
enabled: true
event: bash
pattern: \/System\/
action: warn
---

**Accès répertoire système macOS détecté**

Le répertoire `/System/` contient les fichiers système critiques de macOS.

Vérifiez que cet accès est nécessaire et intentionnel.
