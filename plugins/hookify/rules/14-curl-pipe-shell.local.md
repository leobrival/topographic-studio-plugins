---
name: block-curl-pipe-shell
enabled: true
event: bash
pattern: curl.*\|\s*(sh|bash)
action: block
---

**Exécution distante bloquée : curl | sh**

Télécharger et exécuter du code directement depuis Internet est extrêmement dangereux.

Alternatives sécurisées :
1. Télécharger le script : `curl -O url/script.sh`
2. Inspecter le contenu : `cat script.sh`
3. Exécuter après vérification : `bash script.sh`
