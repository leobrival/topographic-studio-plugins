# Blog Analysis & Constitution Generator

Reverse-engineer blog constitution from existing content by analyzing articles, patterns, and style.

## Usage

```bash
/blog-analyse
```

**Optional**: Specify content directory if detection fails or you want to override:
```bash
/blog-analyse "content"
/blog-analyse "posts"
/blog-analyse "articles/en"
```

## What This Command Does

Analyzes existing blog content to automatically generate `.spec/blog.spec.json`.

**Opposite of `/blog-setup`**:
- `/blog-setup` = Create constitution → Generate content
- `/blog-analyse` = Analyze content → Generate constitution

### Analysis Process

1. **Content Discovery** (Phase 1)
   - Scan for content directories (articles/, content/, posts/, etc.)
   - If multiple found → ask user which to analyze
   - If none found → ask user to specify path
   - Count total articles

2. **Language Detection** (Phase 2)
   - Detect i18n structure (en/, fr/, es/ subdirectories)
   - Or detect language from frontmatter
   - Count articles per language

3. **Tone & Style Analysis** (Phase 3)
   - Analyze sample of 10 articles
   - Detect tone: expert, pédagogique, convivial, corporate
   - Extract voice patterns (do/don't)

4. **Metadata Extraction** (Phase 4)
   - Detect blog name (from package.json, README, config)
   - Determine context/audience from keywords
   - Identify objective (education, leads, community, etc.)

5. **Constitution Generation** (Phase 5)
   - Create comprehensive `.spec/blog.spec.json`
   - Include detected metadata
   - Validate JSON structure
   - Generate analysis report

6. **CLAUDE.md Generation** (Phase 6)
   - Create CLAUDE.md in content directory
   - Document blog.spec.json as source of truth
   - Include voice guidelines from constitution
   - Explain tone and validation workflow

**Time**: 10-15 minutes
**Output**: `.spec/blog.spec.json` + `[content_dir]/CLAUDE.md` + analysis report

## Prerequisites

✅ **Required**:
- Existing blog content (.md or .mdx files)
- At least 3 articles (more = better analysis)
- Consistent writing style across articles

✅ **Optional but Recommended**:
- `jq` or `python3` for JSON validation
- Frontmatter in articles (for language detection)
- README.md or package.json (for blog name detection)

## Instructions

Create a new subagent conversation with the `analyzer` agent.

**Provide the following prompt**:

```
You are analyzing existing blog content to reverse-engineer a blog constitution.

**Task**: Complete content analysis and generate blog.spec.json

**Content Directory**: [Auto-detect OR use user-specified: $CONTENT_DIR]

Execute ALL phases (1-6) from your instructions:

**Phase 1: Content Discovery**
- Scan common directories: articles/, content/, posts/, blog/, src/content/, _posts/
- If multiple directories found with content:
  - Display list with article counts
  - Ask user: "Which directory should I analyze?"
  - Wait for user response
- If no directories found:
  - Ask user: "Please specify your content directory path:"
  - Wait for user response
  - Validate path exists
- If single directory found:
  - Use it automatically
  - Inform user: "✅ Found content in: [directory]"
- Detect i18n structure (language subdirectories)
- Count total articles

**Phase 2: Language Detection**
- If i18n structure: list language directories and count articles per language
- If single structure: detect language from frontmatter or ask user
- Determine primary language

**Phase 3: Tone & Style Analysis**
- Sample 10 articles (diverse selection across languages if applicable)
- Read frontmatter + first 500 words of each
- Analyze tone indicators:
  - Expert: technical terms, docs refs, assumes knowledge
  - Pédagogique: step-by-step, explanations, analogies
  - Convivial: conversational, personal, casual
  - Corporate: professional, ROI focus, formal
- Score each tone based on indicators
- Select highest scoring tone (or ask user if unclear)
- Extract voice patterns:
  - voice_do: positive patterns (active voice, code examples, data-driven, etc.)
  - voice_dont: anti-patterns (passive voice, vague claims, buzzwords, etc.)

**Phase 4: Metadata Extraction**
- Detect blog name from:
  - package.json "name" field
  - README.md first heading
  - config files (hugo.toml, gatsby-config.js, etc.)
  - Or use directory name as fallback
- Generate context string from article keywords/themes
- Determine objective based on content type:
  - Tutorials → Educational
  - Analysis/opinions → Thought leadership
  - CTAs/products → Lead generation
  - Updates/discussions → Community

**Phase 5: Constitution Generation**
- Create .spec/blog.spec.json with:
  ```json
  {
    "version": "1.0.0",
    "blog": {
      "name": "[detected]",
      "context": "[generated]",
      "objective": "[determined]",
      "tone": "[detected]",
      "languages": ["[detected]"],
      "content_directory": "[detected]",
      "brand_rules": {
        "voice_do": ["[extracted patterns]"],
        "voice_dont": ["[extracted anti-patterns]"]
      }
    },
    "workflow": {
      "review_rules": {
        "must_have": ["[standard rules]"],
        "must_avoid": ["[standard anti-patterns]"]
      }
    },
    "analysis": {
      "generated_from": "existing_content",
      "articles_analyzed": [count],
      "total_articles": [count],
      "confidence": "[percentage]",
      "generated_at": "[timestamp]"
    }
  }
  ```
- Validate JSON with jq or python3
- Generate analysis report with:
  - Content discovery summary
  - Language analysis results
  - Tone detection (with confidence %)
  - Voice guidelines with examples
  - Blog metadata
  - Next steps suggestions

**Phase 6: CLAUDE.md Generation for Content Directory**
- Read configuration from blog.spec.json:
  - content_directory
  - blog name
  - tone
  - languages
  - voice guidelines
- Create CLAUDE.md in content directory with:
  - Explicit statement: blog.spec.json is "single source of truth"
  - Voice guidelines (DO/DON'T) extracted from constitution
  - Tone explanation with specific behaviors
  - Article structure requirements from constitution
  - Validation workflow documentation
  - Commands that use constitution
  - Instructions for updating constitution
  - Important notes about never deviating from guidelines
- Expand variables ($BLOG_NAME, $TONE, etc.) in template
- Inform user that CLAUDE.md was created

**Important**:
- ALL analysis scripts must be in /tmp/ (non-destructive)
- If user interaction needed (directory selection, tone confirmation), WAIT for response
- Be transparent about confidence levels
- Provide examples from actual content to support detections
- Clean up temporary files after analysis

Display the analysis report and constitution location when complete.
```

## Expected Output

### Analysis Report

```markdown
# Blog Analysis Report

Generated: 2025-10-12 15:30:00

## Content Discovery

- **Content directory**: articles/
- **Total articles**: 47
- **Structure**: i18n (language subdirectories)

## Language Analysis

- **Languages**:
  - en: 25 articles
  - fr: 22 articles
- **Primary language**: en

## Tone & Style Analysis

- **Detected tone**: pédagogique (confidence: 78%)
- **Tone indicators found**:
  - Step-by-step instructions (18 articles)
  - Technical term explanations (all articles)
  - Code examples with commentary (23 articles)
  - Clear learning objectives (15 articles)

## Voice Guidelines

### DO (Positive Patterns)
- ✅ Clear, actionable explanations (found in 92% of articles)
- ✅ Code examples with inline comments (found in 85% of articles)
- ✅ Step-by-step instructions (found in 76% of articles)
- ✅ External links to official documentation (found in 68% of articles)
- ✅ Active voice and direct language (found in 94% of articles)

### DON'T (Anti-patterns)
- ❌ Jargon without explanation (rarely found)
- ❌ Vague claims without data (avoid, found in 2 articles)
- ❌ Complex sentences over 25 words (minimize, found in some)
- ❌ Passive voice constructions (minimize)

## Blog Metadata

- **Name**: Tech Insights
- **Context**: Technical blog for software developers and DevOps engineers
- **Objective**: Educate and upskill developers on cloud-native technologies

## Files Generated

✅ Constitution: `.spec/blog.spec.json`
✅ Content Guidelines: `articles/CLAUDE.md` (uses constitution as source of truth)

## Next Steps

1. **Review**: Check `.spec/blog.spec.json` for accuracy
2. **Refine**: Edit voice guidelines if needed
3. **Test**: Generate new article: `/blog-generate "Test Topic"`
4. **Validate**: Run quality check: `/blog-optimize "article-slug"`

---

**Note**: This constitution was reverse-engineered from your existing content.
You can refine it manually at any time.
```

### Generated Constitution

**File**: `.spec/blog.spec.json`

```json
{
  "version": "1.0.0",
  "blog": {
    "name": "Tech Insights",
    "context": "Technical blog for software developers and DevOps engineers",
    "objective": "Educate and upskill developers on cloud-native technologies",
    "tone": "pédagogique",
    "languages": ["en", "fr"],
    "content_directory": "articles",
    "brand_rules": {
      "voice_do": [
        "Clear, actionable explanations",
        "Code examples with inline comments",
        "Step-by-step instructions",
        "External links to official documentation",
        "Active voice and direct language"
      ],
      "voice_dont": [
        "Jargon without explanation",
        "Vague claims without data",
        "Complex sentences over 25 words",
        "Passive voice constructions",
        "Unsourced technical claims"
      ]
    }
  },
  "workflow": {
    "review_rules": {
      "must_have": [
        "Executive summary with key takeaways",
        "Minimum 3-5 credible source citations",
        "Actionable insights (3-5 specific recommendations)",
        "Code examples for technical topics",
        "Clear structure with H2/H3 headings"
      ],
      "must_avoid": [
        "Unsourced or unverified claims",
        "Keyword stuffing (density >2%)",
        "Vague or generic recommendations",
        "Missing internal links",
        "Images without descriptive alt text"
      ]
    }
  },
  "analysis": {
    "generated_from": "existing_content",
    "articles_analyzed": 10,
    "total_articles": 47,
    "confidence": "78%",
    "generated_at": "2025-10-12T15:30:00Z"
  }
}
```

## Interactive Prompts

### Multiple Directories Found

```
Found directories with content:
  1) articles/ (47 articles)
  2) content/ (12 articles)
  3) posts/ (8 articles)

Which directory should I analyze? (1-3):
```

### No Directory Found

```
❌ No content directories found.

Please specify your content directory path:
(e.g., articles, content, posts, blog):
```

### Tone Detection Unclear

```
⚠️  Tone detection inconclusive

Detected indicators:
  - Expert: 35%
  - Pédagogique: 42%
  - Convivial: 38%
  - Corporate: 15%

Which tone best describes your content?
  1) Expert (technical, authoritative)
  2) Pédagogique (educational, patient)
  3) Convivial (friendly, casual)
  4) Corporate (professional, formal)

Choice (1-4):
```

### Small Sample Warning

```
⚠️  Only 2 articles found in articles/

Analysis may not be accurate with small sample.
Continue anyway? (y/n):
```

## Use Cases

### Migrate Existing Blog

You have an established blog and want to use Blog Kit:

```bash
# Analyze existing content
/blog-analyse

# Review generated constitution
cat .spec/blog.spec.json

# Test with new article
/blog-generate "New Topic"

# Validate existing articles
/blog-optimize "existing-article"
```

### Multi-Author Blog

Ensure consistency across multiple authors:

```bash
# Analyze to establish baseline
/blog-analyse

# Share .spec/blog.spec.json with team
# All new articles will follow detected patterns

# Generate new content
/blog-copywrite "new-article"  # Enforces constitution
```

### Refactor Content Style

Want to understand current style before changing it:

```bash
# Analyze current style
/blog-analyse

# Review tone and voice patterns
# Decide what to keep/change

# Edit .spec/blog.spec.json manually
# Generate new articles with updated constitution
```

### Hugo/Gatsby/Jekyll Migration

Adapting Blog Kit to existing static site generator:

```bash
# Analyze content/ directory (Hugo/Gatsby)
/blog-analyse "content"

# Or analyze _posts/ (Jekyll)
/blog-analyse "_posts"

# Constitution will include content_directory
# All commands will use correct directory
```

## Comparison: Setup vs Analyse

| Feature | `/blog-setup` | `/blog-analyse` |
|---------|---------------|-----------------|
| **Input** | User answers prompts | Existing articles |
| **Process** | Manual configuration | Automated analysis |
| **Output** | Fresh constitution | Reverse-engineered constitution |
| **Use Case** | New blog | Existing blog |
| **Time** | 2-5 minutes | 10-15 minutes |
| **Accuracy** | 100% (user defined) | 70-90% (depends on sample) |
| **Customization** | Full control | Review and refine needed |

## Troubleshooting

### "No content directories found"

**Cause**: No common directories with .md files
**Solution**: Specify your content path:
```bash
/blog-analyse "path/to/your/content"
```

### "Tone detection inconclusive"

**Cause**: Mixed writing styles or small sample
**Solution**: Agent will ask you to select tone manually

### "Only X articles found, continue?"

**Cause**: Content directory has very few articles
**Solution**:
- Add more articles first (recommended)
- Or continue with warning (may be inaccurate)

### "Cannot detect blog name"

**Cause**: No package.json, README.md, or config files
**Solution**: Agent will use directory name as fallback
You can edit `.spec/blog.spec.json` manually afterward

### "Language detection failed"

**Cause**: No frontmatter with `language:` field
**Solution**: Agent will ask you to specify primary language

## Tips for Better Analysis

### Before Analysis

1. **Consistent Frontmatter**: Ensure articles have YAML frontmatter
2. **Sufficient Sample**: At least 5-10 articles for accurate detection
3. **Recent Content**: Analysis prioritizes newer articles
4. **Clean Structure**: Organize by language if multi-language

### After Analysis

1. **Review Constitution**: Check `.spec/blog.spec.json` for accuracy
2. **Refine Guidelines**: Edit voice_do/voice_dont if needed
3. **Test Generation**: Generate test article to verify tone
4. **Iterate**: Re-run analysis if you add more content

### For Best Results

- **Diverse Sample**: Include different article types
- **Representative Content**: Use typical articles, not outliers
- **Clear Style**: Consistent writing voice improves detection
- **Good Metadata**: Complete frontmatter helps detection

## Integration with Workflow

### Complete Adoption Workflow

```bash
# 1. Analyze existing content
/blog-analyse

# 2. Review generated constitution
cat .spec/blog.spec.json
vim .spec/blog.spec.json  # Refine if needed

# 3. Validate existing articles
/blog-optimize "article-1"
/blog-optimize "article-2"

# 4. Check translation coverage (if i18n)
/blog-translate

# 5. Generate new articles
/blog-generate "New Topic"

# 6. Maintain consistency
/blog-copywrite "new-article"  # Enforces constitution
```

## Advanced Usage

### Analyze Specific Language

If you have i18n structure and want to analyze only one language:

```bash
# Analyze only English articles
/blog-analyse "articles/en"
```

**Note**: Constitution will have `content_directory: "articles/en"` which may not work for other languages. Edit manually to `"articles"` after analysis.

### Compare Multiple Analyses

Analyze different content sets to compare:

```bash
# Analyze primary content
/blog-analyse "articles"
mv .spec/blog.spec.json .spec/articles-constitution.json

# Analyze legacy content
/blog-analyse "old-posts"
mv .spec/blog.spec.json .spec/legacy-constitution.json

# Compare differences
diff .spec/articles-constitution.json .spec/legacy-constitution.json
```

### Re-analyze After Growth

As your blog grows, re-analyze to update constitution:

```bash
# Backup current constitution
cp .spec/blog.spec.json .spec/blog.spec.backup.json

# Re-analyze with more articles
/blog-analyse

# Compare changes
diff .spec/blog.spec.backup.json .spec/blog.spec.json
```

---

**Ready to analyze?** Let Blog Kit learn from your existing content and generate the perfect constitution automatically.
