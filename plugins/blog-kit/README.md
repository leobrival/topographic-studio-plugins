# Blog Kit

AI-powered blog article generation with specialized Claude Code agents.

## Installation

### Quick Install

```bash
# 1. Add plugin to marketplace
/plugin marketplace add https://github.com/leobrival/blog-kit.git

# 2. Install the plugin
/plugin install blog-kit
```

### Detailed Installation Guide

For complete installation instructions, troubleshooting, and verification steps, see [INSTALL.md](./INSTALL.md).

**What's included**:
- ✅ 12 slash commands (`/blog-*`)
- ✅ 9 specialized agents
- ✅ JSON template system (3 templates, 8 components)
- ✅ Persona system (Jobs-to-be-Done, Forces of Progress)
- ✅ Complete documentation

## Quick Start

```bash
# 1. Setup or analyze existing content
/blog-setup                    # New blog (manual setup)
/blog-analyse                  # Existing blog (auto-detect)

# 2. Generate your first article
/blog-generate "Your article topic"
```

## Usage Examples

### Per-Article Commands (Recommended)

Work on a specific article by providing the slug:

```bash
# Single article optimization
/blog-optimize "en/nodejs-logging"

# Single article translation
/blog-translate "en/nodejs-logging" "fr"

# Single article image optimization
/blog-optimize-images "en/nodejs-logging"
```

**Token usage**: ~5k-15k tokens per article

### Global Commands (⚠️  High Token Usage)

Apply command to ALL articles in your blog:

```bash
# ⚠️  WARNING: This will analyze ALL articles (can use 50k-500k tokens)
/blog-optimize

# ⚠️  WARNING: This will validate translation coverage for ALL articles
/blog-translate

# ⚠️  WARNING: This will optimize images in ALL articles
/blog-optimize-images
```

**Token usage**: 50k-500k tokens depending on article count
**Cost**: Can be expensive if you have many articles
**Use case**: Initial setup, bulk operations, CI/CD pipelines

### Batch Commands (Controlled)

Process specific articles efficiently:

```bash
# Optimize multiple specific articles
/blog-optimize "en/article-1"
/blog-optimize "en/article-2"
/blog-optimize "fr/article-3"

# Translate specific articles to multiple languages
/blog-translate "en/microservices" "fr"
/blog-translate "en/microservices" "es"
/blog-translate "en/microservices" "de"
```

**Recommendation**: Process articles individually or in small batches to control token usage and costs.

## Features

- **100% Action-Oriented Agents**: Every agent produces actionable content (drafts, briefs, or final articles)
- **Behavioral Personas**: Jobs-to-be-Done, Forces of Progress, Customer Awareness frameworks for audience targeting
- **Multi-agent workflow**: Research (→ draft) → SEO/GEO (→ briefs) → Marketing (→ article) → Quality (→ auto-fix)
- **Automatic Draft Generation**: Research agent now generates article drafts, not just reports
- **Auto-Fix Quality Issues**: Quality optimizer automatically corrects detected problems
- **Batch Content Updates**: Analyzer updates all existing articles with missing metadata
- **JSON-based templates**: ShadCN-inspired template system with strict validation
- **Template library**: Tutorial, Guide, Comparison templates with GEO components
- **Hierarchical configuration**: 5-level cascade (global → template → language → category → article)
- **Context optimization**: 99.5% token efficiency
- **File-based handoffs**: Zero context pollution
- **User checkpoints**: Review at each phase
- **Pure plugin**: No dependencies, scripts are local utilities only
- **Internationalization**: Multi-language article structure with automated translation
- **Translation validation**: Automated i18n coverage reports and missing translation detection
- **Image optimization**: Automated WebP conversion (80% quality)
- **GEO optimization**: AI search optimization (ChatGPT, Perplexity, Google AI Overviews)
- **Post Types & Funnel Stages**: Content adapts to 4 post types (actionnable/aspirationnel/analytique/anthropologique) and 3 funnel stages (TOFU/MOFU/BOFU)

## Commands

| Command | Description | Output | Time |
|---------|-------------|--------|------|
| `/blog-setup` | Setup wizard | `.spec/blog.spec.json` | 2 min |
| `/blog-analyse` | Analyze + **batch update articles** ✅ | Constitution + updated articles | 10-15 min |
| `/blog-personas` | **Create audience personas** ✅ | Persona JSON + targeting guide | 15-30 min |
| `/blog-generate` | Full workflow (draft → brief → article) | Draft + article ✅ | 30-45 min |
| `/blog-research` | Research + **generate draft** ✅ | Article draft | 15-20 min |
| `/blog-seo` | SEO optimization + **generate brief** ✅ | SEO brief | 5-10 min |
| `/blog-geo` | GEO optimization + **generate brief** ✅ | GEO brief | 10-15 min |
| `/blog-marketing` | **Generate final article** ✅ | Final article | 10-15 min |
| `/blog-copywrite` | Spec-driven **article generation** ✅ | Compliant article | 20-40 min |
| `/blog-optimize` | Validation + **auto-fix** ✅ | Corrected article | 10-15 min |
| `/blog-optimize-images` | **Image compression** ✅ | WebP images | 10-20 min |
| `/blog-translate` | i18n validation + **translation** ✅ | Translated article | 2-20 min |

