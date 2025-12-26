# Blog Setup

Interactive setup wizard to create blog constitution (`.spec/blog.spec.json`).

## Usage

```bash
/blog-setup
```

This command creates a bash script in `/tmp/` and executes it interactively to gather your blog configuration.

## What It Does

1. Generates interactive setup script in `/tmp/blog-kit-setup-[timestamp].sh`
2. Prompts for blog configuration (name, context, tone, voice rules)
3. Creates `.spec/blog.spec.json` with your configuration
4. Validates JSON structure
5. Creates `CLAUDE.md` in content directory (documents constitution as source of truth)
6. Cleans up temporary script

## Instructions

Generate and execute the following bash script:

```bash
# Generate unique script name
SCRIPT="/tmp/blog-kit-setup-$(date +%s).sh"

# Create interactive setup script
cat > "$SCRIPT" <<'SCRIPT_EOF'
#!/bin/bash

# Blog Kit Setup Wizard
# ======================

clear
echo "╔════════════════════════════════════════╗"
echo "║     Blog Kit - Setup Wizard            ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "This wizard will create .spec/blog.spec.json"
echo "with your blog configuration."
echo ""

# Prompt: Blog Name
echo "📝 Blog Configuration"
echo "─────────────────────"
read -p "Blog name: " blog_name

# Validate non-empty
while [ -z "$blog_name" ]; do
  echo "❌ Blog name cannot be empty"
  read -p "Blog name: " blog_name
done

# Prompt: Context
echo ""
read -p "Context (e.g., 'Tech blog for developers'): " context
while [ -z "$context" ]; do
  echo "❌ Context cannot be empty"
  read -p "Context: " context
done

# Prompt: Objective
echo ""
read -p "Objective (e.g., 'Generate qualified leads'): " objective
while [ -z "$objective" ]; do
  echo "❌ Objective cannot be empty"
  read -p "Objective: " objective
done

# Prompt: Tone
echo ""
echo "🎨 Select tone:"
echo "  1) Expert (technical, authoritative)"
echo "  2) Pédagogique (educational, patient)"
echo "  3) Convivial (friendly, casual)"
echo "  4) Corporate (professional, formal)"
read -p "Choice (1-4): " tone_choice

case $tone_choice in
  1) tone="expert" ;;
  2) tone="pédagogique" ;;
  3) tone="convivial" ;;
  4) tone="corporate" ;;
  *)
    echo "⚠️  Invalid choice, defaulting to 'pédagogique'"
    tone="pédagogique"
    ;;
esac

# Prompt: Languages
echo ""
read -p "Languages (comma-separated, e.g., 'fr,en'): " languages
languages=${languages:-"fr"}  # Default to fr if empty

# Prompt: Content Directory
echo ""
read -p "Content directory (default: articles): " content_dir
content_dir=${content_dir:-"articles"}  # Default to articles if empty

# Prompt: Voice DO
echo ""
echo "✅ Voice guidelines - DO"
echo "What should your content be?"
echo "Examples: Clear, Actionable, Engaging, Technical, Data-driven"
read -p "DO (comma-separated): " voice_do
while [ -z "$voice_do" ]; do
  echo "❌ Please provide at least one DO guideline"
  read -p "DO (comma-separated): " voice_do
done

# Prompt: Voice DON'T
echo ""
echo "❌ Voice guidelines - DON'T"
echo "What should your content avoid?"
echo "Examples: Jargon, Vague claims, Salesy language, Passive voice"
read -p "DON'T (comma-separated): " voice_dont
while [ -z "$voice_dont" ]; do
  echo "❌ Please provide at least one DON'T guideline"
  read -p "DON'T (comma-separated): " voice_dont
done

# Generate JSON
echo ""
echo "📄 Generating configuration..."

# Create .spec directory
mkdir -p .spec

# Convert comma-separated strings to JSON arrays
voice_do_json=$(echo "$voice_do" | sed 's/,\s*/","/g' | sed 's/^/"/' | sed 's/$/"/')
voice_dont_json=$(echo "$voice_dont" | sed 's/,\s*/","/g' | sed 's/^/"/' | sed 's/$/"/')
languages_json=$(echo "$languages" | sed 's/,\s*/","/g' | sed 's/^/"/' | sed 's/$/"/')

# Generate timestamp
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create JSON file
cat > .spec/blog.spec.json <<JSON_EOF
{
  "version": "1.0.0",
  "blog": {
    "name": "$blog_name",
    "context": "$context",
    "objective": "$objective",
    "tone": "$tone",
    "languages": [$languages_json],
    "content_directory": "$content_dir",
    "brand_rules": {
      "voice_do": [$voice_do_json],
      "voice_dont": [$voice_dont_json]
    }
  },
  "workflow": {
    "review_rules": {
      "must_have": [
        "Executive summary",
        "Source citations",
        "Actionable insights"
      ],
      "must_avoid": [
        "Unsourced claims",
        "Keyword stuffing",
        "Vague recommendations"
      ]
    }
  },
  "generated_at": "$timestamp"
}
JSON_EOF

# Validate JSON
echo ""
if command -v python3 >/dev/null 2>&1; then
  if python3 -m json.tool .spec/blog.spec.json > /dev/null 2>&1; then
    echo "✅ JSON validation passed"
  else
    echo "❌ JSON validation failed"
    echo "Please check .spec/blog.spec.json manually"
    exit 1
  fi
else
  echo "⚠️  python3 not found, skipping JSON validation"
  echo "   (Validation will happen when agents run)"
fi

# Generate CLAUDE.md in content directory
echo ""
echo "📄 Generating CLAUDE.md in content directory..."

# Create content directory if it doesn't exist
mkdir -p "$content_dir"

# Determine tone behavior based on selected tone
case $tone in
  "expert")
    tone_behavior="Technical depth, assumes reader knowledge, industry terminology"
    ;;
  "pédagogique")
    tone_behavior="Educational approach, step-by-step explanations, learning-focused"
    ;;
  "convivial")
    tone_behavior="Friendly and approachable, conversational style, personal touch"
    ;;
  "corporate")
    tone_behavior="Professional and formal, business-oriented, ROI-focused"
    ;;
esac

# Generate CLAUDE.md with constitution as source of truth
cat > "$content_dir/CLAUDE.md" <<CLAUDE_EOF
# Blog Content Directory

**Blog Name**: $blog_name
**Tone**: $tone

## Source of Truth: blog.spec.json

**IMPORTANT**: All content in this directory MUST follow \`.spec/blog.spec.json\` guidelines.

This file is your blog constitution - it defines:
- Voice and tone
- Brand rules (DO/DON'T)
- Content structure requirements
- Review and validation criteria

### Always Check Constitution First

Before creating or editing any article:

1. **Load Constitution**: \`cat .spec/blog.spec.json\`
2. **Verify tone matches**: $tone ($tone_behavior)
3. **Follow voice guidelines** (see below)
4. **Run validation**: \`/blog-optimize "lang/article-slug"\`

## Voice Guidelines (from Constitution)

### ✅ DO
$(echo "$voice_do" | sed 's/,\s*/\n- ✅ /g' | sed 's/^/- ✅ /')

### ❌ DON'T
$(echo "$voice_dont" | sed 's/,\s*/\n- ❌ /g' | sed 's/^/- ❌ /')

## Tone: $tone

**What this means**:
$tone_behavior

**How to apply**:
- Every article must reflect this tone consistently
- Use vocabulary and phrasing appropriate to this tone
- Maintain tone across all languages ($(echo "$languages" | sed 's/,/, /g'))

## Article Structure

Every article must include:

1. **Frontmatter** (YAML):
   - title
   - description
   - date
   - language
   - tags/categories

2. **Executive Summary**:
   - Key takeaways upfront
   - Clear value proposition

3. **Main Content**:
   - H2/H3 structured headings
   - Code examples (for technical topics)
   - Source citations (3-5 credible sources)

4. **Actionable Insights**:
   - 3-5 specific recommendations
   - Next steps for readers

5. **Images**:
   - Descriptive alt text (SEO + accessibility)
   - Optimized format (WebP recommended)

## Validation Workflow

**Before Publishing**:
\`\`\`bash
# Validate single article
/blog-optimize "lang/article-slug"

# Check translation coverage (if i18n)
/blog-translate "lang/article-slug" "target-lang"

# Optimize images
/blog-optimize-images "lang/article-slug"
\`\`\`

**Commands that Use Constitution**:
- \`/blog-generate\` - Generates content following constitution
- \`/blog-copywrite\` - Writes article using spec-kit + constitution
- \`/blog-optimize\` - Validates against constitution rules
- \`/blog-marketing\` - Creates marketing content with brand voice

## Updating Constitution

To update blog guidelines:

1. Edit \`.spec/blog.spec.json\` manually
2. Or run \`/blog-setup\` again (overwrites file)
3. Or run \`/blog-analyse\` to regenerate from existing content

**After updating constitution**:
- This CLAUDE.md file should be regenerated
- Validate existing articles: \`/blog-optimize\`
- Update voice guidelines as needed

## Important Notes

⚠️  **Never Deviate from Constitution**

All agents (research-intelligence, seo-specialist, marketing-specialist, etc.) are instructed to:
- Load \`.spec/blog.spec.json\` before generating content
- Apply voice_do/voice_dont guidelines strictly
- Match the specified tone: $tone
- Follow review_rules for validation

If constitution conflicts with a specific request, **constitution always wins**.
If you need different guidelines for a specific article, update the constitution first.

---

**Context**: $context
**Objective**: $objective
**Languages**: $(echo "$languages" | sed 's/,/, /g')
**Content Directory**: $content_dir

Generated by: \`/blog-setup\` command
Constitution: \`.spec/blog.spec.json\`
CLAUDE_EOF

echo "✅ CLAUDE.md created in $content_dir/"

# Success message
echo ""
echo "╔════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Files created:"
echo "  ✅ .spec/blog.spec.json (constitution)"
echo "  ✅ $content_dir/CLAUDE.md (content guidelines)"
echo ""
echo "Your blog: $blog_name"
echo "Tone: $tone"
echo "Content directory: $content_dir"
echo "Voice DO: $voice_do"
echo "Voice DON'T: $voice_dont"
echo ""
echo "Next steps:"
echo "  1. Review .spec/blog.spec.json"
echo "  2. Check $content_dir/CLAUDE.md for content guidelines"
echo "  3. Generate your first article: /blog-generate \"Your topic\""
echo ""
echo "All agents will use blog.spec.json as source of truth! 🎨"
echo ""

SCRIPT_EOF

# Make script executable
chmod +x "$SCRIPT"

# Execute script
bash "$SCRIPT"

# Capture exit code
EXIT_CODE=$?

# Clean up
rm "$SCRIPT"

# Report result
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Blog constitution and content guidelines created successfully!"
  echo ""
  echo "View your configuration:"
  echo "  cat .spec/blog.spec.json           # Constitution"
  echo "  cat [content-dir]/CLAUDE.md        # Content guidelines"
else
  echo "❌ Setup failed with exit code $EXIT_CODE"
  exit $EXIT_CODE
fi
```

