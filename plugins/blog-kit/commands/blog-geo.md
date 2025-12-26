# Blog GEO Optimization

Create GEO (Generative Engine Optimization) content brief based on completed research using the GEO Specialist agent.

## Usage

```bash
/blog-geo "topic-name"
```

**Example**:
```bash
/blog-geo "nodejs-tracing"
```

**Note**: Provide the sanitized topic name (same as used in research filename).

## What is GEO?

**GEO (Generative Engine Optimization)** is the academic and industry-standard term for optimizing content for AI-powered search engines. Formally introduced in **November 2023** by researchers from **Princeton University, Georgia Tech, Allen Institute for AI, and IIT Delhi**.

**Target Platforms**:
- ChatGPT (with web search)
- Perplexity AI
- Google AI Overviews
- Gemini
- Claude (with web access)
- Bing Copilot

**Proven Results**:
- **30-40% visibility improvement** in AI responses
- **1,200% growth** in AI-sourced traffic (July 2024 - February 2025)
- **27% conversion rate** from AI traffic vs 2.1% from standard search
- **3.2x more citations** for content updated within 30 days

**Source**: Princeton Study + 29 industry research papers (2023-2025)

### GEO vs SEO

| Aspect | SEO | GEO |
|--------|-----|-----|
| **Target** | Search crawlers | Large Language Models |
| **Goal** | SERP ranking | AI citation & source attribution |
| **Focus** | Keywords, backlinks | E-E-A-T, citations, quotations |
| **Optimization** | Meta tags, H1 | Quotable facts, statistics, sources |
| **Success Metric** | Click-through rate | Citation frequency |
| **Freshness** | Domain-dependent | Critical (3.2x impact) |

**Why Both Matter**: Traditional SEO gets you found via Google/Bing. GEO gets you cited by AI assistants.

**Top 3 GEO Methods** (Princeton Study):
1. **Cite Sources**: 115% visibility increase for lower-ranked sites
2. **Add Quotations**: Especially effective for People & Society topics
3. **Include Statistics**: Most beneficial for Law/Government content

## Prerequisites

 **Required**: Research report must exist at `.specify/research/[topic]-research.md`

If research doesn't exist, run `/blog-research` first.

## What This Command Does

Delegates to the **geo-specialist** subagent to create comprehensive GEO content brief:

- Applies Princeton Top 3 methods (cite sources, add quotations, include statistics)
- Assesses source authority and E-E-A-T signals
- Optimizes content structure for AI parsing
- Identifies quotable statements for AI citations
- Ensures comprehensive topic coverage
- Provides AI-readable formatting recommendations
- Recommends schema markup for discoverability (near-essential)

**Time**: 10-15 minutes
**Output**: `.specify/geo/[topic]-geo-brief.md`

## Instructions

Create a new subagent conversation with the `geo-specialist` agent.

**Provide the following prompt**:

```
You are creating a GEO (Generative Engine Optimization) content brief based on completed research.

**Research Report Path**: .specify/research/$ARGUMENTS-research.md

Read the research report and follow your Four-Phase GEO Process:

1. **Source Authority Analysis + Princeton Methods** (5-7 min):
   - **Apply Top 3 Princeton Methods** (30-40% visibility improvement):
     * Cite Sources (115% increase for lower-ranked sites)
     * Add Quotations (best for People & Society domains)
     * Include Statistics (best for Law/Government topics)
   - Assess E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)
   - Check content freshness (3.2x more citations for 30-day updates)
   - Score overall authority potential (X/10)

2. **Structured Content Optimization** (7-10 min):
   - Create AI-parseable H1/H2/H3 outline
   - Extract key facts as quotable statements
   - Structure sections as questions where appropriate
   - Recommend schema.org markup (Article, HowTo, FAQPage) - near-essential

3. **Context and Depth Assessment** (7-10 min):
   - Verify comprehensive topic coverage
   - Identify gaps to fill
   - Ensure technical terms are defined
   - Recommend multi-perspective coverage (pros/cons, use cases)

4. **AI Citation Optimization** (5-7 min):
   - Identify 5-7 quotable key statements
   - Ensure facts are clear and self-contained
   - Highlight unique value propositions
   - Add date/version indicators for freshness

**Output Location**: Save your GEO brief to `.specify/geo/$ARGUMENTS-geo-brief.md`

**Important**: If research quality is insufficient (< 3 credible sources) or topic structure is ambiguous, use the User Decision Cycle to involve the user.

Begin your analysis now.
```

