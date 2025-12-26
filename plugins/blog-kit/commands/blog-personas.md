# Blog Personas (ACTION)

Create detailed, behaviorally-validated audience personas for blog content targeting and strategy.

**100% ACTION**: This command generates complete persona JSON files with targeting recommendations, not just analysis.

## Usage

### Create New Persona

```bash
/blog-personas create "Freelance Developer"
```

### List All Personas

```bash
/blog-personas list
```

### Update Existing Persona

```bash
/blog-personas update "developer-freelance"
```

### Validate Persona

```bash
/blog-personas validate "developer-freelance"
```

## What This Command Does

Delegates to the **persona-specialist** subagent to create comprehensive audience personas using:

- **Jobs-to-be-Done Framework**: Understand why customers "hire" your content
- **Forces of Progress**: Map push/pull/anxiety/habit for each persona
- **Customer Awareness Stages**: Identify where they are in their journey (Unaware → Most Aware)
- **30 Elements of Value**: Determine top 5 values that matter most
- **Behavioral Validation**: Ground personas in real actions, not assumptions

**Time**: 15-30 minutes per persona
**Outputs**:
- `.spec/personas/[id].json` (complete persona) ✅ **ACTIONABLE**
- `.spec/personas/registry.json` (persona catalog) ✅
- `.specify/personas/[id]-report.md` (targeting guide) ✅

## Prerequisites

**Recommended** (but not required):
- Blog constitution (`.spec/blog.spec.json`) for context
- Behavioral evidence (customer interviews, support tickets, forum posts)
- Analytics data on current readers

**Minimum**: Clear description of target audience

## Instructions

Create a new subagent conversation with the `persona-specialist` agent.

### For: Create New Persona

**Provide the following prompt**:

```
You are creating a detailed audience persona for blog content targeting.

**Target Audience Description**: $ARGUMENTS

**Task**: Execute your Three-Phase Process to create a complete, behaviorally-validated persona.

**Phase 1: Discovery & Research** (10-15 min):
1. Load blog context from `.spec/blog.spec.json` (if exists)
2. Research audience behaviors using WebSearch:
   - Pain points and challenges
   - Solutions they've tried
   - Language they use
   - Communities they frequent
3. Identify behavioral patterns from research

**Phase 2: Persona Construction** (15-20 min):

Build comprehensive persona with 12 dimensions:

1. **Basic Profile**: Name, age, profession, background
2. **Current Situation**: State, feelings, influences, time spent
3. **Goals**: Dreams, life change, success vision, aspiration
4. **Blockers**: Main blocker, sources, duration, consequences, fears
5. **Jobs-to-be-Done**: Functional, emotional, social, context
6. **Forces of Progress**: Push, pull, anxiety, habit
7. **Awareness Stage**: One of 5 stages with specific moments
8. **Value Elements**: Top 5 from 30 Elements of Value
9. **Behavioral Patterns**: Actions, spending, current solution
10. **Content Preferences**: Post types, funnel stages, topics, tone
11. **Metadata**: Confidence, validation status, evidence source

**Phase 3: Output Generation** (5-10 min):

1. Create persona JSON at `.spec/personas/[persona-id].json`
   - Follow `.spec/personas/schema.json` structure exactly
   - Validate JSON syntax

2. Update registry at `.spec/personas/registry.json`
   - Add persona to list
   - Update metadata

3. Generate summary report at `.specify/personas/[persona-id]-report.md`
   - Executive summary
   - Key insights (JTBD, Forces)
   - Content strategy recommendations
   - Behavioral evidence
   - Article suggestions

**Important Guidelines**:
- Base on BEHAVIORAL EVIDENCE, not assumptions
- Use specific, concrete details (no vague language)
- Cite sources for behavioral patterns
- Calculate confidence level honestly
- Include validation next steps

**Persona ID Naming**:
- Lowercase, kebab-case
- Descriptive: "developer-freelance", "startup-founder", "enterprise-cto"

Begin persona creation now.
```

### For: List All Personas

**Provide the following prompt**:

```
List all existing personas in the blog.

**Task**: Read and display all personas from `.spec/personas/registry.json`.

If registry doesn't exist, display:
" No personas found. Create your first persona with: /blog-personas create"

If registry exists, display summary table:

```
## Blog Personas

| ID | Name | Awareness | Confidence | Validated | Created |
|----|------|-----------|------------|-----------|---------|
| developer-freelance | Alex Chen | solution-aware | 85% | ✅ | 2025-10-21 |
| startup-founder | Maria Rodriguez | product-aware | 78% | ✅ | 2025-10-22 |
| enterprise-cto | James Wong | most-aware | 65% | ❌ | 2025-10-22 |

**Total**: 3 personas (2 validated)

**Quick Actions**:
- View details: `cat .spec/personas/[id].json`
- View report: `cat .specify/personas/[id]-report.md`
- Update persona: `/blog-personas update "[id]"`
- Validate persona: `/blog-personas validate "[id]"`
```

For each persona, also show:
- Primary job-to-be-done
- Top value element
- Recommended content types
```

### For: Update Existing Persona

