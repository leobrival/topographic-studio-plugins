# Les 4 Types de Posts - Classification du Contenu

## Vue d'ensemble

Blog Kit utilise une classification en **4 types de posts** pour catégoriser le contenu selon sa nature et son objectif. Cette taxonomie aide à aligner le contenu avec les attentes de l'audience et optimiser l'engagement.

## Les 4 Types

### 1. Actionnable (How-To, Pratique)

**Objectif** : Fournir des instructions concrètes et applicables immédiatement

**Caractéristiques** :
- **Focus** : "Comment faire X"
- **Structure** : Étapes séquentielles, procédures claires
- **Ton** : Direct, impératif, pédagogique
- **Valeur** : Résultats tangibles, skills développés
- **Exemples** : Tutoriels, guides d'implémentation, recettes techniques

**Indicateurs de keywords** :
- "How to..."
- "Step-by-step guide to..."
- "Tutorial: ..."
- "Getting started with..."
- "Implementing..."
- "Setup..."

**Mapping TOFU/MOFU/BOFU** : Principalement **BOFU** (audience prête à agir)

**Template recommandé** : `tutorial`

**Exemples concrets** :
- "How to Deploy a Node.js App on Railway"
- "Setting Up Distributed Tracing with OpenTelemetry"
- "Building a REST API with Express.js: Step-by-Step"

**Composants typiques** :
- `code-block` (obligatoire, 3+ exemples)
- `callout` (warnings, tips)
- `pros-cons` (trade-offs techniques)

**Métriques de succès** :
- Taux de complétion élevé
- Temps sur page long (users suivent le tutorial)
- Taux de retour (bookmark pour référence future)

---

### 2. Aspirationnel (Inspirational, Visionnaire)

**Objectif** : Inspirer, motiver, présenter des possibilités futures ou des visions

**Caractéristiques** :
- **Focus** : "Ce que vous pourriez accomplir"
- **Structure** : Storytelling, narratives, case studies inspirants
- **Ton** : Motivant, optimiste, visionnaire
- **Valeur** : Inspiration, changement de perspective, ambition
- **Exemples** : Success stories, vision articles, trend predictions

**Indicateurs de keywords** :
- "The future of..."
- "Revolutionizing..."
- "How [Company] transformed..."
- "The next generation of..."
- "Why [Innovation] will change..."
- "Case study: ..."

**Mapping TOFU/MOFU/BOFU** : Principalement **TOFU/MOFU** (awareness et consideration)

**Template recommandé** : `guide` (long-form storytelling)

**Exemples concrets** :
- "The Future of Observability: AI-Powered Insights"
- "How Stripe Scaled to 100M Requests/Day"
- "The Next Generation of Developer Tools"

**Composants typiques** :
- `quotation` (expert visions, inspirational quotes)
- `statistic` (impressive growth numbers, impact data)
- `citation` (thought leaders, industry reports)

**Métriques de succès** :
- Partages sociaux élevés
- Temps de lecture complet
- Commentaires et discussions
- Brand recall

---

### 3. Analytique (Data-Driven, Research)

**Objectif** : Analyser, comparer, fournir des insights basés sur des données

**Caractéristiques** :
- **Focus** : "Qu'est-ce que les données révèlent"
- **Structure** : Hypothèse → Données → Analyse → Conclusions
- **Ton** : Objectif, factuel, rigoureux
- **Valeur** : Insights actionnables, décisions éclairées
- **Exemples** : Comparaisons, benchmarks, analyses de marché, études

**Indicateurs de keywords** :
- "[Tool A] vs [Tool B]"
- "Benchmark: ..."
- "Analysis of..."
- "Comparing..."
- "Performance review..."
- "Market research: ..."

**Mapping TOFU/MOFU/BOFU** : Principalement **MOFU** (evaluation et consideration)

**Template recommandé** : `comparison`

**Exemples concrets** :
- "PostgreSQL vs MySQL: Performance Benchmark 2025"
- "API Gateway Comparison: Kong vs Traefik vs NGINX"
- "The State of JavaScript Frameworks: 2025 Analysis"

**Composants typiques** :
- `comparison-table` (obligatoire)
- `statistic` (data points, benchmarks)
- `pros-cons` (balanced evaluation)
- `citation` (authoritative sources)

**Métriques de succès** :
- Taux de conversion décisionnelle (readers make a choice)
- Citations par d'autres blogs/sites
- Temps sur comparisons tables
- Click-through vers options comparées

---

### 4. Anthropologique (Behavioral, Cultural)

**Objectif** : Explorer les comportements humains, patterns culturels, dynamiques sociales

**Caractéristiques** :
- **Focus** : "Pourquoi les gens/équipes font X"
- **Structure** : Observation → Patterns → Interprétation → Implications
- **Ton** : Curieux, exploratoire, humaniste
- **Valeur** : Compréhension profonde, empathie, contexte social
- **Exemples** : Culture engineering, team dynamics, adoption patterns

