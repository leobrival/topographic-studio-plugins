# Generate Blog Article

Complete end-to-end blog article generation workflow with specialized AI agents.

## Usage

```bash
/blog-generate "Your article topic here"
```

**Example**:
```bash
/blog-generate "Best practices for implementing observability in microservices"
```

## What This Command Does

Orchestrates three specialized agents in sequence to create a comprehensive, SEO-optimized blog article:

1. **Research Intelligence Agent** → Comprehensive research with 5-7 sources
2. **SEO Specialist Agent** → Keyword analysis and content structure
3. **Marketing Specialist Agent** → Final article with CTAs and engagement

**Total Time**: 30-45 minutes
**Token Usage**: ~200k tokens (agents isolated, main thread stays clean)

## Pre-flight Checks

Before starting the workflow, run system checks:

```bash
# Generate and execute preflight check script
bash scripts/preflight-check.sh || exit 1
```

**This checks**:
- ✅ curl (required for WebSearch/WebFetch)
- ⚠️  python3 (recommended for JSON validation)
- ⚠️  jq (optional for JSON parsing)
- 📁 Creates `.specify/` and `articles/` directories if missing
- 📄 Checks for blog constitution (`.spec/blog.spec.json`)

**If checks fail**: Install missing required tools before proceeding.

**If constitution exists**: Agents will automatically apply brand rules!

---

## Workflow

### Phase 1: Deep Research (15-20 min)

**Agent**: `research-intelligence`

**What It Does**:
- Decomposes your topic into 3-5 sub-questions
- Executes 5-7 targeted web searches
- Evaluates and fetches credible sources
- Cross-references findings
- Generates comprehensive research report

**Output**: `.specify/research/[topic]-research.md`

**Your Task**: Create a subagent conversation with the research-intelligence agent.

```
Prompt for subagent:

You are conducting deep research on the following topic for a blog article:

**Topic**: $ARGUMENTS

Follow your Three-Phase Process:
1. Strategic Planning - Decompose the topic into sub-questions
2. Autonomous Retrieval - Execute searches and gather sources
3. Synthesis - Generate comprehensive research report

Save your final report to: .specify/research/[SANITIZED-TOPIC]-research.md

Where [SANITIZED-TOPIC] is the topic converted to lowercase with spaces replaced by hyphens.

Begin your research now.
```

---

**CHECKPOINT**: Wait for research agent to complete. Verify that the research report exists and contains quality sources before proceeding.

---

### Phase 2: SEO Optimization (5-10 min)

**Agent**: `seo-specialist`

**What It Does**:
- Extracts target keywords from research
- Analyzes search intent
- Creates content structure (H2/H3 outline)
- Generates headline options
- Provides SEO recommendations

**Output**: `.specify/seo/[topic]-seo-brief.md`

**Your Task**: Create a subagent conversation with the seo-specialist agent.

```
Prompt for subagent:

You are creating an SEO content brief based on completed research.

**Research Report Path**: .specify/research/[SANITIZED-TOPIC]-research.md

Read the research report and follow your Four-Phase Process:
1. Keyword Analysis - Extract and validate target keywords
2. Search Intent - Determine what users want
3. Content Structure - Design H2/H3 outline with headline options
4. SEO Recommendations - Provide optimization guidance

Save your SEO brief to: .specify/seo/[SANITIZED-TOPIC]-seo-brief.md

Begin your analysis now.
```

---

**CHECKPOINT**: Review the SEO brief with the user.

Ask the user:
1. Is the target keyword appropriate for your goals?
2. Do the headline options resonate with your audience?
3. Does the content structure make sense?
4. Any adjustments needed before writing the article?

If user approves, proceed to Phase 3. If changes requested, regenerate SEO brief with adjustments.

---

### Phase 3: Content Creation (10-15 min)

**Agent**: `marketing-specialist`

**What It Does**:
- Loads research report and SEO brief (token-efficiently)
- Writes engaging introduction with hook
- Develops body content following SEO structure
- Integrates social proof (stats, quotes, examples)
- Places strategic CTAs (2-3 throughout)
- Polishes for readability and conversion
- Formats with proper frontmatter

**Output**: `articles/[topic].md`

**Your Task**: Create a subagent conversation with the marketing-specialist agent.

```
Prompt for subagent:

You are writing the final blog article based on research and SEO brief.

**Research Report**: .specify/research/[SANITIZED-TOPIC]-research.md
**SEO Brief**: .specify/seo/[SANITIZED-TOPIC]-seo-brief.md

Read both files (using token-efficient loading strategy from your instructions) and follow your Three-Phase Process:
1. Context Loading - Extract essential information only
2. Content Creation - Write engaging article following SEO structure
3. Polish - Refine for readability, engagement, and SEO

Save your final article to: articles/[SANITIZED-TOPIC].md

Begin writing now.
```

---

**CHECKPOINT**: Final review with user.

Display the completed article path and ask:
1. Would you like to review the article?
2. Any sections need revision?
3. Ready to publish or need changes?

**Options**:
- ✅ Approve and done
- 🔄 Request revisions (specify sections)
- ✨ Regenerate specific parts

---

## Error Handling

If any phase fails:

1. **Display error clearly**: "Phase [X] failed: [error message]"
2. **Show progress**: "Phases 1 and 2 completed successfully. Retrying Phase 3..."
3. **Offer retry**: "Would you like to retry [Phase X]?"
4. **Preserve work**: Don't delete outputs from successful phases
5. **Provide options**:
   - Retry automatically
   - Skip to next phase
   - Abort workflow

## Output Structure

After successful completion, you'll have:

```
.specify/
├── research/
│   └── [topic]-research.md        # 5k tokens, 5-7 sources
└── seo/
    └── [topic]-seo-brief.md       # 2k tokens, keywords + structure

articles/
└── [topic].md                     # Final article, fully optimized
```

## Tips for Success

1. **Be Specific**: Detailed topics work better
   - ✅ "Implementing observability in Node.js microservices with OpenTelemetry"
   - ❌ "Observability"

2. **Review Checkpoints**: Don't skip the review steps
   - SEO brief sets article direction
   - Early feedback saves time

3. **Use Subagent Power**: Each agent has full context window
   - They can process 50k-150k tokens each
   - Main thread stays under 1k tokens

4. **Iterate If Needed**: Use individual commands for refinement
   - `/blog-research` - Redo research only
   - `/blog-seo` - Regenerate SEO brief
   - `/blog-marketing` - Rewrite article

## Philosophy

This workflow follows the **"Burn tokens in workers, preserve main thread"** pattern:

- **Agents**: Process massive amounts of data in isolation
- **Main thread**: Stays clean with only orchestration commands
- **Result**: Unlimited processing power without context rot

## Next Steps

After generating article:
1. Review for accuracy and brand voice
2. Add any custom sections or examples
3. Optimize images and add alt text
4. Publish and promote
5. Track performance metrics

---

**Ready to start?** Provide your topic and I'll begin the workflow.
