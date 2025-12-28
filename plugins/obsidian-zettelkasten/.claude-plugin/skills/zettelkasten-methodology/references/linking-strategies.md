# Linking Strategies

Advanced techniques for creating meaningful connections in your Zettelkasten.

## The Four Types of Links

### 1. Structural Links

Connect notes within the same conceptual hierarchy.

**Examples**:
- Parent concept to child concept
- General to specific
- Category to instance

```markdown
## In the parent note:
This concept breaks down into:
- [[specific-aspect-1]] - handles X
- [[specific-aspect-2]] - handles Y

## In the child note:
This is part of [[parent-concept]].
```

### 2. Content Links

Connect notes based on conceptual relationship.

**Types**:

**Supporting links**:
```markdown
This idea is supported by [[evidence-note]].
```

**Contrasting links**:
```markdown
This contradicts [[opposing-view]] because...
```

**Extending links**:
```markdown
Building on [[base-concept]], we can see that...
```

### 3. Associative Links

Connect notes that remind you of each other.

```markdown
This reminds me of [[seemingly-unrelated-note]] in an interesting way:
both deal with emergent behavior from simple rules.
```

### 4. Sequence Links

Connect notes in a particular reading order.

```markdown
**Prerequisites**: [[foundational-concept]]
**Next**: [[advanced-application]]
```

## Link Context Patterns

### The "Because" Pattern

Always explain why you're linking.

**Instead of**:
```markdown
Related: [[other-note]]
```

**Write**:
```markdown
See [[other-note]] for the psychological basis of this behavior.
```

### The "Question" Pattern

Link by posing a question.

```markdown
How does this relate to [[learning-theory]]?
Perhaps the spaced repetition principle applies here.
```

### The "Tension" Pattern

Link notes in productive tension.

```markdown
This seems to contradict [[other-principle]], but perhaps they apply in different contexts.
```

## Finding Links

### The Five Questions

Ask after writing each note:

1. **What does this support?**
   - Existing theories
   - Previous observations
   - Ongoing projects

2. **What does this challenge?**
   - Common assumptions
   - My previous beliefs
   - Established methods

3. **What is this similar to?**
   - In other fields
   - In other contexts
   - In other scales

4. **Where could I use this?**
   - Current projects
   - Future applications
   - Teaching others

5. **What question does this answer?**
   - Questions I've asked
   - Common confusions
   - Research gaps

### Link Discovery Workflow

```bash
# 1. Search for keywords from your new note
grep -rl "keyword" vault/

# 2. Search for related tags
grep -rl "tags:.*related-topic" vault/

# 3. Check existing MOCs
cat vault/3-moc/*.md | grep -i "topic"

# 4. Review recent notes
ls -lt vault/2-permanent/ | head -20
```

## Link Density Guidelines

### Minimum Links

Every permanent note should have at least:
- 1 outgoing link to related concept
- 1 incoming link (or MOC inclusion)

### Optimal Links

3-7 meaningful links per note:
- 2-3 direct concept links
- 1-2 supporting evidence links
- 1-2 MOC inclusions

### Too Many Links

If you have 10+ links, consider:
- Is this note actually atomic?
- Are all links meaningful?
- Should this be a MOC instead?

## Backlinks Strategy

### Using Backlinks Effectively

Backlinks show what points to your note. Review them to:
- Understand context of use
- Find new connection opportunities
- Identify hub notes

### Backlink Review Questions

When reviewing backlinks:
- Does the linking context make sense?
- Could I add reciprocal context?
- Are there missing links from similar notes?

## MOC Integration

### When to Add to MOC

Add note to MOC when:
- It's a permanent note
- It belongs to a topic cluster
- It adds value to the MOC's purpose

### MOC Link Format

```markdown
## In the MOC:
- [[note-title]] - brief context explaining relevance

## In the note:
Part of [[topic-moc]].
```

## Anti-Patterns

### Link Dumping

**Bad**:
```markdown
## Related
- [[note1]]
- [[note2]]
- [[note3]]
```

**Good**:
```markdown
## Connections
This relates to [[note1]] through the shared principle of X.
It contrasts with [[note2]] in its approach to Y.
For practical application, see [[note3]].
```

### Orphan Notes

Notes with no links lose discoverability.

**Solution**:
1. Add at least one conceptual link
2. Include in relevant MOC
3. Create a "to-process" query:

```dataview
LIST
FROM "2-permanent"
WHERE length(file.outlinks) = 0
```

### Hub Inflation

Some notes become over-linked hubs.

**Signs**:
- 50+ backlinks
- Every new note links here
- Too general to be useful

**Solution**:
- Split into more specific notes
- Create dedicated MOC
- Be more selective with linking
