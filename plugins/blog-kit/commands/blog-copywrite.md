# Blog Copywriting (Spec-Driven)

Rewrite or create content with strict adherence to blog constitution and brand voice guidelines.

## Usage

```bash
/blog-copywrite "topic-name"
```

**Example**:
```bash
/blog-copywrite "nodejs-tracing"
```

**Note**: Provide the sanitized topic name (same as article filename).

## Prerequisites

**Optional Files**:
- `.spec/blog.spec.json` - Blog constitution (highly recommended)
- `articles/[topic].md` - Existing article to rewrite (optional)
- `.specify/seo/[topic]-seo-brief.md` - SEO structure (optional)

**If no constitution exists**: Agent will use generic professional tone.

## What This Command Does

Delegates to the **copywriter** subagent for spec-driven content creation:

- **Constitution-First**: Loads and applies `.spec/blog.spec.json` requirements
- **Tone Precision**: Matches exact tone (expert/pédagogique/convivial/corporate)
- **Voice Compliance**: Enforces `voice_do` and avoids `voice_dont`
- **Review Rules**: Ensures `must_have` items and avoids `must_avoid`
- **Quality Focus**: Spec-perfect copy over marketing optimization

**Time**: 20-40 minutes
**Output**: `articles/[topic].md` (overwrites existing with backup)

## Difference from /blog-marketing

| Feature | /blog-marketing | /blog-copywrite |
|---------|----------------|-----------------|
| Focus | Conversion & CTAs | Spec compliance |
| Voice | Engaging, persuasive | Constitution-driven |
| When to use | New articles | Rewrite for brand consistency |
| Constitution | Optional influence | Mandatory requirement |
| CTAs | 2-3 strategic | Only if in spec |
| Tone freedom | High | Zero (follows spec exactly) |

**Use /blog-copywrite when**:
- Existing content violates brand voice
- Need perfect spec compliance
- Building content library with consistent voice
- Rewriting AI-generated content to match brand

**Use /blog-marketing when**:
- Need conversion-focused content
- Want CTAs and social proof
- Creating new promotional articles

## Instructions

Create a new subagent conversation with the `copywriter` agent.

**Provide the following prompt**:

```
You are creating spec-driven copy for a blog article.

**Topic**: $ARGUMENTS

**Your task**: Write (or rewrite) content that PERFECTLY matches blog constitution requirements.

Follow your Three-Phase Process:

1. **Constitution Deep-Load** (5-10 min):
   - Load .spec/blog.spec.json (if exists, otherwise use generic tone)
   - Extract: blog.name, blog.context, blog.objective, blog.tone, blog.languages
   - Internalize brand_rules.voice_do (guidelines to follow)
   - Internalize brand_rules.voice_dont (anti-patterns to avoid)
   - Load workflow.review_rules (must_have, must_avoid)

2. **Spec-Driven Content Creation** (20-40 min):
   - Apply tone exactly as specified:
     * expert → Technical, authoritative, assumes domain knowledge
     * pédagogique → Educational, patient, step-by-step
     * convivial → Friendly, conversational, relatable
     * corporate → Professional, business-focused, ROI-oriented

   - Check if article exists (articles/$ARGUMENTS.md):
     * If YES: Load structure, preserve data, rewrite for spec compliance
     * If NO: Load SEO brief (.specify/seo/$ARGUMENTS-seo-brief.md) for structure
     * If neither: Create logical structure based on topic

   - Write content following:
     * Every voice_do guideline applied
     * Zero voice_dont violations
     * All must_have items included
     * No must_avoid patterns

   - Backup existing article if rewriting:
     ```bash
     if [ -f "articles/$ARGUMENTS.md" ]; then
       cp "articles/$ARGUMENTS.md" "articles/$ARGUMENTS.backup-$(date +%Y%m%d-%H%M%S).md"
     fi
     ```

3. **Spec Compliance Validation** (10-15 min):
   - Generate validation script: /tmp/validate-voice-$$.sh
   - Check voice_dont violations (jargon, passive voice, vague claims)
   - Verify voice_do presence (guidelines applied)
   - Validate must_have items (summary, citations, insights)
   - Check must_avoid patterns (keyword stuffing, unsourced claims)
   - Calculate tone metrics (sentence length, technical terms, etc.)

**Output Location**: Save final article to `articles/$ARGUMENTS.md`

**Important**:
- Constitution is LAW - no creative liberty that violates specs
- If constitution missing, warn user and use professional tone
- Always backup before overwriting existing content
- Include spec compliance notes in frontmatter

Begin copywriting now.
```

## Expected Output

After completion, verify that `articles/[topic].md` exists and contains:

✅ **Perfect Tone Match**:
- Expert: Technical precision, industry terminology
- Pédagogique: Step-by-step, explained jargon, simple language
- Convivial: Conversational, personal pronouns, relatable
- Corporate: Professional, business value, ROI focus