## Expected Output

After running `/blog-setup`, you'll have:

**File 1**: `.spec/blog.spec.json` (Constitution)

**Example content**:
```json
{
  "version": "1.0.0",
  "blog": {
    "name": "Tech Insights",
    "context": "Technical blog for software developers",
    "objective": "Generate qualified leads and establish thought leadership",
    "tone": "pédagogique",
    "languages": ["fr", "en"],
    "content_directory": "articles",
    "brand_rules": {
      "voice_do": [
        "Clear",
        "Actionable",
        "Technical",
        "Data-driven"
      ],
      "voice_dont": [
        "Jargon without explanation",
        "Vague claims",
        "Salesy language"
      ]
    }
  },
  "workflow": {
    "review_rules": {
      "must_have": [
        "Executive summary",
        "Source citations",
        "Actionable insights"
      ],
      "must_avoid": [
        "Unsourced claims",
        "Keyword stuffing",
        "Vague recommendations"
      ]
    }
  },
  "generated_at": "2025-10-12T10:30:00Z"
}
```

**File 2**: `articles/CLAUDE.md` (Content Guidelines)

**Example content**:
```markdown
# Blog Content Directory

**Blog Name**: Tech Insights
**Tone**: pédagogique

## Source of Truth: blog.spec.json

**IMPORTANT**: All content in this directory MUST follow `.spec/blog.spec.json` guidelines.

### Always Check Constitution First

Before creating or editing any article:

1. **Load Constitution**: `cat .spec/blog.spec.json`
2. **Verify tone matches**: pédagogique (Educational approach, step-by-step explanations, learning-focused)
3. **Follow voice guidelines** (see below)
4. **Run validation**: `/blog-optimize "lang/article-slug"`

## Voice Guidelines (from Constitution)

### ✅ DO
- ✅ Clear
- ✅ Actionable
- ✅ Technical
- ✅ Data-driven

### ❌ DON'T
- ❌ Jargon without explanation
- ❌ Vague claims
- ❌ Salesy language

## Tone: pédagogique

**What this means**: Educational approach, step-by-step explanations, learning-focused

**How to apply**:
- Every article must reflect this tone consistently
- Use vocabulary and phrasing appropriate to this tone
- Maintain tone across all languages (fr, en)

## Article Structure

Every article must include:

1. **Frontmatter** (YAML): title, description, date, language, tags
2. **Executive Summary**: Key takeaways upfront
3. **Main Content**: H2/H3 structured headings, code examples, source citations
4. **Actionable Insights**: 3-5 specific recommendations
5. **Images**: Descriptive alt text (SEO + accessibility)

## Validation Workflow

**Before Publishing**:
```bash
/blog-optimize "lang/article-slug"
/blog-translate "lang/article-slug" "target-lang"
/blog-optimize-images "lang/article-slug"
```

**Commands that Use Constitution**:
- `/blog-generate` - Generates content following constitution
- `/blog-copywrite` - Writes article using spec-kit + constitution
- `/blog-optimize` - Validates against constitution rules
- `/blog-marketing` - Creates marketing content with brand voice

⚠️  **Never Deviate from Constitution**

All agents are instructed to load `.spec/blog.spec.json` and follow it strictly.
If constitution conflicts with a request, **constitution always wins**.
```

## What Happens Next

When you run `/blog-generate`, agents will automatically:
1. Check if `.spec/blog.spec.json` exists
2. Load brand rules (voice do/don't)
3. Apply your tone preference
4. Follow review rules
5. Generate content consistent with your brand

**No manual configuration needed!** ✨

## Updating Configuration

To update your configuration:
1. Edit `.spec/blog.spec.json` manually, or
2. Run `/blog-setup` again (overwrites existing file)

## Validation

The script validates JSON automatically if `python3` is available. If validation fails, agents will catch errors when loading the constitution.

## Tips

1. **Be specific with voice guidelines**: "Avoid jargon" → "Avoid jargon without explanation"
2. **Balance DO/DON'T**: Provide both positive and negative guidelines
3. **Test tone**: Generate a test article after setup to verify tone matches expectations
4. **Iterate**: Don't worry about perfection - you can edit `.spec/blog.spec.json` anytime

---

**Ready to set up your blog?** Run `/blog-setup` now!
