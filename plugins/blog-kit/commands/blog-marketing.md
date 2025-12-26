# Blog Marketing & Content Creation

Write final blog article based on research and SEO brief using the Marketing Specialist agent.

## Usage

```bash
/blog-marketing "topic-name"
```

**Example**:
```bash
/blog-marketing "nodejs-tracing"
```

**Note**: Provide the sanitized topic name (same as used in research and SEO filenames).

## Prerequisites

 **Required Files**:
1. Research report: `.specify/research/[topic]-research.md`
2. SEO brief: `.specify/seo/[topic]-seo-brief.md`

If either doesn't exist, run `/blog-research` and `/blog-seo` first.

## What This Command Does

Delegates to the **marketing-specialist** subagent to create final, polished article:

- Loads research and SEO brief (token-efficiently)
- Writes engaging introduction with hook
- Develops body content following SEO structure
- Integrates social proof (stats, quotes, examples)
- Places strategic CTAs (2-3 throughout)
- Creates FAQ section with schema optimization
- Writes compelling conclusion
- Polishes for readability and conversion
- Formats with proper frontmatter

**Time**: 10-15 minutes
**Output**: `articles/[topic].md`

## Instructions

Create a new subagent conversation with the `marketing-specialist` agent.

**Provide the following prompt**:

```
You are writing the final blog article based on research and SEO brief.

**Research Report**: .specify/research/$ARGUMENTS-research.md
**SEO Brief**: .specify/seo/$ARGUMENTS-seo-brief.md

Read both files using your token-efficient loading strategy (documented in your instructions) and follow your Three-Phase Process:

1. **Context Loading** (3-5 min):
   - Extract ONLY essential information from research (key findings, quotes, sources)
   - Extract ONLY essential information from SEO brief (keywords, structure, meta)
   - Build mental model of target audience and goals

2. **Content Creation** (20-30 min):
   - Write engaging introduction (150-200 words)
     * Hook (problem/question/stat)
     * Promise (what reader will learn)
     * Credibility signal
   - Develop body content following SEO brief structure
     * Each H2 section with clear value
     * H3 subsections for depth
     * Mix of paragraphs, lists, and formatting
   - Integrate social proof throughout
     * Statistics from research
     * Expert quotes
     * Real-world examples
   - Place 2-3 strategic CTAs
     * Primary CTA (after intro or in conclusion)
     * Secondary CTAs (mid-article)
   - Create FAQ section (if in SEO brief)
     * Direct, concise answers (40-60 words each)
   - Write compelling conclusion
     * Summary of 3-5 key takeaways
     * Reinforce main message
     * Strong final CTA

3. **Polish** (5-10 min):
   - Readability check (varied sentences, active voice, short paragraphs)
   - Engagement review (questions, personal pronouns, power words)
   - SEO compliance (keyword placement, structure, links)
   - Conversion optimization (CTAs, value prop, no friction)

**Output Location**: Save your final article to `articles/$ARGUMENTS.md`

**Important**: Use proper markdown frontmatter format with all required fields (title, description, keywords, author, date, etc.).

Begin writing now.
```

## Expected Output

After completion, verify that `articles/[topic].md` exists and contains:

 Complete frontmatter (title, description, keywords, author, date, etc.)
 Engaging introduction with hook and promise
 All H2/H3 sections from SEO brief
 Primary keyword in title, intro, headings
 Secondary keywords distributed naturally
 Social proof integrated (5-7 citations)
 2-3 well-placed CTAs
 FAQ section (if in SEO brief)
 Conclusion with key takeaways
 Sources/references section
 Internal linking suggestions
 Target word count achieved (±10%)

## Quality Checklist

Before finalizing, review:

1. **Accuracy**: Facts match research sources?
2. **Brand Voice**: Tone appropriate for audience?
3. **Readability**: Easy to scan and understand?
4. **SEO**: Keywords natural, not forced?
5. **Engagement**: Interesting and actionable?
6. **CTAs**: Clear and compelling?
7. **Formatting**: Proper markdown, good structure?

## Next Steps

After article is generated:

1. **Review**: Read through for quality and accuracy
2. **Refine**: Request changes if needed (specific sections)
3. **Enhance**: Add custom examples, images, diagrams
4. **Publish**: Copy to your blog/CMS
5. **Promote**: Share on social media, newsletters
6. **Track**: Monitor performance metrics

## When to Use This Command

Use `/blog-marketing` when you need to:

-  Rewrite article with different angle
-  Adjust tone or style
-  Add/remove sections
-  Improve specific parts (intro, conclusion, CTAs)
-  Write only (without research/SEO phases)

**For full workflow**: Use `/blog-generate` instead.

## Tips

1. **Review intro carefully**: First impression matters
2. **Check CTA placement**: Natural or forced?
3. **Verify sources cited**: All major claims backed?
4. **Test readability**: Ask someone to scan it
5. **Compare to SEO brief**: Did it follow structure?

## Requesting Revisions

If article needs changes, be specific:
- "Make introduction more engaging with a stronger hook"
- "Add more technical depth to section on [topic]"
- "Reduce jargon in [section name]"
- "Strengthen conclusion CTA"

Provide clear feedback and re-run with adjustments.

## Common Adjustments

**Too Technical**: "Simplify language for non-experts"
**Too Basic**: "Add more technical depth and examples"
**Wrong Tone**: "Make more conversational/professional"
**Missing CTAs**: "Add stronger calls-to-action"
**Too Long**: "Reduce to [X] words, keeping core value"

## Error Handling

If content creation fails:
- Verify both research and SEO files exist
- Check file paths are correct
- Ensure SEO brief has complete structure
- Review research for sufficient content

---

**Ready to start?** Provide the topic name and execute this command.