✅ **Voice Compliance**:
- All `voice_do` guidelines applied throughout
- Zero `voice_dont` violations
- Consistent brand voice from intro to conclusion

✅ **Review Rules Met**:
- All `must_have` items present (summary, citations, insights)
- No `must_avoid` patterns (keyword stuffing, vague claims)
- Meets minimum quality thresholds

✅ **Spec Metadata** (in frontmatter):
```yaml
---
tone: "pédagogique"
spec_version: "1.0.0"
constitution_applied: true
---
```

## When to Use This Command

Use `/blog-copywrite` when you need to:

- ✅ **Rewrite off-brand content**: Fix articles that don't match voice
- ✅ **Enforce consistency**: Make all articles follow same spec
- ✅ **Convert AI content**: Transform generic AI output to branded copy
- ✅ **Create spec-perfect drafts**: New articles with zero voice violations
- ✅ **Audit compliance**: Rewrite to pass quality validation

**For marketing-focused content**: Use `/blog-marketing` instead.

## Constitution Required?

**With Constitution** (`.spec/blog.spec.json`):
```
✅ Exact tone matching
✅ Voice guidelines enforced
✅ Review rules validated
✅ Brand-perfect output
```

**Without Constitution**:
```
⚠️  Generic professional tone
⚠️  No brand voice enforcement
⚠️  Basic quality only
⚠️  Recommend running /blog-setup first
```

**Best practice**: Always create constitution first:
```bash
/blog-setup
```

## Tone Examples

### Expert Tone
```markdown
Distributed consensus algorithms fundamentally trade latency for
consistency guarantees. Raft's leader-based approach simplifies
implementation complexity compared to Paxos, achieving similar
safety properties while maintaining comprehensible state machine
replication semantics.
```

### Pédagogique Tone
```markdown
Think of consensus algorithms as voting systems for computers. When
multiple servers need to agree on something, they use a "leader" to
coordinate. Raft makes this simpler than older methods like Paxos,
while keeping your data safe and consistent.
```

### Convivial Tone
```markdown
Here's the thing about getting computers to agree: it's like
herding cats. Consensus algorithms are your herding dog. Raft is
the friendly retriever that gets the job done without drama,
unlike Paxos which is more like a border collie—effective but
complicated!
```

### Corporate Tone
```markdown
Organizations requiring distributed system reliability must
implement robust consensus mechanisms. Raft provides enterprise-
grade consistency with reduced operational complexity compared to
traditional Paxos implementations, optimizing both infrastructure
costs and engineering productivity.
```

## Quality Validation

After copywriting, validate quality:

```bash
/blog-optimize "topic-name"
```

This will check:
- Spec compliance
- Frontmatter correctness
- Markdown quality
- SEO elements

Fix any issues and re-run `/blog-copywrite` if needed.

## Backup and Recovery

Copywriter automatically backs up existing articles:

```bash
# List backups
ls articles/*.backup-*

# Restore from backup
cp articles/topic.backup-20250112-143022.md articles/topic.md

# Clean old backups (keep last 3)
ls -t articles/*.backup-* | tail -n +4 | xargs rm
```

## Tips

1. **Constitution first**: Create `.spec/blog.spec.json` before copywriting
2. **Be specific with voice**: Clear `voice_do` / `voice_dont` = better output
3. **Test tone**: Try each tone to find your brand's fit
4. **Iterate gradually**: Start generic, refine constitution, re-copywrite
5. **Validate after**: Always run `/blog-optimize` to check compliance

## Troubleshooting

### "No constitution found"
```bash
# Create constitution
/blog-setup

# Or copy example
mkdir -p .spec
cp examples/blog.spec.example.json .spec/blog.spec.json

# Then run copywriting
/blog-copywrite "topic-name"
```

### "Tone doesn't match"
```bash
# Check constitution tone setting
cat .spec/blog.spec.json | grep '"tone"'

# Update if needed, then re-run
/blog-copywrite "topic-name"
```

### "Voice violations"
```bash
# Review voice_dont guidelines
cat .spec/blog.spec.json | grep -A5 '"voice_dont"'

# Update guidelines if too strict
# Then re-run copywriting
```

## Workflow Integration

### Full Workflow with Copywriting

```bash
# 1. Setup (one-time)
/blog-setup

# 2. Research
/blog-research "topic"

# 3. SEO Brief
/blog-seo "topic"

# 4. Spec-Driven Copy (instead of marketing)
/blog-copywrite "topic"

# 5. Validate Quality
/blog-optimize "topic"

# 6. Publish
```

### Rewrite Existing Content

```bash
# Fix off-brand article
/blog-copywrite "existing-topic"

# Validate compliance
/blog-optimize "existing-topic"

# Compare before/after
diff articles/existing-topic.backup-*.md articles/existing-topic.md
```

---

**Ready to create spec-perfect copy?** Provide the topic name and execute this command.
