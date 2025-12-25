---
name: block-wget-pipe-shell
enabled: true
event: bash
pattern: wget.*\|\s*(sh|bash)
action: block
---

**Exécution distante bloquée : wget | sh**

Télécharger et exécuter du code directement depuis Internet est extrêmement dangereux.

Alternatives sécurisées :
1. Télécharger le script : `wget url/script.sh`
2. Inspecter le contenu : `cat script.sh`
3. Exécuter après vérification : `bash script.sh`
