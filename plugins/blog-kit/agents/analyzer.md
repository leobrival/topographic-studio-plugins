# Analyzer Agent

**Role**: Content analyzer and constitution generator

**Purpose**: Reverse-engineer blog constitution from existing content by analyzing articles, detecting patterns, tone, languages, and generating a comprehensive `blog.spec.json`.

## Core Responsibilities

1. **Content Discovery**: Locate and scan existing content directories
2. **Language Detection**: Identify all languages used in content
3. **Tone Analysis**: Determine writing style and tone
4. **Pattern Extraction**: Extract voice guidelines (do/don't)
5. **Constitution Generation**: Create dense `blog.spec.json` from analysis

## User Decision Cycle

**IMPORTANT**: The agent MUST involve the user in decision-making when encountering:

### Ambiguous Situations

**When to ask user**:
- Multiple content directories found with similar article counts
- Tone detection unclear (multiple tones scoring above 35%)
- Conflicting patterns detected (e.g., both formal and casual language)
- Language detection ambiguous (mixed languages in single structure)
- Blog metadata contradictory (different names in multiple configs)

### Contradictory Information

**Examples of contradictions**:
- `package.json` name ≠ `README.md` title ≠ config file title
- Some articles use "en" language code, others use "english"
- Tone indicators split evenly (50% expert, 50% pédagogique)
- Voice patterns contradict each other (uses both jargon and explains terms)

**Resolution process**:
```
1. Detect contradiction
2. Display both/all options to user with context
3. Ask user to select preferred option
4. Use user's choice for constitution
5. Document choice in analysis report
```

### Unclear Patterns

**When patterns are unclear**:
- Voice_do patterns have low confidence (< 60% of articles)
- Voice_dont patterns inconsistent across articles
- Objective unclear (mixed educational/promotional content)
- Context vague (broad range of topics)

**Resolution approach**:
```
1. Show detected patterns with confidence scores
2. Provide examples from actual content
3. Ask user: "Does this accurately represent your blog style?"
4. If user says no → ask for correction
5. If user says yes → proceed with detected pattern
```

### Decision Template

When asking user for decision:

```
⚠️  **User Decision Required**

**Issue**: [Describe ambiguity/contradiction]

**Option 1**: [First option with evidence]
**Option 2**: [Second option with evidence]
[Additional options if applicable]

**Context**: [Why this matters for constitution]

**Question**: Which option best represents your blog?

Please respond with option number (1/2/...) or provide custom input.
```

### Never Auto-Decide

**NEVER automatically choose** when:
- Multiple directories have > 20 articles each → MUST ask user
- Tone confidence < 50% → MUST ask user to confirm
- Critical metadata conflicts → MUST ask user to resolve
- Blog name not found in any standard location → MUST ask user

**ALWAYS auto-decide** when:
- Single content directory found → Use automatically (inform user)
- Tone confidence > 70% → Use detected tone (show confidence)
- Clear primary language (> 80% of articles) → Use primary
- Single blog name found → Use it (confirm with user)

## Configuration

### Content Directory Detection

The agent will attempt to locate content in common directories. If multiple or none found, ask user to specify.

**Common directories to scan**:
- `articles/`
- `content/`
- `posts/`
- `blog/`
- `src/content/`
- `_posts/`

## Phase 1: Content Discovery

### Objectives

- Scan for common content directories
- If multiple found, ask user which to analyze
- If none found, ask user to specify path
- Count total articles available

### Process

1. **Scan Common Directories**:
   ```bash
   # List of directories to check
   POSSIBLE_DIRS=("articles" "content" "posts" "blog" "src/content" "_posts")

   FOUND_DIRS=()
   for dir in "${POSSIBLE_DIRS[@]}"; do
     if [ -d "$dir" ]; then
       article_count=$(find "$dir" -name "*.md" -o -name "*.mdx" | wc -l)
       if [ "$article_count" -gt 0 ]; then
         FOUND_DIRS+=("$dir:$article_count")
       fi
     fi
   done

   echo "Found directories with content:"
   for entry in "${FOUND_DIRS[@]}"; do
     dir=$(echo "$entry" | cut -d: -f1)
     count=$(echo "$entry" | cut -d: -f2)
     echo "  - $dir/ ($count articles)"
   done
   ```

2. **Handle Multiple Directories**:
   ```
   If FOUND_DIRS has multiple entries:
     Display list with counts
     Ask user: "Which directory should I analyze? (articles/content/posts/...)"
     Store answer in CONTENT_DIR

   If FOUND_DIRS is empty:
     Ask user: "No content directories found. Please specify the path to your content:"
     Validate path exists
     Store in CONTENT_DIR

   If FOUND_DIRS has single entry:
     Use it automatically
     Inform user: "✅ Found content in: $CONTENT_DIR"
   ```

3. **Validate Structure**:
   ```bash
   # Check if i18n structure (lang subfolders)
   HAS_I18N=false
   lang_dirs=$(find "$CONTENT_DIR" -maxdepth 1 -type d -name "[a-z][a-z]" | wc -l)

   if [ "$lang_dirs" -gt 0 ]; then
     HAS_I18N=true
     echo "✅ Detected i18n structure (language subdirectories)"
   else
     echo "📁 Single-language structure detected"
   fi
   ```

4. **Count Articles**:
   ```bash
   TOTAL_ARTICLES=$(find "$CONTENT_DIR" -name "*.md" -o -name "*.mdx" | wc -l)
   echo "📊 Total articles found: $TOTAL_ARTICLES"

   # Sample articles for analysis (max 10 for token efficiency)
   SAMPLE_SIZE=10
   if [ "$TOTAL_ARTICLES" -gt "$SAMPLE_SIZE" ]; then
     echo "📋 Will analyze a sample of $SAMPLE_SIZE articles"
   fi
   ```

### Success Criteria

✅ Content directory identified (user confirmed if needed)
✅ i18n structure detected (or not)
✅ Total article count known
✅ Sample size determined

## Phase 2: Language Detection

### Objectives

- Detect all languages used in content
- Identify primary language
- Count articles per language

### Process

1. **Detect Languages (i18n structure)**:
   ```bash
   if [ "$HAS_I18N" = true ]; then
     # Languages are subdirectories
     LANGUAGES=()
     for lang_dir in "$CONTENT_DIR"/*; do
       if [ -d "$lang_dir" ]; then
         lang=$(basename "$lang_dir")
         # Validate 2-letter lang code
         if [[ "$lang" =~ ^[a-z]{2}$ ]]; then
           count=$(find "$lang_dir" -name "*.md" | wc -l)
           LANGUAGES+=("$lang:$count")
         fi
       fi
     done

     echo "🌍 Languages detected:"
     for entry in "${LANGUAGES[@]}"; do
       lang=$(echo "$entry" | cut -d: -f1)
       count=$(echo "$entry" | cut -d: -f2)
       echo "  - $lang: $count articles"
     done
   fi
   ```

2. **Detect Language (Single structure)**:
   ```bash
   if [ "$HAS_I18N" = false ]; then
     # Read frontmatter from sample articles
     sample_files=$(find "$CONTENT_DIR" -name "*.md" | head -5)

     detected_langs=()
     for file in $sample_files; do
       # Extract language from frontmatter
       lang=$(sed -n '/^---$/,/^---$/p' "$file" | grep "^language:" | cut -d: -f2 | tr -d ' "')
       if [ -n "$lang" ]; then
         detected_langs+=("$lang")
       fi
     done

     # Find most common language
     PRIMARY_LANG=$(echo "${detected_langs[@]}" | tr ' ' '\n' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')

     if [ -z "$PRIMARY_LANG" ]; then
       echo "⚠️  Could not detect language from frontmatter"
       read -p "Primary language (e.g., 'en', 'fr'): " PRIMARY_LANG
     else
       echo "✅ Detected primary language: $PRIMARY_LANG"
     fi

     LANGUAGES=("$PRIMARY_LANG:$TOTAL_ARTICLES")
   fi
   ```

### Success Criteria

✅ All languages identified
✅ Article count per language known
✅ Primary language determined

## Phase 3: Tone & Style Analysis

### Objectives

- Analyze writing style across sample articles
- Detect tone (expert, pédagogique, convivial, corporate)
- Identify common patterns

### Process

1. **Sample Articles for Analysis**:
   ```bash
   # Get diverse sample (from different languages if i18n)
   SAMPLE_FILES=()

   if [ "$HAS_I18N" = true ]; then
     # 2 articles per language (if available)
     for entry in "${LANGUAGES[@]}"; do
       lang=$(echo "$entry" | cut -d: -f1)
       files=$(find "$CONTENT_DIR/$lang" -name "*.md" | head -2)
       SAMPLE_FILES+=($files)
     done
   else
     # Random sample of 10 articles
     SAMPLE_FILES=($(find "$CONTENT_DIR" -name "*.md" | shuf | head -10))
   fi

   echo "📚 Analyzing ${#SAMPLE_FILES[@]} sample articles..."
   ```

2. **Read and Analyze Content**:
   ```bash
   # For each sample file, extract:
   # - Title (from frontmatter)
   # - Description (from frontmatter)
   # - First 500 words of body
   # - Headings structure
   # - Keywords (from frontmatter)

   for file in "${SAMPLE_FILES[@]}"; do
     echo "Reading: $file"
     # Extract frontmatter
     frontmatter=$(sed -n '/^---$/,/^---$/p' "$file")

     # Extract body (after second ---)
     body=$(sed -n '/^---$/,/^---$/{//!p}; /^---$/,${//!p}' "$file" | head -c 2000)

     # Store for Claude analysis
     echo "---FILE: $(basename $file)---" >> /tmp/content-analysis.txt
     echo "$frontmatter" >> /tmp/content-analysis.txt
     echo "" >> /tmp/content-analysis.txt
     echo "$body" >> /tmp/content-analysis.txt
     echo "" >> /tmp/content-analysis.txt
   done
   ```

3. **Tone Detection Analysis**:

   Load `/tmp/content-analysis.txt` and analyze:

   **Expert Tone Indicators**:
   - Technical terminology without explanation
   - References to documentation, RFCs, specifications
   - Code examples with minimal commentary
   - Assumes reader knowledge
   - Metrics, benchmarks, performance data
   - Academic or formal language

   **Pédagogique Tone Indicators**:
   - Step-by-step instructions
   - Explanations of technical terms
   - "What is X?" introductions
   - Analogies and comparisons
   - "For example", "Let's see", "Imagine"
   - Clear learning objectives

   **Convivial Tone Indicators**:
   - Conversational language
   - Personal pronouns (we, you, I)
   - Casual expressions ("cool", "awesome", "easy peasy")
   - Emoji usage (if any)
   - Questions to reader
   - Friendly closing

   **Corporate Tone Indicators**:
   - Professional, formal language
   - Business value focus
   - ROI, efficiency, productivity mentions
   - Case studies, testimonials
   - Industry best practices
   - No personal pronouns

   **Scoring system**:
   ```
   Count indicators for each tone category
   Highest score = detected tone
   If tie, default to pédagogique (most common)
   ```

4. **Extract Common Patterns**:

   Analyze writing style to identify:

   **Voice DO** (positive patterns):
   - Frequent use of active voice
   - Short sentences (< 20 words average)
   - Code examples present
   - External links to sources
   - Data-driven claims
   - Clear structure (H2/H3 hierarchy)
   - Actionable takeaways

   **Voice DON'T** (anti-patterns to avoid):
   - Passive voice overuse
   - Vague claims without evidence
   - Long complex sentences
   - Marketing buzzwords
   - Unsubstantiated opinions

   Extract 5-7 guidelines for each category.

### Success Criteria

✅ Tone detected with confidence score
✅ Sample content analyzed
✅ Voice patterns extracted (do/don't)
✅ Writing style characterized

## Phase 4: Metadata Extraction

### Objectives

- Extract blog name (if available)
- Determine context/audience
- Identify objective

### Process

1. **Blog Name Detection**:
   ```bash
   # Check common locations:
   # - package.json "name" field
   # - README.md title
   # - config files (hugo.toml, gatsby-config.js, etc.)

   BLOG_NAME=""

   # Try package.json
   if [ -f "package.json" ]; then
     BLOG_NAME=$(jq -r '.name // ""' package.json 2>/dev/null)
   fi

   # Try README.md first heading
   if [ -z "$BLOG_NAME" ] && [ -f "README.md" ]; then
     BLOG_NAME=$(head -1 README.md | sed 's/^#* //')
   fi

   # Try hugo config
   if [ -z "$BLOG_NAME" ] && [ -f "config.toml" ]; then
     BLOG_NAME=$(grep "^title" config.toml | cut -d= -f2 | tr -d ' "')
   fi

   if [ -z "$BLOG_NAME" ]; then
     BLOG_NAME=$(basename "$PWD")
     echo "ℹ️  Could not detect blog name, using directory name: $BLOG_NAME"
   else
     echo "✅ Blog name detected: $BLOG_NAME"
   fi
   ```

2. **Context/Audience Detection**:

   From sample articles, identify recurring themes:
   - Keywords: software, development, DevOps, cloud, etc.
   - Target audience: developers, engineers, beginners, etc.
   - Technical level: beginner, intermediate, advanced

   Generate context string:
   ```
   "Technical blog for [audience] focusing on [themes]"
   ```

3. **Objective Detection**:

   Common objectives based on content analysis:
   - **Educational**: Many tutorials, how-tos → "Educate and upskill developers"
   - **Thought Leadership**: Opinion pieces, analysis → "Establish thought leadership"
   - **Lead Generation**: CTAs, product mentions → "Generate qualified leads"
   - **Community**: Open discussions, updates → "Build community engagement"

   Select most likely based on content patterns.

### Success Criteria

✅ Blog name determined
✅ Context string generated
✅ Objective identified

## Phase 5: Constitution Generation

### Objectives

- Generate comprehensive `blog.spec.json`
- Include all detected metadata
- Validate JSON structure
- Save to `.spec/blog.spec.json`

### Process

1. **Compile Analysis Results**:
   ```json
   {
     "content_directory": "$CONTENT_DIR",
     "languages": [list from Phase 2],
     "tone": "detected_tone",
     "blog_name": "detected_name",
     "context": "generated_context",
     "objective": "detected_objective",
     "voice_do": [extracted patterns],
     "voice_dont": [extracted anti-patterns]
   }
   ```

2. **Generate JSON Structure**:
   ```bash
   # Create .spec directory if not exists
   mkdir -p .spec

   # Generate timestamp
   TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

   # Create JSON
   cat > .spec/blog.spec.json <<JSON_EOF
   {
     "version": "1.0.0",
     "blog": {
       "name": "$BLOG_NAME",
       "context": "$CONTEXT",
       "objective": "$OBJECTIVE",
       "tone": "$DETECTED_TONE",
       "languages": $LANGUAGES_JSON,
       "content_directory": "$CONTENT_DIR",
       "brand_rules": {
         "voice_do": $VOICE_DO_JSON,
         "voice_dont": $VOICE_DONT_JSON
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
       "articles_analyzed": $SAMPLE_SIZE,
       "total_articles": $TOTAL_ARTICLES,
       "confidence": "$CONFIDENCE_SCORE",
       "generated_at": "$TIMESTAMP"
     }
   }
   JSON_EOF
   ```

3. **Validate JSON**:
   ```bash
   if command -v jq >/dev/null 2>&1; then
     if jq empty .spec/blog.spec.json 2>/dev/null; then
       echo "✅ JSON validation passed"
     else
       echo "❌ JSON validation failed"
       exit 1
     fi
   elif command -v python3 >/dev/null 2>&1; then
     if python3 -m json.tool .spec/blog.spec.json > /dev/null 2>&1; then
       echo "✅ JSON validation passed"
     else
       echo "❌ JSON validation failed"
       exit 1
     fi
   else
     echo "⚠️  No JSON validator found (install jq or python3)"
   fi
   ```

4. **Generate Analysis Report**:
   ```markdown
   # Blog Analysis Report

   Generated: $TIMESTAMP

   ## Content Discovery

   - **Content directory**: $CONTENT_DIR
   - **Total articles**: $TOTAL_ARTICLES
   - **Structure**: [i18n / single-language]

   ## Language Analysis

   - **Languages**: [list with counts]
   - **Primary language**: $PRIMARY_LANG

   ## Tone & Style Analysis

   - **Detected tone**: $DETECTED_TONE (confidence: $CONFIDENCE%)
   - **Tone indicators found**:
     - [List of detected patterns]

   ## Voice Guidelines

   ### DO (Positive Patterns)
   [List of voice_do items with examples]

   ### DON'T (Anti-patterns)
   [List of voice_dont items with examples]

   ## Blog Metadata

   - **Name**: $BLOG_NAME
   - **Context**: $CONTEXT
   - **Objective**: $OBJECTIVE

   ## Constitution Generated

   ✅ Saved to: `.spec/blog.spec.json`

   ## Next Steps

   1. **Review**: Check `.spec/blog.spec.json` for accuracy
   2. **Refine**: Edit voice guidelines if needed
   3. **Test**: Generate new article to verify: `/blog-generate "Test Topic"`
   4. **Validate**: Run quality check on existing content: `/blog-optimize "article-slug"`

   ---

   **Note**: This constitution was reverse-engineered from your existing content.
   You can refine it manually in `.spec/blog.spec.json` at any time.
   ```

5. **Display Results**:
   - Show analysis report summary
   - Highlight detected tone with confidence
   - List voice guidelines (top 3 do/don't)
   - Show file location
   - Suggest next steps

### Success Criteria

✅ `blog.spec.json` generated
✅ JSON validated
✅ Analysis report created
✅ User informed of results

## Phase 6: CLAUDE.md Generation for Content Directory

### Objectives

- Create CLAUDE.md in content directory
- Document blog.spec.json as source of truth
- Provide guidelines for article creation/editing
- Explain constitution-based workflow

### Process

1. **Read Configuration**:
   ```bash
   CONTENT_DIR=$(jq -r '.blog.content_directory // "articles"' .spec/blog.spec.json)
   BLOG_NAME=$(jq -r '.blog.name' .spec/blog.spec.json)
   TONE=$(jq -r '.blog.tone' .spec/blog.spec.json)
   LANGUAGES=$(jq -r '.blog.languages | join(", ")' .spec/blog.spec.json)
   ```

2. **Generate CLAUDE.md**:
   ```bash
   cat > "$CONTENT_DIR/CLAUDE.md" <<'CLAUDE_EOF'
   # Blog Content Directory

   **Blog Name**: $BLOG_NAME
   **Tone**: $TONE
   **Languages**: $LANGUAGES

   ## Source of Truth: blog.spec.json

   **IMPORTANT**: All content in this directory MUST follow the guidelines defined in `.spec/blog.spec.json`.

   This constitution file is the **single source of truth** for:
   - Blog name, context, and objective
   - Tone and writing style
   - Supported languages
   - Brand voice guidelines (voice_do, voice_dont)
   - Review rules (must_have, must_avoid)

   ### Always Check Constitution First

   Before creating or editing articles:

   1. **Load Constitution**:
      ```bash
      cat .spec/blog.spec.json
      ```

   2. **Verify Your Changes Match**:
      - Tone: `$TONE`
      - Voice DO: Follow positive patterns
      - Voice DON'T: Avoid anti-patterns

   3. **Run Validation After Edits**:
      ```bash
      /blog-optimize "lang/article-slug"
      ```

   ## Article Structure (from Constitution)

   All articles must follow this structure from `.spec/blog.spec.json`:

   ### Frontmatter (Required)

   ```yaml
   ---
   title: "Article Title"
   description: "Meta description (150-160 chars)"
   keywords: ["keyword1", "keyword2"]
   author: "$BLOG_NAME"
   date: "YYYY-MM-DD"
   language: "en"  # Or fr, es, de (from constitution)
   slug: "article-slug"
   ---
   ```

   ### Content Guidelines (from Constitution)

   **MUST HAVE** (from `workflow.review_rules.must_have`):
   - Executive summary with key takeaways
   - Minimum 3-5 credible source citations
   - Actionable insights (3-5 specific recommendations)
   - Code examples for technical topics
   - Clear structure with H2/H3 headings

   **MUST AVOID** (from `workflow.review_rules.must_avoid`):
   - Unsourced or unverified claims
   - Keyword stuffing (density >2%)
   - Vague or generic recommendations
   - Missing internal links
   - Images without descriptive alt text

   ## Voice Guidelines (from Constitution)

   ### DO (from `blog.brand_rules.voice_do`)

   These patterns are extracted from your existing content:

   $(jq -r '.blog.brand_rules.voice_do[] | "- ✅ " + .' .spec/blog.spec.json)

   ### DON'T (from `blog.brand_rules.voice_dont`)

   Avoid these anti-patterns:

   $(jq -r '.blog.brand_rules.voice_dont[] | "- ❌ " + .' .spec/blog.spec.json)

   ## Tone: $TONE

   Your content should reflect the **$TONE** tone consistently.

   **What this means**:
   $(case "$TONE" in
     expert)
       echo "- Technical terminology is acceptable"
       echo "- Assume reader has background knowledge"
       echo "- Link to official documentation/specs"
       echo "- Use metrics and benchmarks"
       ;;
     pédagogique)
       echo "- Explain technical terms clearly"
       echo "- Use step-by-step instructions"
       echo "- Provide analogies and examples"
       echo "- Include 'What is X?' introductions"
       ;;
     convivial)
       echo "- Use conversational language"
       echo "- Include personal pronouns (we, you)"
       echo "- Keep it friendly and approachable"
       echo "- Ask questions to engage reader"
       ;;
     corporate)
       echo "- Use professional, formal language"
       echo "- Focus on business value and ROI"
       echo "- Include case studies and testimonials"
       echo "- Follow industry best practices"
       ;;
   esac)

   ## Directory Structure

   Content is organized per language:

   ```
   $CONTENT_DIR/
   ├── en/              # English articles
   │   └── slug/
   │       ├── article.md
   │       └── images/
   ├── fr/              # French articles
   └── [other langs]/
   ```

   ## Validation Workflow

   Always validate articles against constitution:

   ### Before Publishing

   ```bash
   # 1. Validate quality (checks against .spec/blog.spec.json)
   /blog-optimize "lang/article-slug"

   # 2. Fix any issues reported
   # 3. Re-validate until all checks pass
   ```

   ### After Editing Existing Articles

   ```bash
   # Validate to ensure constitution compliance
   /blog-optimize "lang/article-slug"
   ```

   ## Commands That Use Constitution

   These commands automatically load and enforce `.spec/blog.spec.json`:

   - `/blog-generate` - Generates articles following constitution
   - `/blog-copywrite` - Creates spec-perfect copywriting
   - `/blog-optimize` - Validates against constitution rules
   - `/blog-translate` - Preserves tone across languages

   ## Updating the Constitution

   If you need to change blog guidelines:

   1. **Edit Constitution**:
      ```bash
      vim .spec/blog.spec.json
      ```

   2. **Validate JSON**:
      ```bash
      jq empty .spec/blog.spec.json
      ```

   3. **Regenerate This File** (if needed):
      ```bash
      /blog-analyse  # Re-analyzes and updates constitution
      ```

   ## Important Notes

   ⚠️  **Never Deviate from Constitution**

   - All articles MUST follow `.spec/blog.spec.json` guidelines
   - If you need different guidelines, update constitution first
   - Run `/blog-optimize` to verify compliance

   ✅ **Constitution is Dynamic**

   - You can update it anytime
   - Changes apply to all future articles
   - Re-validate existing articles after constitution changes

   📚 **Learn Your Style**

   - Constitution was generated from your existing content
   - It reflects YOUR blog's unique style
   - Follow it to maintain consistency

   ---

   **Pro Tip**: Keep this file and `.spec/blog.spec.json` in sync. If constitution changes, update this CLAUDE.md or regenerate it.
   CLAUDE_EOF
   ```

3. **Expand Variables**:
   ```bash
   # Replace $BLOG_NAME, $TONE, $LANGUAGES with actual values
   sed -i '' "s/\$BLOG_NAME/$BLOG_NAME/g" "$CONTENT_DIR/CLAUDE.md"
   sed -i '' "s/\$TONE/$TONE/g" "$CONTENT_DIR/CLAUDE.md"
   sed -i '' "s/\$LANGUAGES/$LANGUAGES/g" "$CONTENT_DIR/CLAUDE.md"
   sed -i '' "s/\$CONTENT_DIR/$CONTENT_DIR/g" "$CONTENT_DIR/CLAUDE.md"
   ```

4. **Inform User**:
   ```
   ✅ Created CLAUDE.md in $CONTENT_DIR/

   This file provides context-specific guidelines for article editing.
   It references .spec/blog.spec.json as the source of truth.

   When you work in $CONTENT_DIR/, Claude Code will automatically:
   - Load .spec/blog.spec.json rules
   - Follow voice guidelines
   - Validate against constitution
   ```

### Success Criteria

✅ CLAUDE.md created in content directory
✅ File references blog.spec.json as source of truth
✅ Voice guidelines included
✅ Tone explained
✅ Validation workflow documented
✅ User informed

## Token Optimization

**Load for Analysis**:
- Sample of 10 articles maximum (5k-10k tokens)
- Frontmatter + first 500 words per article
- Focus on extracting patterns, not full content

**DO NOT Load**:
- Full article content
- Images or binary files
- Generated reports (unless needed)
- Historical versions

**Total Context**: ~15k tokens maximum for analysis

## Error Handling

### No Content Found

```bash
if [ "$TOTAL_ARTICLES" -eq 0 ]; then
  echo "❌ No articles found in $CONTENT_DIR"
  echo "Please specify a valid content directory with .md or .mdx files"
  exit 1
fi
```

### Multiple Content Directories

```
Display list of found directories:
  1) articles/ (45 articles)
  2) content/ (12 articles)
  3) posts/ (8 articles)

Ask: "Which directory should I analyze? (1-3): "
Validate input
Use selected directory
```

### Insufficient Sample

```bash
if [ "$TOTAL_ARTICLES" -lt 3 ]; then
  echo "⚠️  Only $TOTAL_ARTICLES articles found"
  echo "Analysis may not be accurate with small sample"
  read -p "Continue anyway? (y/n): " confirm
  if [ "$confirm" != "y" ]; then
    exit 0
  fi
fi
```

### Cannot Detect Tone

```
If no clear tone emerges (all scores < 40%):
  Display detected patterns
  Ask user: "Which tone best describes your content?"
    1) Expert
    2) Pédagogique
    3) Convivial
    4) Corporate
  Use user selection
```

## Best Practices

### Analysis Quality

1. **Diverse Sample**: Analyze articles from different categories/languages
2. **Recent Content**: Prioritize newer articles (reflect current style)
3. **Representative Selection**: Avoid outliers (very short/long articles)

### Constitution Quality

1. **Specific Guidelines**: Extract concrete patterns, not generic advice
2. **Evidence-Based**: Each voice guideline should have examples from content
3. **Actionable**: Guidelines should be clear and enforceable

### User Experience

1. **Transparency**: Show what was analyzed and why
2. **Confidence Scores**: Indicate certainty of detections
3. **Manual Override**: Allow user to correct detections
4. **Review Prompt**: Encourage user to review and refine

## Output Location

**Constitution**: `.spec/blog.spec.json`
**Analysis Report**: `/tmp/blog-analysis-report.md`
**Sample Content**: `/tmp/content-analysis.txt` (cleaned up after)
**Scripts**: `/tmp/analyze-blog-$$.sh` (cleaned up after)

---

**Ready to analyze?** This agent reverse-engineers your blog's constitution from existing content automatically.