## What's Included in the Plugin

When you install this plugin, you get:

✅ **Commands** (`commands/*.md`) - Slash command workflows
✅ **Agents** (`agents/*.md`) - AI agent definitions
✅ **Plugin Config** (`.claude-plugin/`) - Metadata

**Note**: Scripts in `scripts/` are local development utilities and are NOT transferred via the plugin. They're only used for local validation and setup.

## Architecture (100% ACTION-Oriented)

```
.templates/                → JSON-based template system
├── registry.json         → Master template & component registry
├── schemas/              → JSON Schema validation (6 files)
├── types/                → Article templates (tutorial, guide, comparison)
└── components/           → Content components (quotation, statistic, code-block, etc.)

.spec/                    → Blog constitution & personas (auto-generated ✅)
├── blog.spec.json        → Complete blog configuration
└── personas/             → Audience personas ✅ NEW
    ├── schema.json       → Persona validation schema
    ├── registry.json     → Persona catalog
    └── *.json            → Individual persona files

.specify/                 → Generated artifacts (100% ACTIONABLE)
├── research/             → Research reports (analysis + draft generation ✅)
├── seo/                  → SEO briefs ✅ (actionable structure)
├── geo/                  → GEO briefs ✅ (AI search optimization)
├── quality/              → Auto-fix changelogs ✅ (what was corrected)
└── personas/             → Persona reports & targeting guides ✅ NEW

articles/                 → Final articles (i18n structure) + DRAFTS ✅
├── en/                   → English articles
│   ├── tutorials/        → Category-specific articles
│   │   ├── .category.json  → Category configuration (auto-updated ✅)
│   │   └── slug/
│   │       ├── article.md  → Final article ✅
│   │       └── images/
│   ├── nodejs-tracing-draft.md  → Research draft ✅
│   └── comparisons/
│       └── .category.json
└── fr/                   → French articles (translated ✅)
    └── tutorials/
        └── .category.json
```

**Key Difference**: Every agent produces content you can use immediately (drafts, articles, briefs, corrections, or personas).

## Template System

Blog Kit includes a JSON-based template system inspired by ShadCN's component architecture:

### Available Templates

- **Tutorial** (2000-3500 words): Step-by-step technical tutorials with code examples
- **Guide** (3000-5000 words): Comprehensive topic coverage with expert insights
- **Comparison** (1500-2500 words): Feature-by-feature tool/framework comparisons

### GEO-Optimized Components

Based on Princeton University research (30-40% visibility improvement):

- **Quotation**: Expert quotes with source attribution (115% boost)
- **Statistic**: Data points with credible sources
- **Citation**: External source references (115% boost)
- **Code Block**: Syntax-highlighted examples
- **Comparison Table**: Feature comparison grids
- **Callout**: Note/tip/warning boxes
- **FAQ Item**: Question and answer pairs
- **Pros & Cons**: Advantages and disadvantages lists

### Configuration Cascade

Templates support 5-level configuration inheritance:

1. **Global** (`.spec/blog.spec.json`) - Blog-wide constitution
2. **Template** (`.templates/types/*.json`) - Template defaults
3. **Language** (`articles/{lang}/.language.json`) - Language-specific settings
4. **Category** (`articles/{lang}/{category}/.category.json`) - Category rules
5. **Article** (`articles/{lang}/{category}/{slug}/article.json`) - Article-specific overrides

**Inheritance**: Lower levels override higher levels. Arrays merge (no duplicates), objects deep-merge.

### Creating Custom Templates

Users can create their own templates and categories. See [`.templates/README.md`](./.templates/README.md) for complete documentation.

## Documentation

- [`.templates/`](./.templates/) - JSON template system (schemas, templates, components)
- [`commands/`](./commands/) - Slash command definitions
- [`agents/`](./agents/) - AI agent specifications
- [`scripts/`](./scripts/) - Local bash utilities (not in plugin)
- [`CLAUDE.md`](./CLAUDE.md) - Context management guide
- [`docs/MULTIPLE-CLAUDE-FILES.md`](./docs/MULTIPLE-CLAUDE-FILES.md) - Using hierarchical CLAUDE.md files

## Philosophy

"Burn tokens in workers, preserve main thread" + **"Every agent produces actionable output"**

- **100% Action-Oriented**: All agents generate content (drafts, briefs, articles, corrections)
- Agents process 50k-150k tokens each (isolated)
- Main thread uses <1k tokens (orchestration)
- File-based handoffs (no context accumulation)
- **No dead-end analysis**: Every artifact is usable in the workflow

## License

MIT
