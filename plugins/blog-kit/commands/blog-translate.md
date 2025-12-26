# Blog Translation & i18n Validation

Validate i18n structure consistency and translate articles across languages.

## Usage

### Validation Only (Structure Check)

```bash
/blog-translate
```

**What it does**:
- Scans `articles/` directory structure
- Validates against `.spec/blog.spec.json` languages
- Generates coverage report
- Identifies missing translations

**Output**: `/tmp/translation-report.md`

### Translate Specific Article

```bash
/blog-translate "source-lang/article-slug" "target-lang"
```

**Examples**:
```bash
# Translate English article to French
/blog-translate "en/nodejs-logging" "fr"

# Translate English to Spanish
/blog-translate "en/microservices-patterns" "es"

# Translate French to German
/blog-translate "fr/docker-basics" "de"
```

### Auto-Detect Source Language

```bash
/blog-translate "article-slug" "target-lang"
```

**Example**:
```bash
# Finds first available language for this slug
/blog-translate "nodejs-logging" "es"
```

## Prerequisites

 **Required**:
- `.spec/blog.spec.json` with languages configured
- Source article exists in source language
- Target language configured in constitution

**Language Configuration**:
```json
{
  "blog": {
    "languages": ["en", "fr", "es", "de"]
  }
}
```

## What This Command Does

### Mode 1: Structure Validation (No Arguments)

Delegates to **translator** agent (Phase 1 only):

1. **Load Constitution**: Extract configured languages
2. **Scan Structure**: Analyze `articles/` directory
3. **Generate Script**: Create validation script in `/tmp/`
4. **Execute Validation**: Run structure check
5. **Generate Report**: Coverage statistics + missing translations

**Time**: 2-5 minutes
**Output**: Detailed report showing language coverage

### Mode 2: Article Translation (With Arguments)

Delegates to **translator** agent (All Phases):

1. **Phase 1**: Validate structure + identify source
2. **Phase 2**: Load source article + extract context
3. **Phase 3**: Translate content preserving technical accuracy
4. **Phase 4**: Synchronize images
5. **Phase 5**: Validate + save translated article

**Time**: 10-20 minutes (depending on article length)
**Output**: Translated article in `articles/$TARGET_LANG/$SLUG/article.md`

## Instructions

Create a new subagent conversation with the `translator` agent.

### For Validation Only

**Provide the following prompt**:

```
You are validating the i18n structure for a multi-language blog.

**Task**: Structure validation only (Phase 1)

**Constitution**: .spec/blog.spec.json

Execute ONLY Phase 1 (Structure Analysis) from your instructions:

1. Load language configuration from .spec/blog.spec.json
2. Scan articles/ directory structure
3. Generate validation script in /tmp/validate-translations-$$.sh
4. Execute the validation script
5. Read and display /tmp/translation-report.md

**Important**:
- Generate ALL scripts in /tmp/ (non-destructive)
- Do NOT modify any article files
- Report coverage percentage
- List all missing translations

Display the complete translation report when finished.
```

### For Article Translation

**Provide the following prompt**:

```
You are translating a blog article from one language to another.

**Source Article**: articles/$SOURCE_LANG/$SLUG/article.md
**Target Language**: $TARGET_LANG
**Constitution**: .spec/blog.spec.json

Execute ALL phases (1-5) from your instructions:

**Phase 1**: Structure validation
- Verify source article exists
- Verify target language is configured
- Check if target already exists (backup if needed)

**Phase 2**: Translation preparation
- Load source article
- Extract frontmatter
- Identify technical terms to preserve
- Build translation context

**Phase 3**: Content translation
- Translate frontmatter (title, description, keywords)
- Translate headings (maintain H2/H3 structure)
- Translate body content
- Preserve code blocks unchanged
- Translate image alt text
- Add cross-language navigation links

**Phase 4**: Image synchronization
- Copy optimized images from source
- Copy .backup/ originals
- Verify all image references exist

**Phase 5**: Validation & output
- Save translated article to articles/$TARGET_LANG/$SLUG/article.md
- Generate translation summary
- Suggest next steps

**Translation Guidelines**:
- Preserve technical precision
- Keep code blocks identical
- Translate naturally (not literally)
- Maintain brand voice from constitution
- Adapt idioms culturally
- Update meta description (150-160 chars in target language)

**Important**:
- Create backup if target file exists
- Generate validation scripts in /tmp/
- Keep image filenames identical (don't translate)
- Translate image alt text for accessibility
- Add language navigation links (   )

Display translation summary when complete.
```

## Expected Output

### Validation Report

After structure validation:

