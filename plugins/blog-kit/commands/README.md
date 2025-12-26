# Commands

Slash commands for blog article generation.

## Available Commands

### Setup & Generation

- **`/blog-setup`** - Interactive setup wizard for blog constitution (new blog)
- **`/blog-analyse`** - Analyze existing content to generate constitution (existing blog)
- **`/blog-generate`** - Complete article workflow (research → SEO → marketing)

### Individual Phases

- **`/blog-research`** - Research phase only
- **`/blog-seo`** - SEO optimization phase only (traditional search)
- **`/blog-geo`** - GEO optimization phase only (AI search: ChatGPT, Perplexity, etc.)
- **`/blog-marketing`** - Content creation phase only
- **`/blog-copywrite`** - Spec-driven copywriting (brand voice focus)

### Quality & Validation

- **`/blog-optimize`** - Quality validation (frontmatter, markdown, SEO)
- **`/blog-optimize-images`** - Image optimization (compression, WebP conversion)

### Translation & i18n

- **`/blog-translate`** - i18n structure validation and article translation

## Quick Reference

| Command | Input | Output | Time | Use When |
|---------|-------|--------|------|----------|
| `/blog-setup` | - | `.spec/blog.spec.json` | 2 min | First time setup (new blog) |
| `/blog-analyse` | - or content dir | `.spec/blog.spec.json` | 10-15 min | Existing blog, reverse-engineer constitution |
| `/blog-generate` | Topic | Full article | 30-45 min | New article, complete workflow |
| `/blog-research` | Topic | Research report | 15-20 min | Need research only |
| `/blog-seo` | Topic | SEO brief | 5-10 min | Traditional search optimization |
| `/blog-geo` | Topic | GEO brief | 10-15 min | AI search optimization (ChatGPT, Perplexity) |
| `/blog-marketing` | Topic | Article (conversion-focused) | 10-15 min | Marketing content |
| `/blog-copywrite` | Topic | Article (spec-driven) | 20-40 min | Brand-perfect copy |
| `/blog-optimize` | Topic | Validation report | 10-15 min | Quality check |
| `/blog-optimize-images` | lang/slug | Optimized images (WebP) | 10-20 min | Image compression |
| `/blog-translate` | - or lang/slug + target | Coverage report or translation | 2-20 min | i18n validation or translation |

## Workflows

### New Blog Setup
```bash
/blog-setup                    # Create constitution from scratch
/blog-generate "Your Topic"    # Generate first article
```

### Existing Blog Adoption
```bash
/blog-analyse                  # Analyze existing content → generate constitution
# Review .spec/blog.spec.json
/blog-generate "New Topic"     # Generate new article with detected style
```

### Full Article Generation (Marketing Focus)
```bash
/blog-setup                    # One-time (or /blog-analyse for existing)
/blog-generate "Your Topic"    # Complete workflow
```

### Spec-Driven Article (Brand Focus)
```bash
/blog-setup                    # One-time
/blog-research "Your Topic"
/blog-seo "Your Topic"
/blog-copywrite "Your Topic"   # Use copywriter instead of marketing
/blog-optimize "Your Topic"    # Validate
```

### AI Search Optimized Article (SEO + GEO)
```bash
/blog-setup                    # One-time
/blog-research "Your Topic"
/blog-seo "Your Topic"         # Traditional search optimization
/blog-geo "Your Topic"         # AI search optimization (ChatGPT, Perplexity)
/blog-marketing "Your Topic"   # Marketing agent uses BOTH briefs
/blog-optimize "Your Topic"    # Validate
```

**Result**: Content optimized for BOTH traditional search engines (Google/Bing) AND AI assistants (ChatGPT, Perplexity, Google AI Overviews).

### Rewrite Existing Content
```bash
/blog-copywrite "existing-topic"  # Rewrite for brand compliance
/blog-optimize "existing-topic"   # Validate quality
```

### Article with Images
```bash
/blog-marketing "en/my-topic"            # Create article
# Add images to articles/en/my-topic/images/.backup/
/blog-optimize-images "en/my-topic"      # Optimize images (WebP)
/blog-optimize "en/my-topic"             # Validate quality
```

### Multi-Language Article
```bash
/blog-copywrite "en/nodejs-logging"      # Create English version
/blog-optimize "en/nodejs-logging"       # Validate
/blog-translate                          # Check coverage (shows missing)
/blog-translate "en/nodejs-logging" "fr" # Translate to French
/blog-translate "en/nodejs-logging" "es" # Translate to Spanish
/blog-translate                          # Verify 100% coverage
```

Each command file contains detailed instructions for Claude Code agents.