**Provide the following prompt**:

```
You are updating an existing persona based on new behavioral evidence or feedback.

**Persona ID**: $ARGUMENTS

**Task**:

1. Load existing persona from `.spec/personas/$ARGUMENTS.json`

2. Display current persona summary:
   - Name, age, profession
   - Main blocker
   - Job to be done
   - Awareness stage
   - Content preferences
   - Confidence and validation status

3. Ask user: "What would you like to update?"
   - Provide options:
     a) Add new behavioral evidence
     b) Update awareness stage
     c) Refine content preferences
     d) Update confidence/validation status
     e) Complete re-validation based on new data

4. Based on user input, update relevant sections

5. Increment version if major changes
   - Minor update: Keep version
   - Major update: Increment patch (1.0.0 → 1.0.1)

6. Update metadata:
   - `updated_at`: Today's date
   - `confidence`: Recalculate if evidence changed
   - `validated`: Update if validation status changed

7. Regenerate summary report with updates highlighted

8. Show diff:
   ```
   ## Changes Made

   **Updated Fields**:
   - awareness_stage: solution-aware → product-aware
   - confidence: 78% → 85%
   - behavioral_patterns.actions: Added 2 new behaviors

   **Updated Files**:
   - `.spec/personas/$ARGUMENTS.json`
   - `.specify/personas/$ARGUMENTS-report.md`
   - `.spec/personas/registry.json`
   ```

Begin update process now.
```

### For: Validate Persona

**Provide the following prompt**:

```
You are validating a persona against behavioral evidence and blog performance data.

**Persona ID**: $ARGUMENTS

**Task**: Run comprehensive validation checks

1. **Schema Validation**:
   - Load `.spec/personas/$ARGUMENTS.json`
   - Validate against `.spec/personas/schema.json`
   - Check all required fields present
   - Verify enum values correct

2. **Evidence Validation**:
   - Check `metadata.based_on` field
   - Verify confidence level justified
   - Assess quality of behavioral patterns
   - Review specificity (no vague language)

3. **Content Performance** (if analytics available):
   - Identify articles targeting this persona
   - Check engagement metrics
   - Compare to persona predictions
   - Validate content preferences

4. **Consistency Checks**:
   - JTBD aligns with goals/blockers?
   - Forces of Progress logically mapped?
   - Awareness stage matches moments?
   - Value elements match JTBD?
   - Content prefs align with awareness?

5. Generate validation report:

```markdown
# Persona Validation: [Name]

Validated: [Date]

## Schema Validation

 JSON Structure: PASSED
 Required Fields: PASSED (12/12)
 Enum Values: PASSED
 Data Types: PASSED

## Evidence Quality

**Confidence**: [X]%
**Based On**: [source]
**Validated**: [true/false]

 Behavioral Evidence: [PASSED/FAILED]
- Specific actions documented: ✅/❌
- Past spending quantified: ✅/❌
- Current solution described: ✅/❌

 Specificity: [PASSED/NEEDS IMPROVEMENT]
- No vague language: ✅/❌
- Concrete examples provided: ✅/❌
- Quantifiable details: ✅/❌

## Logical Consistency

 JTBD ↔ Goals/Blockers: [ALIGNED/MISALIGNED]
 Forces ↔ JTBD: [ALIGNED/MISALIGNED]
 Awareness ↔ Moments: [ALIGNED/MISALIGNED]
 Values ↔ JTBD: [ALIGNED/MISALIGNED]
 Content Prefs ↔ Awareness: [ALIGNED/MISALIGNED]

## Content Performance (if available)

**Articles Targeting This Persona**: [X]

| Article | Engagement | Predicted | Match |
|---------|------------|-----------|-------|
| [title] | High | High | ✅ |
| [title] | Low | High | ❌ |

**Overall Accuracy**: [X]%

## Recommendations

### Strengths
- [strength 1]
- [strength 2]

### Areas for Improvement
- [issue 1]: [how to fix]
- [issue 2]: [how to fix]

### Next Steps
- [ ] [validation action 1]
- [ ] [validation action 2]
- [ ] [validation action 3]

## Validation Score: [X]/100

**Status**: [VALIDATED ✅ | NEEDS WORK ⚠️ | INVALID ❌]
```

Save validation report to: `.specify/personas/$ARGUMENTS-validation.md`

Update registry if validation status changed.

Begin validation now.
```

## Expected Outputs

### For: Create New Persona

Three files generated:

#### 1. Persona JSON (`.spec/personas/[id].json`)

Complete persona profile following schema:
- 12 dimensions fully populated
- All fields with specific, concrete details
- Behavioral evidence throughout
- Content targeting recommendations
- Validation metadata

#### 2. Registry Entry (`.spec/personas/registry.json`)

Updated catalog with new persona:
- Persona metadata
- Quick reference stats
- Total count updated

#### 3. Summary Report (`.specify/personas/[id]-report.md`)

Comprehensive targeting guide:
- Executive summary
- Key insights (JTBD, Forces)
- Content strategy recommendations
- Behavioral evidence summary
- Article suggestions (3-5 ideas)
- Validation status and next steps