```markdown
# Translation Coverage Report
Generated: 2025-01-12 15:30:00

 Language directory exists: en
 Language directory exists: fr
 Missing language directory: es

## Article Coverage

### nodejs-logging
-  **en**: 2,450 words
-  **fr**: 2,380 words
-  **es**: MISSING

### microservices-patterns
-  **en**: 3,200 words
-  **fr**: MISSING
-  **es**: MISSING

## Summary

- **Total unique articles**: 2
- **Languages configured**: 3
- **Expected articles**: 6
- **Existing articles**: 3
- **Coverage**: 50%

## Missing Translations

- Translate **nodejs-logging** from `en` → `es`
- Translate **microservices-patterns** from `en` → `fr`
- Translate **microservices-patterns** from `en` → `es`
```

### Translation Summary

After article translation:

```markdown
# Translation Summary

**Article**: nodejs-logging
**Source**: en
**Target**: fr
**Date**: 2025-01-12 15:45:00

## Statistics

- **Source word count**: 2,450
- **Target word count**: 2,380
- **Images copied**: 3
- **Code blocks**: 12
- **Headings**: 15 (5 H2, 10 H3)

## Files Created

-  articles/fr/nodejs-logging/article.md
-  articles/fr/nodejs-logging/images/ (3 WebP files)

## Next Steps

1. Review translation for accuracy
2. Run quality optimization: `/blog-optimize "fr/nodejs-logging"`
3. Optimize images if needed: `/blog-optimize-images "fr/nodejs-logging"`
4. Add cross-language links to source article

## Cross-Language Navigation

Add to source article (en):
```markdown
 [Lire en français](/fr/nodejs-logging)
```
```

## Validation Script Example

The agent generates `/tmp/validate-translations-$$.sh`:

```bash
#!/bin/bash

SPEC_FILE=".spec/blog.spec.json"
ARTICLES_DIR="articles"

# Extract supported languages from spec
LANGUAGES=$(jq -r '.blog.languages[]' "$SPEC_FILE")

# Initialize report
echo "# Translation Coverage Report" > /tmp/translation-report.md
echo "Generated: $(date)" >> /tmp/translation-report.md

# Check each language exists
for lang in $LANGUAGES; do
  if [ ! -d "$ARTICLES_DIR/$lang" ]; then
    echo " Missing language directory: $lang"
    mkdir -p "$ARTICLES_DIR/$lang"
  else
    echo " Language directory exists: $lang"
  fi
done

# Build article slug list (union of all languages)
ALL_SLUGS=()
for lang in $LANGUAGES; do
  if [ -d "$ARTICLES_DIR/$lang" ]; then
    for article_dir in "$ARTICLES_DIR/$lang"/*; do
      if [ -d "$article_dir" ]; then
        slug=$(basename "$article_dir")
        if [[ ! " ${ALL_SLUGS[@]} " =~ " ${slug} " ]]; then
          ALL_SLUGS+=("$slug")
        fi
      fi
    done
  fi
done

# Check coverage for each slug
for slug in "${ALL_SLUGS[@]}"; do
  echo "### $slug"
  for lang in $LANGUAGES; do
    article_path="$ARTICLES_DIR/$lang/$slug/article.md"
    if [ -f "$article_path" ]; then
      word_count=$(wc -w < "$article_path")
      echo "-  **$lang**: $word_count words"
    else
      echo "-  **$lang**: MISSING"
    fi
  done
done

# Summary statistics
TOTAL_SLUGS=${#ALL_SLUGS[@]}
LANG_COUNT=$(echo "$LANGUAGES" | wc -w)
EXPECTED_TOTAL=$((TOTAL_SLUGS * LANG_COUNT))

# Calculate coverage
# ... (see full script in agent)
```

## Multi-Language Workflow

### 1. Initial Setup

```bash
# Create constitution with languages
cat > .spec/blog.spec.json <<'EOF'
{
  "blog": {
    "languages": ["en", "fr", "es"]
  }
}
EOF
```

### 2. Create Original Article

```bash
# Write English article
/blog-copywrite "en/nodejs-logging"
```

### 3. Check Coverage

```bash
# Validate structure
/blog-translate

# Output shows:
# - nodejs-logging: en , fr , es 
```

### 4. Translate to Other Languages

```bash
# Translate to French
/blog-translate "en/nodejs-logging" "fr"

# Translate to Spanish
/blog-translate "en/nodejs-logging" "es"
```

### 5. Verify Complete Coverage

```bash
# Re-check structure
/blog-translate

# Output shows:
# - nodejs-logging: en , fr , es 
# - Coverage: 100%
```

### 6. Update Cross-Links

Manually add language navigation to each article:

```markdown
---
 [Read in English](/en/nodejs-logging)
 [Lire en français](/fr/nodejs-logging)
 [Leer en español](/es/nodejs-logging)
---
```

## Translation Quality Tips

### Before Translation

