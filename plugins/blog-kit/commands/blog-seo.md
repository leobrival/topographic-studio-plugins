# Blog SEO Optimization

Create SEO content brief based on completed research using the SEO Specialist agent.

## Usage

```bash
/blog-seo "topic-name"
```

**Example**:
```bash
/blog-seo "nodejs-tracing"
```

**Note**: Provide the sanitized topic name (same as used in research filename).

## Prerequisites

 **Required**: Research report must exist at `.specify/research/[topic]-research.md`

If research doesn't exist, run `/blog-research` first.

## What This Command Does

Delegates to the **seo-specialist** subagent to create comprehensive SEO content brief:

- Extracts target keywords from research
- Analyzes search intent
- Creates content structure (H2/H3 outline)
- Generates 5-7 headline options
- Provides SEO recommendations
- Identifies internal linking opportunities

**Time**: 5-10 minutes
**Output**: `.specify/seo/[topic]-seo-brief.md`

## Instructions

Create a new subagent conversation with the `seo-specialist` agent.

**Provide the following prompt**:

```
You are creating an SEO content brief based on completed research.

**Research Report Path**: .specify/research/$ARGUMENTS-research.md

Read the research report and follow your Four-Phase Process:

1. **Keyword Analysis** (3-5 min):
   - Extract keyword candidates from research
   - Validate with web search (if available)
   - Select 1 primary + 3-5 secondary keywords
   - Identify 5-7 LSI keywords

2. **Search Intent Determination** (5-7 min):
   - Analyze top-ranking articles (if WebSearch available)
   - Classify intent (Informational/Navigational/Transactional)
   - Determine content format

3. **Content Structure Creation** (7-10 min):
   - Generate 5-7 headline options
   - Create H2/H3 outline covering all research topics
   - Write meta description (155 chars max)
   - Identify internal linking opportunities

4. **SEO Recommendations** (3-5 min):
   - Content length guidance
   - Keyword density targets
   - Image optimization suggestions
   - Schema markup recommendations
   - Featured snippet opportunities

**Output Location**: Save your SEO brief to `.specify/seo/$ARGUMENTS-seo-brief.md`

Begin your analysis now.
```

## Expected Output

After completion, verify that `.specify/seo/[topic]-seo-brief.md` exists and contains:

 Target keywords (primary, secondary, LSI)
 Search intent classification
 5-7 headline options with recommendation
 Complete content structure (H2/H3 outline)
 Meta description (under 155 characters)
 SEO recommendations (length, density, images, schema)
 Internal linking opportunities
 Competitor insights summary

## Review Checklist

Before proceeding to content creation, review:

1. **Keywords**: Are they appropriate for your goals?
2. **Headlines**: Do they resonate with your audience?
3. **Structure**: Does the H2/H3 outline make sense?
4. **Intent**: Does it match what you want to target?
5. **Length**: Is the target word count realistic?

## Next Steps

After SEO brief is approved:

1. **Proceed to writing**: Run `/blog-marketing` to create final article
2. **Or continue full workflow**: If this was part of `/blog-generate`, the orchestrator will proceed automatically

## When to Use This Command

Use `/blog-seo` when you need to:

-  Regenerate SEO brief with different angle
-  Update keywords for different target
-  Adjust content structure
-  Create brief only (without writing article)

**For full workflow**: Use `/blog-generate` instead.

## Tips

1. **Review headlines carefully**: They drive CTR and engagement
2. **Check structure depth**: Too shallow? Too deep?
3. **Validate intent**: Wrong intent = wrong audience
4. **Consider competition**: Can you realistically rank?

## Requesting Changes

If SEO brief needs adjustments, you can:
- Specify different primary keyword
- Request alternative headline approaches
- Adjust content structure (more/fewer sections)
- Change target word count

Just provide feedback and re-run the command with clarifications.

## Error Handling

If SEO analysis fails:
- Verify research report exists
- Check file path is correct
- Ensure research contains sufficient content
- Try providing more specific guidance

---

**Ready to start?** Provide the topic name (from research filename) and execute this command.