### For: List All Personas

Terminal output showing:
- Summary table of all personas
- Key stats per persona
- Total count and validation status
- Quick action commands

### For: Update Existing Persona

Updated files with changelog:
- Modified persona JSON
- Regenerated report
- Updated registry
- Diff showing changes

### For: Validate Persona

Validation report showing:
- Schema compliance
- Evidence quality
- Logical consistency
- Content performance (if available)
- Recommendations
- Validation score

## Integration with Blog Workflow

### Content Planning

Target specific persona when generating content:

```bash
# Research for specific persona
/blog-research "microservices logging" --persona developer-freelance

# Generate article targeting persona
/blog-generate "kubernetes tutorial" --persona developer-freelance
```

(Note: `--persona` flag support requires command updates)

### Article Frontmatter

Add persona targeting to article metadata:

```yaml
---
title: "Complete Guide to Kubernetes for Freelance Developers"
target_persona: "developer-freelance"
awareness_stage: "solution-aware"
post_type: "actionnable"
funnel_stage: "MOFU"
---
```

### Analytics & Validation

Track content performance by persona:

1. Tag articles with `target_persona`
2. Monitor engagement metrics
3. Update persona confidence based on performance
4. Iterate on content strategy per persona

### Category Targeting

Link categories to personas in `.category.json`:

```json
{
  "name": "Tutorials",
  "target_personas": ["developer-freelance", "startup-founder"],
  "awareness_stages": ["solution-aware", "product-aware"],
  "post_types": ["actionnable"],
  "funnel_stages": ["MOFU", "BOFU"]
}
```

## When to Use This Command

Use `/blog-personas` when you need to:

- **Define target audiences**: Create clear, actionable personas
- **Plan content strategy**: Understand what content resonates with whom
- **Improve targeting**: Make content more relevant to specific audiences
- **Validate assumptions**: Check if your audience understanding is correct
- **Segment readers**: Create fine-grained audience segments
- **Personalize content**: Write for specific jobs-to-be-done
- **Track performance**: Measure content success by persona

## Tips for Quality Personas

1. **Start with Behavioral Evidence**:
   - Interview 5-10 people in target audience
   - Analyze support tickets and forum posts
   - Review customer feedback and reviews
   - Watch user sessions if available

2. **Be Specific**:
   - Use real quotes and examples
   - Quantify everything possible
   - Avoid vague generalizations
   - Name specific tools, processes, people

3. **Focus on Jobs-to-be-Done**:
   - Why do they "hire" content?
   - What job is content helping with?
   - What's the context of the job?

4. **Map Forces Carefully**:
   - What's pushing them to change?
   - What's pulling them to solutions?
   - What anxieties hold them back?
   - What habits keep them stuck?

5. **Match Awareness Stage**:
   - Don't sell to unaware people
   - Educate solution-aware readers
   - Convert product-aware visitors
   - Close most-aware prospects

6. **Validate Continuously**:
   - Track content performance
   - Update based on new evidence
   - Interview more people
   - Test assumptions

## Troubleshooting

### "No behavioral evidence found"

**Cause**: Not enough research or too generic target
**Solution**:
- Conduct customer interviews
- Analyze forum discussions (Reddit, Quora)
- Review product reviews
- Check support tickets
- Make target audience more specific

### "Persona too vague"

**Cause**: Lack of specific details
**Solution**:
- Replace generalizations with specifics
- Add concrete examples
- Quantify everything
- Use real quotes from research

### "Low confidence score"

**Cause**: Insufficient validation
**Solution**:
- Interview more people
- Gather more behavioral data
- Test content with persona
- Update based on performance

### "Content doesn't resonate"

**Cause**: Mismatch between persona and reality
**Solution**:
- Validate awareness stage assumption
- Check JTBD accuracy
- Review value elements
- Update based on engagement data

## Example Workflow

### Complete Persona Creation

```bash
# 1. Create first persona
/blog-personas create "Freelance Full-Stack Developer"
# Agent creates: developer-freelance.json + report

# 2. Create second persona
/blog-personas create "Startup Technical Founder"
# Agent creates: startup-founder.json + report

# 3. List all personas
/blog-personas list
# Shows summary table

# 4. Review persona details
cat .spec/personas/developer-freelance.json
cat .specify/personas/developer-freelance-report.md

# 5. Use persona for content planning
# (Manually reference or wait for --persona flag support)

# 6. Track article performance
# Tag articles with target_persona in frontmatter

# 7. Validate persona after 10 articles
/blog-personas validate "developer-freelance"
# Agent generates validation report

# 8. Update persona based on performance
/blog-personas update "developer-freelance"
# Agent helps refine based on new data
```

## Related Commands

- `/blog-setup`: Creates blog constitution (provides context for personas)
- `/blog-analyse`: Analyzes content (can detect implicit personas)
- `/blog-generate`: Generates articles (can target specific personas)
- `/blog-marketing`: Creates marketing content (uses persona insights)

---

**Ready to create your first persona?** Start with: `/blog-personas create "Your Target Audience"`
