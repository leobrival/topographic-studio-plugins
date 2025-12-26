# Multiple CLAUDE.md Files in a Project

Claude Code supports **hierarchical CLAUDE.md files** throughout your project structure. This allows you to provide context-specific instructions for different parts of your codebase.

## How It Works

### Hierarchy and Inheritance

Claude Code reads CLAUDE.md files in order of specificity:

```
1. Nearest CLAUDE.md (most specific)
   ↓
2. Parent directory CLAUDE.md
   ↓
3. Root project CLAUDE.md
   ↓
4. Global ~/.claude/CLAUDE.md (least specific)
```

**Important**: More specific instructions take precedence over general ones.

### Resolution Order

When working in a subdirectory, Claude Code loads:

1. **Global instructions**: `~/.claude/CLAUDE.md` (your personal preferences)
2. **Project root**: `/project/CLAUDE.md` (project-wide rules)
3. **Subdirectory**: `/project/subdir/CLAUDE.md` (directory-specific rules)

Each level **adds to** or **overrides** the previous level.

## Use Cases for Blog Kit

### Example 1: Different Rules per Language

```
blog-kit/
├── CLAUDE.md                    # General blog rules
├── articles/
│   ├── CLAUDE.md                # Article-specific rules
│   ├── en/
│   │   └── CLAUDE.md            # English-specific rules
│   └── fr/
│       └── CLAUDE.md            # French-specific rules
├── commands/
│   └── CLAUDE.md                # Command development rules
└── agents/
    └── CLAUDE.md                # Agent development rules
```

### Example 2: Content vs Code

```
blog-kit/
├── CLAUDE.md                    # Root: general project rules
├── articles/
│   └── CLAUDE.md                # Focus on content quality, readability
├── scripts/
│   └── CLAUDE.md                # Focus on bash best practices
└── agents/
    └── CLAUDE.md                # Focus on agent design patterns
```

## Practical Examples

### Root CLAUDE.md (Project-Wide)

```markdown
# Blog Kit Project

This is an AI-powered blog generation toolkit.

## Core Principles

- Token efficiency (burn tokens in agents, not main thread)
- File-based handoffs (zero context pollution)
- Non-destructive operations (all scripts in /tmp/)

## File Structure

Content in `articles/`, agents in `agents/`, commands in `commands/`.
```

### articles/CLAUDE.md (Content-Specific)

```markdown
# Articles Directory

Contains generated blog articles in i18n structure.

## When Editing Articles

- ALWAYS preserve frontmatter structure
- DO NOT remove YAML delimiters (---)
- Maintain heading hierarchy (one H1, nested H2/H3)
- Keep code blocks properly fenced with language tags
- Ensure all images have descriptive alt text

## Article Structure

```
articles/
├── {lang}/              # Language code (en, fr, es, de)
│   └── {slug}/
│       ├── article.md   # Main content
│       └── images/
│           ├── .backup/ # Original images
│           └── *.webp   # Optimized images
```

## Optimization

Before optimizing images, ensure originals are in `.backup/`.
Use `/blog-optimize-images` command for automated optimization.
```

### articles/fr/CLAUDE.md (Language-Specific)

```markdown
# Articles en Français

## Style Guide

- Utiliser le tutoiement ("tu") pour le ton convivial
- Utiliser le vouvoiement ("vous") pour le ton corporate
- Toujours traduire les termes techniques avec explications
- Adapter les idiomes au contexte français

## Exemples à Éviter

 "Let's dive in" → "Plongeons dedans" (littéral)
 "Let's dive in" → "Entrons dans le vif du sujet"

## Vérifications

- Accents corrects (é, è, ê, à, ù, etc.)
- Guillemets français (« »)  not anglais (" ")
- Espaces insécables avant : ; ! ?
```

### agents/CLAUDE.md (Agent Development)

```markdown
# Agent Development

When creating or modifying agents:

## Agent File Structure

Each agent must include:
- Clear role statement
- Core responsibilities list
- Phase-by-phase process
- Token optimization guidelines
- Error handling
- Success criteria

## Token Efficiency

- Agents process 50k-150k tokens (isolated)
- Main thread uses <1k tokens (orchestration only)
- Load only necessary data (not full files)

## Best Practices

- Generate all scripts in `/tmp/` (non-destructive)
- Include user decision cycle for ambiguous cases
- Provide examples with actual code
- Document expected output clearly

## Testing

Before committing an agent:
1. Test with sample content
2. Verify token usage is within budget
3. Ensure scripts are generated correctly
4. Check error handling works
```

### commands/CLAUDE.md (Command Development)

```markdown
# Command Development

Commands are slash commands that invoke agents.

## Command File Structure

Each command must include:
- Clear usage examples (single vs global)
- Token usage warnings (if applicable)
- Prerequisites list
- Expected output description
- Instructions for agent invocation

## Token Warnings

Commands that can operate globally MUST warn users:

```bash
### Single Article (Recommended)
/command "lang/slug"
Token usage: ~10k-15k

### Global (️  High Token Usage)
/command
️  WARNING: Operates on ALL articles
Token usage: 50k-500k+
```

## Agent Invocation

Provide clear prompt for agent:
- Specify exact file paths
- Define success criteria
- Include examples
- Mention cleanup requirements
```

## Benefits

### 1. Context-Specific Guidance

Each directory gets relevant instructions without cluttering other contexts.

### 2. Override Flexibility

Child CLAUDE.md files can override parent instructions when needed:

```markdown
# articles/experimental/CLAUDE.md

**Note**: This directory contains experimental content.
Override project-wide rules - allow unconventional structures here.
```

### 3. Team Collaboration

