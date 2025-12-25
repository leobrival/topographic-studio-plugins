---
description: Language conventions for code, documentation, logs, and user interactions
---

# Language Conventions

Strict language rules for maintaining consistency across all project outputs.

## Language Matrix

| Context | Language | Examples |
|---------|----------|----------|
| Code | English | Variables, functions, classes, comments |
| Documentation | English | README, specs, API docs, commit messages |
| Logs | English | Error messages, debug output, system logs |
| User Interaction | French | Responses, explanations, status updates |

## Code Implementation (English Only)

All code must be written in English:

```typescript
// CORRECT
const userProfile = await fetchUserData(userId);
function calculateTotalPrice(items: CartItem[]): number { }
interface PaymentMethod { type: string; lastFour: string; }

// INCORRECT
const profilUtilisateur = await recupererDonnees(idUtilisateur);
function calculerPrixTotal(articles: ArticlePanier[]): number { }
```

**Includes:**

- Variable names, function names, class names
- Code comments and inline documentation
- Type definitions and interfaces
- Error messages in code
- Log statements

## Documentation (English Only)

All documentation must be written in English:

- README files
- Technical specifications
- API documentation
- Code comments
- Commit messages
- PR descriptions
- Changelog entries

**Commit Message Format:**

```bash
# CORRECT
git commit -m "Add user authentication with JWT tokens"
git commit -m "Fix pagination bug in product listing"

# INCORRECT
git commit -m "Ajouter authentification utilisateur avec JWT"
```

## Logs (English Only)

All log messages must be in English:

```typescript
// CORRECT
logger.info("User authentication successful", { userId });
logger.error("Failed to connect to database", { error });
logger.warn("Rate limit approaching threshold");

// INCORRECT
logger.info("Authentification réussie", { userId });
logger.error("Échec de connexion à la base de données");
```

## User Interactions (French Only)

All responses to the user must be in French:

- Explanations and answers
- Questions and clarifications
- Status updates and progress reports
- Error descriptions (user-facing)
- Suggestions and recommendations

**Example Response:**

```
User: "How do I add authentication?"

Response: "Pour ajouter l'authentification, je vais créer un middleware
qui vérifie les tokens JWT. Voici les étapes:
1. Créer le middleware d'authentification
2. Configurer les routes protégées
3. Ajouter la gestion des tokens..."
```

## Emoji Usage Policy

**Default behavior: Do NOT use emojis**

### Banned Contexts (Never use emojis)

- README files
- Technical documentation
- API documentation
- Code comments
- Commit messages
- PR descriptions
- Log messages
- Error messages
- Technical specifications

### Acceptable Contexts (Use sparingly)

- User-facing success/error notifications when explicitly helpful
- Interactive CLI prompts where visual cues enhance UX
- Status indicators in terminal output (only when necessary)

## Documentation Best Practices

Use native Markdown elements:

```markdown
# CORRECT - Native Markdown
## Heading
- List item
> Blockquote
`inline code`

# INCORRECT - HTML or special characters
<h2>Heading</h2>
• List item (custom bullet)
<blockquote>Quote</blockquote>
```

**Prefer:**

- Standard headings (`#`, `##`, `###`) over styled text
- Code blocks with language identifiers
- Native lists (`-`, `*`, `1.`) over custom bullets
- Blockquotes (`>`) over styled divs
- Markdown tables over HTML tables

## Quick Reference

```
Code/Docs/Logs → English
User Chat → French
Emojis → Avoid unless explicitly needed
Markdown → Use native syntax
```