1. **Finalize source**: Complete and review source article first
2. **Optimize images**: Run `/blog-optimize-images` on source
3. **SEO validation**: Run `/blog-optimize` on source
4. **Cross-references**: Ensure internal links work

### During Translation

1. **Technical accuracy**: Verify technical terms are correct
2. **Cultural adaptation**: Adapt examples and idioms
3. **SEO keywords**: Research target language keywords
4. **Natural flow**: Read translated text aloud

### After Translation

1. **Native review**: Have native speaker review
2. **Quality check**: Run `/blog-optimize` on translation
3. **Link verification**: Test all internal/external links
4. **Image check**: Verify all images load correctly

## Troubleshooting

### "Language not configured"

```bash
# Add language to constitution
# Edit .spec/blog.spec.json
{
  "blog": {
    "languages": ["en", "fr", "es", "de"]  // Add your language
  }
}
```

### "Source article not found"

```bash
# Verify source exists
ls articles/en/nodejs-logging/article.md

# If missing, create it first
/blog-copywrite "en/nodejs-logging"
```

### "Target already exists"

```bash
# Agent will offer options:
# 1. Overwrite (backup created in /tmp/)
# 2. Skip translation
# 3. Compare versions

# Manual backup if needed
cp articles/fr/nodejs-logging/article.md /tmp/backup-$(date +%s).md
```

### "jq: command not found"

```bash
# Install jq (JSON parser)
brew install jq                    # macOS
sudo apt-get install jq            # Linux
choco install jq                   # Windows (Chocolatey)
```

### "Images not synchronized"

```bash
# Manually copy images
cp -r articles/en/nodejs-logging/images/* articles/fr/nodejs-logging/images/

# Or re-run optimization
/blog-optimize-images "fr/nodejs-logging"
```

## Performance Notes

### Validation Only
- **Time**: 2-5 minutes
- **Complexity**: O(n × m) where n = articles, m = languages
- **Token usage**: ~500 tokens

### Single Translation
- **Time**: 10-20 minutes
- **Complexity**: O(article_length)
- **Token usage**: ~5k-8k tokens (source + translation context)

### Batch Translation
- **Recommended**: Translate similar articles in sequence
- **Parallel**: Translations are independent (can run multiple agents)

## Integration with Other Commands

### Complete Workflow

```bash
# 1. Research (language-agnostic)
/blog-research "Node.js Logging Best Practices"

# 2. SEO (language-agnostic)
/blog-seo "Node.js Logging Best Practices"

# 3. Create English article
/blog-copywrite "en/nodejs-logging"

# 4. Optimize English
/blog-optimize "en/nodejs-logging"
/blog-optimize-images "en/nodejs-logging"

# 5. Check translation coverage
/blog-translate

# 6. Translate to French
/blog-translate "en/nodejs-logging" "fr"

# 7. Translate to Spanish
/blog-translate "en/nodejs-logging" "es"

# 8. Optimize translations
/blog-optimize "fr/nodejs-logging"
/blog-optimize "es/nodejs-logging"

# 9. Final coverage check
/blog-translate  # Should show 100%
```

## Advanced Usage

### Selective Translation

Translate only high-priority articles:

```bash
# Check what needs translation
/blog-translate | grep ""

# Translate priority articles only
/blog-translate "en/top-article" "fr"
/blog-translate "en/top-article" "es"
```

### Update Existing Translations

When source article changes:

```bash
# 1. Update source
vim articles/en/nodejs-logging/article.md

# 2. Re-translate
/blog-translate "en/nodejs-logging" "fr"  # Overwrites with backup

# 3. Review changes
diff /tmp/backup-*.md articles/fr/nodejs-logging/article.md
```

### Batch Translation Script

For translating all missing articles:

```bash
# Generate list of missing translations
/blog-translate > /tmp/coverage.txt

# Extract missing translations
grep "Translate.*→" /tmp/translation-report.md | while read line; do
  # Extract slug and languages
  # Run translations
  # ...
done
```

## Storage Considerations

### Translated Articles

```
articles/
├── en/nodejs-logging/article.md   (2.5k words, source)
├── fr/nodejs-logging/article.md   (2.4k words, translation)
└── es/nodejs-logging/article.md   (2.6k words, translation)
```

### Shared Images

Images can be shared across languages (recommended):

```
articles/
└── en/nodejs-logging/images/
    ├── diagram.webp
    └── screenshot.webp

articles/fr/nodejs-logging/article.md  # References: ../en/nodejs-logging/images/diagram.webp
```

Or duplicated per language (isolated):

```
articles/
├── en/nodejs-logging/images/diagram.webp
├── fr/nodejs-logging/images/diagram.webp
└── es/nodejs-logging/images/diagram.webp
```

---

**Ready to translate?** Maintain a consistent multi-language blog with automated structure validation and quality-preserving translations.
