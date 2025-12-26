# Blog Quality Optimization

Validate article quality with automated checks for frontmatter, markdown formatting, and spec compliance.

## Usage

### Single Article (Recommended)

```bash
/blog-optimize "lang/article-slug"
```

**Examples**:
```bash
/blog-optimize "en/nodejs-tracing"
/blog-optimize "fr/microservices-logging"
```

**Token usage**: ~10k-15k tokens per article

### Global Validation (⚠️  High Token Usage)

```bash
/blog-optimize
```

**⚠️  WARNING**: This will validate ALL articles in your content directory.

**Token usage**: 50k-500k+ tokens (depending on article count)
**Cost**: Can be expensive (e.g., 50 articles = ~500k tokens)
**Duration**: 20-60 minutes for large blogs
**Use case**: Initial audit, bulk validation, CI/CD pipelines

**Recommendation**: Validate articles individually unless you need a full audit.

## Prerequisites

✅ **Required**: Article must exist at `articles/[topic].md`

If article doesn't exist, run `/blog-generate` or `/blog-marketing` first.

## What This Command Does

Delegates to the **quality-optimizer** subagent to validate article quality:

- **Spec Compliance**: Validates against `.spec/blog.spec.json` requirements
- **Frontmatter Structure**: Checks required fields and format
- **Markdown Quality**: Validates syntax, headings, links, code blocks
- **SEO Elements**: Checks meta description, keywords, internal links
- **Readability**: Analyzes sentence length, paragraph size, passive voice
- **Brand Voice**: Validates against `voice_dont` anti-patterns

**Time**: 10-15 minutes
**Output**: `.specify/quality/[topic]-validation.md`

## Instructions

Create a new subagent conversation with the `quality-optimizer` agent.

**Provide the following prompt**:

```
You are validating the quality of a blog article.

**Article Path**: articles/$ARGUMENTS.md

Follow your Three-Phase Process:

1. **Spec Compliance Validation** (5-7 min):
   - Generate validation script in /tmp/validate-spec-$$.sh
   - Load .spec/blog.spec.json (if exists)
   - Check frontmatter required fields
   - Validate review_rules compliance (must_have, must_avoid)
   - Check brand voice anti-patterns (voice_dont)
   - Run script and capture results

2. **Markdown Quality Validation** (5-10 min):
   - Generate validation script in /tmp/validate-markdown-$$.sh
   - Check heading hierarchy (one H1, proper nesting)
   - Validate link syntax (no broken links)
   - Check code blocks (properly closed, language tags)
   - Verify images have alt text
   - Run script and capture results

3. **SEO and Performance Validation** (3-5 min):
   - Generate validation script in /tmp/validate-seo-$$.sh
   - Check meta description length (150-160 chars)
   - Validate keyword presence in critical locations
   - Count internal links (minimum 3 recommended)
   - Calculate readability metrics
   - Run script and capture results

**Output Location**: Save comprehensive validation report to `.specify/quality/$ARGUMENTS-validation.md`

**Important**:
- All scripts must be generated in /tmp/ (never pollute project directory)
- Scripts are non-destructive (read-only operations)
- Provide actionable fixes for all issues found
- Include metrics and recommendations in report

Begin validation now.
```

## Expected Output

After completion, verify that `.specify/quality/[topic]-validation.md` exists and contains:

✅ **Passed Checks Section**:
- List of all successful validations
- Green checkmarks for passing items

✅ **Warnings Section**:
- Non-critical issues that should be addressed
- Improvement suggestions

✅ **Critical Issues Section**:
- Must-fix problems before publishing
- Clear descriptions of what's wrong

✅ **Metrics Dashboard**:
- Frontmatter completeness
- Content structure statistics
- SEO metrics
- Readability scores

✅ **Recommended Fixes**:
- Prioritized list (critical first)
- Code snippets for fixes
- Step-by-step instructions

✅ **Validation Scripts**:
- List of generated scripts in /tmp/
- Instructions for manual review/cleanup

## Interpreting Results

### ✅ All Checks Passed

```
✅ Passed Checks (12/12)

No issues found! Article is ready to publish.
```

**Next Steps**: Review the article one final time and publish.

### ⚠️  Warnings Only

```
✅ Passed Checks (10/12)
⚠️  Warnings (2)

- Only 2 internal links (recommend 3+)
- Keyword density 2.3% (slightly high)
```

**Next Steps**: Address warnings if possible, then publish (warnings are optional improvements).

### ❌ Critical Issues

```
✅ Passed Checks (8/12)
⚠️  Warnings (1)
❌ Critical Issues (3)

- Missing required frontmatter field: category
- 2 images without alt text
- Unclosed code block
```

**Next Steps**: Fix all critical issues before publishing. Re-run `/blog-optimize` after fixes.

## Review Checklist

Before considering article complete:

1. **Frontmatter Complete**?
   - All required fields present
   - Meta description 150-160 chars
   - Valid date format

2. **Content Quality**?
   - Proper heading hierarchy
   - No broken links
   - All images have alt text
   - Code blocks properly formatted

3. **SEO Optimized**?
   - Keyword in title and headings
   - 3+ internal links
   - Meta description compelling
   - Readable paragraphs (<150 words)

4. **Spec Compliant**?
   - Meets all `must_have` requirements
   - Avoids all `must_avoid` patterns
   - Follows brand voice guidelines

## Next Steps

After validation is complete:

### If All Checks Pass ✅

```bash
# Publish the article
# (copy to your CMS or commit to git)
```

### If Issues Found ⚠️ ❌

```bash
# Fix issues manually or use other commands

# If content needs rewriting:
/blog-marketing "topic-name"  # Regenerate with fixes

# If SEO needs adjustment:
/blog-seo "topic-name"  # Regenerate SEO brief

# After fixes, re-validate:
/blog-optimize "topic-name"
```

## When to Use This Command

Use `/blog-optimize` when you need to:

- ✅ **Before publishing**: Final quality check
- ✅ **After manual edits**: Validate changes didn't break anything
- ✅ **Updating old articles**: Check compliance with current standards
- ✅ **Troubleshooting**: Identify specific issues in article
- ✅ **Learning**: See what makes a quality article

**For full workflow**: `/blog-generate` includes optimization as final step (optional).

## Tips

1. **Run after each major edit**: Catch issues early
2. **Review validation scripts**: Learn what good quality means
3. **Keep constitution updated**: Validation reflects your current standards
4. **Fix critical first**: Warnings can wait, critical issues block publishing
5. **Use metrics to improve**: Track quality trends over time

## Requesting Re-validation

After fixing issues:

```bash
/blog-optimize "topic-name"
```

The agent will re-run all checks and show improvements:

```
Previous: ❌ 3 critical, ⚠️  2 warnings
Current:  ✅ All checks passed!

Improvements:
- Fixed missing frontmatter field ✅
- Added alt text to all images ✅
- Closed unclosed code block ✅
```

## Validation Script Cleanup

Scripts are generated in `/tmp/` and can be manually removed:

```bash
# List validation scripts
ls /tmp/validate-*.sh

# Remove all validation scripts
rm /tmp/validate-*.sh

# Or let OS auto-cleanup on reboot
```

## Error Handling

If validation fails:
- **Check article exists**: Verify path `articles/[topic].md`
- **Check constitution valid**: Run `bash scripts/validate-constitution.sh`
- **Review script output**: Check `/tmp/validate-*.sh` for errors
- **Try with simpler article**: Test validation on known-good article

---

**Ready to validate?** Provide the topic name and execute this command.