## Expected Output

After completion, verify that `.specify/geo/[topic]-geo-brief.md` exists and contains:

 **Authority Assessment**: Credibility score + improvement recommendations
 **AI-Optimized Outline**: Clear H1/H2/H3 structure with question-format headings
 **Quotable Statements**: 5-7 key facts that AI can cite
 **Context Analysis**: Topic coverage assessment + gaps identified
 **Schema Recommendations**: Article, HowTo, FAQPage, etc.
 **Metadata Guidance**: Title, description, tags optimized for AI understanding
 **Citation Strategy**: Unique value propositions + formatting recommendations
 **GEO Checklist**: 20+ criteria for AI discoverability

## Review Checklist

Before proceeding to content creation, review:

1. **Authority**: Are sources credible enough for AI citation?
2. **Structure**: Is the outline clear and AI-parseable?
3. **Quotables**: Are key statements citation-worthy?
4. **Depth**: Does coverage satisfy comprehensive AI queries?
5. **Unique Value**: What makes this content worth citing?

## How GEO Brief Guides Content

The marketing agent will use your GEO brief to:

- **Structure Content**: Follow AI-optimized H2/H3 outline
- **Embed Quotables**: Place key statements prominently
- **Add Context**: Define terms, provide examples
- **Apply Schema**: Implement recommended markup
- **Cite Sources**: Properly attribute external research
- **Format for AI**: Use lists, tables, clear statements

**Result**: Content optimized for BOTH human readers AND AI citation.

## Next Steps

After GEO brief is approved:

1. **Proceed to writing**: Run `/blog-marketing` to create final article
2. **Or continue full workflow**: If this was part of `/blog-generate`, the orchestrator will proceed automatically

**Note**: For complete AI optimization, consider running BOTH `/blog-seo` (traditional search) AND `/blog-geo` (AI search).

## When to Use This Command

Use `/blog-geo` when you need to:

-  Optimize content for AI-powered search engines
-  Maximize likelihood of AI citation
-  Ensure content is authoritative and comprehensive
-  Structure content for easy AI parsing
-  Create AI-discoverable content brief only (without writing article)

**For full workflow**: Use `/blog-generate` (which can include GEO phase).

## Comparison: SEO vs GEO Briefs

| Feature | SEO Brief | GEO Brief |
|---------|-----------|-----------|
| **Keywords** | Primary + secondary + LSI | Natural language topics |
| **Structure** | H2/H3 for readability | H2/H3 as questions for AI |
| **Focus** | SERP ranking factors | Citation worthiness |
| **Meta** | Title tags, descriptions | Schema markup, structured data |
| **Success** | Click-through rate | AI citation frequency |
| **Length** | Word count targets | Comprehensiveness targets |
| **Links** | Backlink strategy | Source attribution strategy |

**Recommendation**: Create BOTH briefs for comprehensive discoverability.

## Tips for Maximum GEO Impact

### 1. Authority Signals
- Cite 5-7 credible sources in research
- Include expert quotes
- Add author bio with credentials
- Link to authoritative external sources

### 2. AI-Friendly Structure
- Use questions as H2 headings ("What is X?", "How to Y?")
- Place key facts in bulleted lists
- Add tables for comparisons
- Include FAQ section

### 3. Quotable Statements
- Make claims clear and self-contained
- Provide context so quotes make sense alone
- Use precise language (avoid ambiguity)
- Bold or highlight key data points

### 4. Comprehensive Coverage
- Answer related questions
- Address common misconceptions
- Provide examples for abstract concepts
- Include pros/cons and alternatives

### 5. Freshness Indicators
- Date published/updated
- Version numbers (if applicable)
- "As of [date]" for time-sensitive info
- Indicate currency of information

## Requesting Changes

If GEO brief needs adjustments, you can:
- Request deeper coverage on specific topics
- Ask for additional quotable statements
- Adjust authority recommendations
- Modify content structure
- Request different schema markup

Just provide feedback and re-run the command with clarifications.

## Error Handling

If GEO analysis fails:
- Verify research report exists
- Check research has 3+ credible sources
- Ensure research contains sufficient content
- Try providing more specific guidance about target audience

### Common Issues

**"Insufficient source authority"**
- Research needs more credible sources
- Add academic papers, official docs, or expert blogs
- Re-run `/blog-research` with better sources