**Indicateurs de keywords** :
- "Why developers..."
- "Understanding [team/culture] dynamics"
- "The psychology of..."
- "Developer culture..."
- "Team patterns..."
- "Adoption barriers of..."

**Mapping TOFU/MOFU/BOFU** : Principalement **TOFU/MOFU** (awareness et perspective)

**Template recommandé** : `guide` (deep exploration)

**Exemples concrets** :
- "Why Developers Resist Code Review: A Behavioral Analysis"
- "The Culture of Remote-First Engineering Teams"
- "Understanding Developer Burnout: Patterns and Solutions"

**Composants typiques** :
- `quotation` (developer testimonials, expert perspectives)
- `statistic` (survey results, behavioral data)
- `citation` (psychological research, cultural studies)

**Métriques de succès** :
- Discussions approfondies (comments)
- Partages avec contexte personnel
- Mentions dans discussions team/management
- Influence sur décisions culturelles

---

## Mapping avec Templates et TOFU/MOFU/BOFU

| Post Type | Templates | TOFU/MOFU/BOFU dominant | Engagement Type |
|-----------|-----------|-------------------------|-----------------|
| **Actionnable** | Tutorial | **BOFU** (80%) | Task completion |
| **Aspirationnel** | Guide | **TOFU** (50%), MOFU (40%) | Inspiration, sharing |
| **Analytique** | Comparison, Guide | **MOFU** (70%) | Decision-making |
| **Anthropologique** | Guide | **TOFU** (50%), MOFU (40%) | Reflection, discussion |

## Exemples de Catégories avec Post Types

### Catégorie: Tutorials → **Actionnable**
```json
{
  "category": {
    "id": "tutorials",
    "name": "Tutorials",
    "postType": "actionnable",
    "icon": ""
  }
}
```

### Catégorie: Case Studies → **Aspirationnel**
```json
{
  "category": {
    "id": "case-studies",
    "name": "Case Studies",
    "postType": "aspirationnel",
    "icon": ""
  }
}
```

### Catégorie: Comparisons → **Analytique**
```json
{
  "category": {
    "id": "comparisons",
    "name": "Comparisons",
    "postType": "analytique",
    "icon": "️"
  }
}
```

### Catégorie: Engineering Culture → **Anthropologique**
```json
{
  "category": {
    "id": "culture",
    "name": "Engineering Culture",
    "postType": "anthropologique",
    "icon": ""
  }
}
```

## Utilisation dans les Agents

### SEO Specialist
Le `postType` influence la stratégie SEO :

- **Actionnable** : Focus sur featured snippets (step-by-step)
- **Aspirationnel** : Emphasis sur social signals et shareability
- **Analytique** : Structured data pour comparisons, rich snippets
- **Anthropologique** : Long-tail keywords, question-based optimization

### Marketing Specialist
Le `postType` guide le tone et les CTAs :

- **Actionnable** :
  - Tone : Direct, instructif
  - CTAs : "Start building", "Get the code", "Download template"

- **Aspirationnel** :
  - Tone : Inspirant, motivant
  - CTAs : "See success stories", "Join our community", "Get inspired"

- **Analytique** :
  - Tone : Objectif, factuel
  - CTAs : "Compare options", "See full benchmark", "Download report"

- **Anthropologique** :
  - Tone : Exploratoire, empathique
  - CTAs : "Join the discussion", "Share your experience", "Learn more"

## Stratégie de Mix de Contenu

Pour un blog équilibré, recommandation de distribution :

- **40% Actionnable** : Foundation, traffic stable, SEO fort
- **20% Aspirationnel** : Brand building, social sharing, awareness
- **30% Analytique** : Lead nurturing, decision support, autorité
- **10% Anthropologique** : Thought leadership, community building

## Validation et Quality Check

Le `postType` est vérifié dans le quality-optimizer agent :

```markdown
 Post type matches category definition
 Content depth aligns with post type
 Tone matches post type requirements
 Components support post type objectives
 CTAs appropriate for post type
```

## Évolution et Extensions

### Post Types Additionnels (Future)
- **Investigatif** : Deep-dive investigations, root cause analysis
- **Polémique** : Opinion pieces, controversial takes
- **Ludique** : Gamified content, interactive experiences
- **Pédagogique** : Educational series, courses

### Post Type Hybrides
Certains articles peuvent combiner 2 types :
- **Actionnable + Analytique** : "Best practices comparison with implementation"
- **Aspirationnel + Anthropologique** : "Culture transformation case study"

## Références

- Category schema: `plugin/.templates/schemas/category.schema.json`
- Template README: `plugin/.templates/README.md`
- Marketing specialist: `plugin/agents/marketing-specialist.md`
- SEO specialist: `plugin/agents/seo-specialist.md`

---

**Version** : 1.0
**Date** : 2025-10-20
**Intégration** : Category schema, marketing-specialist agent