Different team members working in different directories get appropriate context:

- **Content writers**: See articles/CLAUDE.md with style guides
- **Developers**: See agents/CLAUDE.md with technical guidelines
- **DevOps**: See scripts/CLAUDE.md with deployment rules

### 4. Maintainability

Instead of one huge CLAUDE.md, split into manageable, focused files:

- Easier to update specific areas
- Less cognitive load
- Better version control (targeted commits)

## Best Practices

### DO

 Create CLAUDE.md in directories where context changes significantly
 Keep each file focused on its scope
 Use clear headings for easy navigation
 Include examples relevant to the directory
 Document directory structure at each level
 Explain special rules for the directory

### DON'T

 Create CLAUDE.md in every single subdirectory (only where needed)
 Repeat global instructions in every file (let inheritance work)
 Make files too long (split if over 200 lines)
 Use contradictory instructions (child should enhance, not conflict)
 Forget to test that inheritance works as expected

## Example: Blog Kit Structure

### Minimal Setup

```
blog-kit/
└── CLAUDE.md           # Project-wide rules (required)
```

**Good for**: Small projects, single-purpose tools

### Recommended Setup

```
blog-kit/
├── CLAUDE.md           # Project-wide rules
├── articles/CLAUDE.md  # Content quality guidelines
└── agents/CLAUDE.md    # Agent development guidelines
```

**Good for**: Most projects, clear separation of concerns

### Advanced Setup

```
blog-kit/
├── CLAUDE.md                    # Project-wide
├── articles/
│   ├── CLAUDE.md                # General article rules
│   ├── en/CLAUDE.md             # English style guide
│   ├── fr/CLAUDE.md             # French style guide
│   └── es/CLAUDE.md             # Spanish style guide
├── agents/CLAUDE.md             # Agent development
├── commands/CLAUDE.md           # Command development
└── scripts/CLAUDE.md            # Bash scripting rules
```

**Good for**: Large projects, multilingual, multiple contributors

## Testing Hierarchy

To verify your CLAUDE.md hierarchy works:

1. **Navigate to subdirectory**:
   ```bash
   cd articles/fr/
   ```

2. **Ask Claude about context**:
   ```
   What CLAUDE.md files are you reading right now?
   ```

3. **Verify instructions apply**:
   ```
   What rules should I follow when editing articles in this directory?
   ```

Claude will show which CLAUDE.md files it loaded and in what order.

## Common Patterns

### Pattern 1: Language-Specific Rules

```
articles/
├── CLAUDE.md         # General: frontmatter, structure
├── en/CLAUDE.md      # English: tone, spelling
├── fr/CLAUDE.md      # French: accents, guillemets
└── es/CLAUDE.md      # Spanish: tildes, formatting
```

### Pattern 2: Environment-Specific Rules

```
project/
├── CLAUDE.md         # General development rules
├── src/CLAUDE.md     # Source code: testing, types
├── docs/CLAUDE.md    # Documentation: examples, clarity
└── scripts/CLAUDE.md # Scripts: error handling, logging
```

### Pattern 3: Role-Specific Rules

```
blog-kit/
├── CLAUDE.md                # General: project structure
├── content-team/CLAUDE.md   # Writers: style, SEO
└── dev-team/CLAUDE.md       # Developers: agents, commands
```

## Troubleshooting

### Instructions Not Applied

**Problem**: Claude doesn't follow subdirectory CLAUDE.md

**Solutions**:
1. Verify file name is exactly `CLAUDE.md` (case-sensitive)
2. Check file is in correct directory
3. Ensure file is UTF-8 encoded
4. Try restarting Claude Code session

### Conflicting Instructions

**Problem**: Parent and child CLAUDE.md have contradictory rules

**Solutions**:
1. Child CLAUDE.md should acknowledge override:
   ```markdown
   **Override**: [parent rule] → [new rule] because [reason]
   ```
2. Use clear sections: "Override Rules" vs "Additional Rules"
3. Test in both directories to verify behavior

### Too Many Files

**Problem**: CLAUDE.md in every directory, hard to maintain

**Solutions**:
1. Consolidate similar directories
2. Use one file per major section (articles/, agents/, commands/)
3. Document common rules once in root CLAUDE.md
4. Only create subdirectory CLAUDE.md when context truly differs

## Migration Guide

### From Single to Multiple Files

1. **Start with root CLAUDE.md** (keep all existing rules)

2. **Identify distinct contexts**:
   - Different languages?
   - Different types of files?
   - Different team roles?

3. **Extract context-specific rules**:
   ```markdown
   # Original CLAUDE.md (too large)
   General rules...
   Article rules...
   Agent rules...
   Command rules...

   # Split into:
   CLAUDE.md → General rules
   articles/CLAUDE.md → Article rules
   agents/CLAUDE.md → Agent rules
   commands/CLAUDE.md → Command rules
   ```

4. **Test each context**:
   - Navigate to directory
   - Verify rules apply
   - Check for conflicts

5. **Document the structure**:
   Add to root CLAUDE.md:
   ```markdown
   ## CLAUDE.md Files

   This project uses hierarchical CLAUDE.md files:
   - `/CLAUDE.md` - Project-wide rules
   - `/articles/CLAUDE.md` - Content guidelines
   - `/agents/CLAUDE.md` - Agent development
   ```

## Conclusion

Multiple CLAUDE.md files enable:
-  Context-specific guidance
-  Better organization
-  Team collaboration
-  Easier maintenance
-  Flexible overrides

Use them strategically - only where context truly differs.

---

**Pro Tip**: Start with one root CLAUDE.md, then split only when a directory needs significantly different guidance.
