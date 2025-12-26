# Blog Research (ACTION)

Execute comprehensive research for blog article topic using the Research Intelligence specialist agent.

**100% ACTION**: This command generates an actionable article draft, not just a research report.

## Usage

```bash
/blog-research "Your article topic"
```

**Example**:
```bash
/blog-research "Implementing distributed tracing in Node.js with OpenTelemetry"
```

## What This Command Does

Delegates to the **research-intelligence** subagent to conduct deep, multi-source research AND generate article draft:

- Decomposes topic into 3-5 sub-questions
- Executes 5-7 targeted web searches
- Evaluates sources for credibility and relevance
- Cross-references findings
- Generates comprehensive research report with citations
- **Transforms findings into actionable article draft** (NEW)

**Time**: 15-20 minutes
**Outputs**:
- `.specify/research/[topic]-research.md` (research report)
- `articles/[topic]-draft.md` (article draft) ✅ **ACTIONABLE**

## Instructions

Create a new subagent conversation with the `research-intelligence` agent.

**Provide the following prompt**:

```
You are conducting deep research on the following topic for a blog article:

**Topic**: $ARGUMENTS

Follow your Four-Phase Process as documented in your agent instructions:

1. **Strategic Planning** (5-10 min):
   - Decompose the topic into sub-questions
   - Plan source strategy
   - Define success criteria

2. **Autonomous Retrieval** (10-20 min):
   - Execute targeted searches
   - Evaluate and fetch sources
   - Cross-reference findings
   - Apply quality filters

3. **Synthesis** (5-10 min):
   - Generate structured research report
   - Include executive summary
   - Document key findings with citations
   - Note contradictions/debates
   - Provide actionable insights

4. **Draft Generation** (10-15 min) ✅ NEW - ACTION PHASE:
   - Transform research findings into article draft
   - Create introduction with hook from research
   - Structure 3-5 main sections based on sub-questions
   - Integrate all findings into narrative
   - Include 5-7 source citations
   - Add concrete examples from sources
   - Write key takeaways summary
   - Target 1,500-2,000 words

**Output Locations**:
- Research report: `.specify/research/[SANITIZED-TOPIC]-research.md`
- Article draft: `articles/[SANITIZED-TOPIC]-draft.md` ✅ **ACTIONABLE**

**Sanitization Rules**:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Example: "Node.js Tracing" → "nodejs-tracing"

Begin your research now.
```

## Expected Outputs

After completion, verify that **TWO files** exist:

### 1. Research Report (`.specify/research/[topic]-research.md`)

 Executive summary with key takeaways
 Findings organized by sub-questions
 Minimum 5-7 credible sources cited
 Evidence with proper attribution
 Contradictions or debates (if any)
 Actionable insights (3-5 points)
 References section with full citations

### 2. Article Draft (✅ **ACTIONABLE** - `articles/[topic]-draft.md`)

 Title and meta description
 Introduction with hook from research (stat/quote/trend)
 3-5 main sections based on sub-questions
 All research findings integrated into narrative
 5-7 source citations in References section
 Concrete examples from case studies/sources
 Key takeaways summary at end
 1,500-2,000 words
 Frontmatter with status: "draft"

## Next Steps

After research completes:

1. **Review BOTH outputs**:
   - Check research report quality and coverage
   - **Review article draft** for accuracy and structure ✅
2. **Refine draft (optional)**:
   - Edit `articles/[topic]-draft.md` manually if needed
   - Or regenerate with more specific instructions
3. **Proceed to SEO**: Run `/blog-seo` to create content brief
4. **Or continue full workflow**: If this was part of `/blog-generate`, the orchestrator will proceed automatically

## When to Use This Command

Use `/blog-research` when you need to:

-  Redo research with different focus
-  Update research with newer sources
-  Add depth to existing research
-  Research only (without SEO/writing)

**For full workflow**: Use `/blog-generate` instead.

## Tips

1. **Be specific**: Detailed topics yield better research
2. **Check sources**: Review citations for quality
3. **Verify recency**: Ensure sources are recent (if topic is current)
4. **Note gaps**: If research misses something, you can request follow-up

## Error Handling

If research fails:
- Check if topic is clear and researchable
- Verify web search is available
- Try narrowing or broadening the topic
- Check `.specify/research/` directory exists

---

**Ready to start?** Provide your topic above and execute this command.
