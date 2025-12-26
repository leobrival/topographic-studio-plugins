# Agents

Specialized AI agents for blog article generation.

## Available Agents

### Setup & Analysis (ACTION)

- **`analyzer.md`** - Content analyzer + **batch content updater** + constitution generator (reverse-engineering)
- **`persona-specialist.md`** - Audience persona creator using Jobs-to-be-Done, Forces of Progress, Customer Awareness frameworks

### Content Generation (100% ACTION)

- **`research-intelligence.md`** - Deep research with source validation + **generates article draft**
- **`seo-specialist.md`** - SEO optimization + **generates SEO brief** (traditional search engines)
- **`geo-specialist.md`** - GEO optimization + **generates GEO brief** (AI search: ChatGPT, Perplexity, Google AI Overviews)
- **`marketing-specialist.md`** - Conversion-focused content creation + **generates final article**
- **`copywriter.md`** - Spec-driven copywriting + **generates compliant article**

### Quality & Optimization (ACTION)

- **`quality-optimizer.md`** - Automated validation + **auto-fixes detected issues** (frontmatter, markdown, SEO, images)

### Translation & i18n

- **`translator.md`** - Multi-language translation with structure validation

## Agent Workflows

### Constitution Generation + Batch Update (ACTION)
```
Existing Content → Analyzer → Constitution + Updated Articles
  (sample 10)       (15k)       (config + content)

Phases:
1. Content Discovery (scan directories)
2. Language Detection (i18n or single)
3. Tone Analysis (expert/pédagogique/convivial/corporate)
4. Pattern Extraction (voice_do/voice_dont)
5. Constitution Generation (.spec/blog.spec.json)
6. Batch Content Update (NEW) - Updates all articles with missing metadata

Outputs:
- .spec/blog.spec.json ✅ Constitution
- .category.json files ✅ Per-category configs
- articles/**/*.md ✅ All articles updated with complete frontmatter
```

### Full Article Generation (100% ACTION)
```
Research → SEO → Marketing
  (draft)  (brief) (final article)

Outputs:
- articles/[topic]-draft.md      ✅ Research draft
- .specify/seo/[topic]-brief.md  ✅ SEO structure
- articles/[topic].md            ✅ Final article
```

### AI Search Optimized Generation
```
Research → SEO → GEO → Marketing
  (5k)     (2k)   (3k)    (3k tokens)

SEO Brief: Traditional search (Google/Bing)
GEO Brief: AI search (ChatGPT, Perplexity, Google AI Overviews)
Marketing: Merges BOTH briefs for comprehensive optimization
```

**GEO (Generative Engine Optimization)**:
- Based on Princeton Study (30-40% visibility improvement)
- Top 3 Methods: Cite sources, add quotations, include statistics
- E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
- Schema markup (near-essential for AI parsing)
- Content freshness (3.2x more citations for 30-day updates)

### Spec-Driven Copywriting
```
Constitution → Copywriter → Quality Check
  (spec)        (5k)          (validation)
```

### Quality Optimization (AUTO-FIX)
```
Article → Quality Optimizer → Auto-Corrected Article
           (validates + fixes)   (actionable output)

Outputs:
- articles/[topic].md (corrected version) ✅
- .specify/quality/[topic]-fixes.md (changelog)
```

### Translation & i18n
```
Structure Check → Translator → Coverage Report
                  (validation script in /tmp/)

Source Article → Translator → Translated Article
  (en)            (preserves technical accuracy)  (fr/es/de)
```

Each agent runs in isolated context with fresh token budget.

## Persona System (NEW)

Blog-Kit now includes comprehensive persona management for audience targeting:

### Persona Specialist Agent

Create behaviorally-validated personas using proven frameworks:

**Frameworks**:
- **Jobs-to-be-Done**: Why customers "hire" content (functional/emotional/social jobs)
- **Forces of Progress**: Push/Pull/Anxiety/Habit dynamics
- **Customer Awareness**: 5 stages (Unaware → Most Aware)
- **30 Elements of Value**: Top 5 value drivers per persona

**Persona Structure** (12 dimensions):
1. Basic Profile (name, age, profession, background)
2. Current Situation (state, feelings, influences, time spent)
3. Goals & Aspirations (dreams, life change, success vision)
4. Blockers (main blocker, sources, consequences, fears)
5. Jobs-to-be-Done (functional, emotional, social, context)
6. Forces of Progress (push, pull, anxiety, habit)
7. Awareness Stage (with specific moments)
8. Value Elements (top 5 priorities)
9. Behavioral Patterns (real actions, past spending)
10. Content Preferences (post types, funnel stages, tone)
11. Metadata (confidence, validation status)

**Outputs**:
- `.spec/personas/[id].json` - Complete persona profile
- `.spec/personas/registry.json` - Persona catalog
- `.specify/personas/[id]-report.md` - Targeting guide with article suggestions

**Integration with Blog Workflow**:
- Tag articles with `target_persona` in frontmatter
- Link categories to personas in `.category.json`
- Track performance by persona for validation
- Iterate content strategy per persona results

**Example Persona**: See `.spec/personas/example-developer-freelance.json`

### Persona Files

```
.spec/personas/
├── schema.json                        # Validation schema
├── registry.json                      # Persona catalog
├── example-developer-freelance.json   # Example (Alex Chen, 32, Freelance Dev)
└── [your-personas].json               # Your custom personas

.specify/personas/
├── [persona-id]-report.md             # Targeting guide
└── [persona-id]-validation.md         # Validation report
```

### Commands

- **`/blog-personas create`** - Create new persona with research
- **`/blog-personas list`** - Show all personas
- **`/blog-personas update`** - Update existing persona
- **`/blog-personas validate`** - Validate persona against schema & evidence
