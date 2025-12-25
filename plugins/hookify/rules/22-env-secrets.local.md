---
name: block-hardcoded-secrets
enabled: true
event: file
tool_matcher: Edit|Write
conditions:
  - field: file_path
    operator: not_contains
    pattern: .env
  - field: content
    operator: regex_match
    pattern: (API_KEY|SECRET|PASSWORD|TOKEN)\s*[=:]\s*["'][^"']{8,}["']
action: block
---

**Secret hardcodé détecté**

Ne jamais coder en dur des clés API, secrets, mots de passe ou tokens dans le code.

Utilisez des variables d'environnement :
- Créer un fichier `.env`
- Ajouter `.env` au `.gitignore`
- Charger avec `dotenv` ou équivalent
