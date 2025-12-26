# TOFU/MOFU/BOFU Framework - Quick Reference

## Overview

Le framework TOFU/MOFU/BOFU (Top/Middle/Bottom of Funnel) est maintenant intégré dans l'agent `marketing-specialist` pour adapter automatiquement le contenu au stade du parcours d'achat du lecteur.

## Les 3 Stages du Funnel

### TOFU - Top of Funnel (Awareness)

**Audience**: Découverte, conscients du problème mais pas des solutions

**Indicateurs de keywords**:
- "What is..."
- "How does... work"
- "Guide to..."
- "Introduction to..."

**Stratégie de contenu**:
- **Profondeur**: Surface-level, vue d'ensemble
- **Langage**: Simple, sans jargon, accessible aux débutants
- **Exemples**: Scénarios génériques, relatable
- **CTAs**: Ressources éducatives (guides, newsletters, whitepapers)
- **Social proof**: Statistiques industrie, données marché
- **Tone**: Accueillant, exploratoire, patient

**Exemples de CTAs**:
- Newsletter signup
- Free beginner's guide download
- Blog subscription
- Social media follow

### MOFU - Middle of Funnel (Consideration)

**Audience**: Évaluation des solutions, comparaison des options

**Indicateurs de keywords**:
- "Best practices for..."
- "How to choose..."
- "Comparison of..."
- "[Tool A] vs [Tool B]"

**Stratégie de contenu**:
- **Profondeur**: Modérée à profonde, analyse pros/cons
- **Langage**: Détails techniques équilibrés, explications quand nécessaire
- **Exemples**: Cas d'usage réels, scénarios comparatifs
- **CTAs**: Webinaires, démos produit, guides de comparaison, outils
- **Social proof**: Case studies, témoignages, benchmarks
- **Tone**: Consultatif, analytique, trustworthy

**Exemples de CTAs**:
- Comparison guide download
- Webinar registration
- Free trial (14 days)
- Assessment/quiz

### BOFU - Bottom of Funnel (Decision)

**Audience**: Prêts à agir, besoin de guidance d'implémentation

**Indicateurs de keywords**:
- "How to implement..."
- "Getting started with..."
- "[Specific Tool] tutorial"
- "Step-by-step setup..."

**Stratégie de contenu**:
- **Profondeur**: Comprehensive, focus sur l'implémentation
- **Langage**: Précision technique, assume connaissances de base
- **Exemples**: Workflows step-by-step, code, screenshots
- **CTAs**: Free trials, démos, consultations, support implémentation
- **Social proof**: ROI data, success metrics, customer stories
- **Tone**: Confiant, directif, action-oriented

**Exemples de CTAs**:
- Start free trial now
- Schedule implementation call
- Get setup checklist
- Talk to migration team

## Détection Automatique

L'agent marketing-specialist détecte automatiquement le stage via :

1. **Analyse des keywords primaires** (SEO brief)
2. **Type de template** (tutorial → BOFU, guide → MOFU, comparison → MOFU)
3. **Maturité de l'audience** (research report)
4. **Default à MOFU** si incertain (stage le plus versatile)

## Application dans l'Article

### Phase 1: Context Loading

L'agent identifie le funnel stage en analysant :
- Keywords et search intent du SEO brief
- Template type
- Target audience maturity

### Phase 2: Content Creation

Tous les éléments de contenu s'adaptent au stage :

| Élément | TOFU | MOFU | BOFU |
|---------|------|------|------|
| **Hook** | Problèmes larges, tendances | Pain points spécifiques | Défis d'implémentation |
| **Langage** | Simple, sans jargon | Technique équilibré | Précision technique |
| **Exemples** | Génériques | Comparatifs | Step-by-step |
| **CTAs** | Low commitment | Medium commitment | High commitment |
| **Social proof** | Stats industrie | Case studies | ROI data |
| **Profondeur** | Surface | Modérée-profonde | Comprehensive |

### Phase 3: Quality Check

Le checklist inclut maintenant 10 vérifications TOFU/MOFU/BOFU pour garantir l'alignement.

## Bénéfices

### Conversion Optimization
- **Alignement parfait** : CTAs adaptés au niveau de maturité
- **Moins de friction** : Le contenu correspond aux attentes du lecteur
- **Meilleur engagement** : Profondeur et tone appropriés

### SEO + Marketing Synergy
- **Search intent** mappe naturellement aux funnel stages
- **Maximise rankings ET conversions** simultanément
- **Évite le content mismatch** (BOFU CTA sur TOFU article = échec)

## Métadonnées Article

Nouveau champ frontmatter :

```yaml
---
title: "..."
funnelStage: "MOFU"  # TOFU/MOFU/BOFU
---
```

Les métriques incluent maintenant :
- **Funnel Stage**: TOFU/MOFU/BOFU
- **CTA Strategy**: Description des CTAs et justification selon le stage

## Exemples Concrets

### TOFU Article Example
**Topic**: "What is Observability?"
- **Hook**: "Modern applications are complex. How do you know what's happening inside?"
- **Depth**: Définitions, concepts de base, bénéfices généraux
- **CTA**: "Download our free observability starter guide"
- **Social proof**: "73% of companies report improved uptime with observability"

### MOFU Article Example
**Topic**: "Observability vs Monitoring: Which Should You Choose?"
- **Hook**: "You know you need visibility. But should you invest in monitoring or observability?"
- **Depth**: Feature comparison, use cases, pros/cons de chaque approche
- **CTA**: "Compare top observability tools in our buyer's guide"
- **Social proof**: "See how Acme Corp reduced MTTR by 60% with observability"

### BOFU Article Example
**Topic**: "How to Implement Distributed Tracing with OpenTelemetry"
- **Hook**: "You've chosen OpenTelemetry. Here's how to deploy it in production."
- **Depth**: Code examples, configuration steps, troubleshooting
- **CTA**: "Start your 14-day trial with pre-configured OpenTelemetry"
- **Social proof**: "Customers see ROI in 2 weeks with our implementation service"

## Règles d'Or

1. **Détection automatique**: L'agent identifie le stage sans intervention manuelle
2. **Application systématique**: Chaque décision de contenu s'adapte au stage
3. **Pas de forcing**: Rencontrer le lecteur où il est, pas le pousser dans un funnel
4. **Validation stricte**: Le quality checklist garantit l'alignement

## Références

- Marketing-specialist agent: `plugin/agents/marketing-specialist.md`
- Documentation principale: `CLAUDE.md`
- Examples: `examples/example-workflow.md` (à créer)

---

**Version**: 1.0
**Date**: 2025-10-20
**Intégration**: marketing-specialist agent (Phase 1, 2, 3)