**"Topic structure ambiguous"**
- Agent will ask for user decision
- Clarify whether to focus on depth or breadth
- Specify target audience technical level

**"Missing context for AI understanding"**
- Research may be too technical without explanations
- Add definitions and examples
- Ensure prerequisites are stated

## Integration with Full Workflow

### Option 1: GEO Only
```bash
# Research → GEO → Write
/blog-research "topic"
/blog-geo "topic"
/blog-marketing "topic"  # Marketing agent uses GEO brief
```

### Option 2: SEO + GEO (Recommended)
```bash
# Research → SEO → GEO → Write
/blog-research "topic"
/blog-seo "topic"         # Traditional search optimization
/blog-geo "topic"         # AI search optimization
/blog-marketing "topic"   # Marketing agent uses BOTH briefs
```

### Option 3: Full Automated
```bash
# Generate command can include GEO
/blog-generate "topic"    # Optionally include GEO phase
```

**Note**: Marketing agent is smart enough to merge SEO and GEO briefs when both exist.

## Real-World GEO Examples

### What Works Well for AI Citation

 **Clear Definitions**
> "Distributed tracing is a method of tracking requests across microservices to identify performance bottlenecks and failures."

 **Data Points with Context**
> "According to a 2024 study by Datadog, applications with tracing experience 40% faster incident resolution compared to those relying solely on logs."

 **Structured Comparisons**
| Feature | Logging | Tracing |
|---------|---------|---------|
| Scope | Single service | Cross-service |
| Use case | Debugging | Performance |

 **Question-Format Headings**
> ## How Does OpenTelemetry Compare to Proprietary Solutions?

 **Actionable Recommendations**
> "Start with 10% sampling in production environments to minimize overhead while maintaining visibility into application behavior."

### What Doesn't Work

 **Vague Claims**
> "Tracing is important for modern applications."

 **Keyword Stuffing**
> "Node.js tracing nodejs tracing best practices nodejs application tracing guide..."

 **Buried Facts**
> Long paragraphs with key information not highlighted

 **Outdated Information**
> Content without publication/update dates

 **Unsourced Statistics**
> "Most developers prefer X" (without citation)

## Success Metrics

Track these indicators after publication:

1. **AI Citation Rate**: Monitor if content is cited by ChatGPT, Perplexity, etc.
2. **Source Attribution**: Frequency of being named as source in AI responses
3. **Query Coverage**: Number of related queries your content answers
4. **Freshness**: How recently updated (AI systems prefer recent)
5. **Authority Signals**: Backlinks from other authoritative sites

**Tools**: No established GEO tracking tools yet. Manual testing:
- Ask ChatGPT about your topic → check if you're cited
- Search in Perplexity → verify source attribution
- Use Claude with web access → monitor citations

## Future-Proofing

GEO best practices are evolving. Focus on fundamentals:

1. **Accuracy**: Factual correctness is paramount
2. **Authority**: Build credibility gradually
3. **Structure**: Clear, organized content
4. **Comprehensiveness**: Thorough topic coverage
5. **Freshness**: Regular updates

These principles will remain valuable regardless of how AI search evolves.

---

**Ready to optimize for AI search?** Provide the topic name (from research filename) and execute this command.

## Additional Resources

- **GEO Research**: Check latest posts on AI search optimization
- **Schema.org**: Reference for structured data markup
- **OpenAI/Anthropic**: Monitor changes to citation behavior
- **Perplexity Blog**: Insights on source selection algorithms

---

## Research Foundation

This GEO command is based on comprehensive research from:

**Academic Foundation**:
- Princeton University, Georgia Tech, Allen Institute for AI, IIT Delhi (November 2023)
- Presented at ACM SIGKDD Conference (August 2024)
- GEO-bench benchmark study (10,000 queries across diverse domains)

**Key Research Findings**:
- 30-40% visibility improvement through Princeton's Top 3 methods
- 1,200% growth in AI-sourced traffic (July 2024 - February 2025)
- 27% conversion rate from AI traffic vs 2.1% from standard search
- 3.2x more citations for content updated within 30 days
- 115% visibility increase for lower-ranked sites using citations

**Industry Analysis**:
- Analysis of 17 million AI citations (Ahrefs study)
- Platform-specific citation patterns (ChatGPT, Perplexity, Google AI Overviews)
- 29 cited research studies (2023-2025)
- Case studies: 800-2,300% traffic increases, real conversion data

For full research report, see: `.specify/research/gso-geo-comprehensive-research.md`
