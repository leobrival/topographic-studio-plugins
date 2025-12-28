# Chunking Strategies

How to split documents for optimal vector search.

## Why Chunking Matters

Embedding models have token limits, but more importantly:
- **Too large**: Dilutes meaning, less precise matches
- **Too small**: Loses context, fragments ideas
- **Just right**: Captures atomic concepts with context

## Chunking Methods

### 1. Fixed-Size Chunking

Split by character/token count with overlap.

```javascript
function fixedChunk(text, options = {}) {
  const {
    chunkSize = 500,
    overlap = 50,
    separator = ' '
  } = options;

  const chunks = [];
  const words = text.split(separator);
  let currentChunk = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;

    if (currentLength >= chunkSize) {
      chunks.push(currentChunk.join(separator));

      // Keep overlap
      const overlapWords = Math.floor(overlap / 5); // ~5 chars per word
      currentChunk = currentChunk.slice(-overlapWords);
      currentLength = currentChunk.join(separator).length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(separator));
  }

  return chunks;
}
```

**Best for**: Uniform content, plain text
**Chunk size**: 300-800 characters

### 2. Sentence-Based Chunking

Split on sentence boundaries, combine to target size.

```javascript
function sentenceChunk(text, targetSize = 500) {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    const sentenceLength = sentence.length;

    if (currentLength + sentenceLength > targetSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
      currentLength = 0;
    }

    currentChunk.push(sentence.trim());
    currentLength += sentenceLength;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}
```

**Best for**: Prose, articles, literature notes
**Preserves**: Complete thoughts

### 3. Markdown-Aware Chunking

Respect document structure.

```javascript
function markdownChunk(markdown, options = {}) {
  const { maxSize = 1000, minSize = 100 } = options;

  const chunks = [];
  const lines = markdown.split('\n');

  let currentChunk = {
    text: '',
    metadata: {
      h1: '',
      h2: '',
      h3: ''
    }
  };

  for (const line of lines) {
    // Track headers for context
    if (line.startsWith('# ')) {
      // Save current chunk
      if (currentChunk.text.length >= minSize) {
        chunks.push({ ...currentChunk });
      }
      currentChunk = {
        text: '',
        metadata: { h1: line.slice(2), h2: '', h3: '' }
      };
    } else if (line.startsWith('## ')) {
      if (currentChunk.text.length >= minSize) {
        chunks.push({ ...currentChunk });
      }
      currentChunk = {
        text: '',
        metadata: {
          ...currentChunk.metadata,
          h2: line.slice(3),
          h3: ''
        }
      };
    } else if (line.startsWith('### ')) {
      currentChunk.metadata.h3 = line.slice(4);
      currentChunk.text += line + '\n';
    } else {
      currentChunk.text += line + '\n';

      // Split if too large
      if (currentChunk.text.length > maxSize) {
        chunks.push({ ...currentChunk });
        currentChunk = {
          text: '',
          metadata: { ...currentChunk.metadata }
        };
      }
    }
  }

  if (currentChunk.text.length >= minSize) {
    chunks.push(currentChunk);
  }

  return chunks;
}
```

**Best for**: Zettelkasten notes, structured content
**Preserves**: Headers as context, logical sections

### 4. Semantic Chunking

Split on topic boundaries using embeddings.

```javascript
async function semanticChunk(text, threshold = 0.5) {
  const sentences = splitSentences(text);
  const embeddings = await embedBatch(sentences);

  const chunks = [];
  let currentChunk = [sentences[0]];

  for (let i = 1; i < sentences.length; i++) {
    const similarity = cosineSimilarity(
      embeddings[i - 1],
      embeddings[i]
    );

    if (similarity < threshold) {
      // Topic change detected
      chunks.push(currentChunk.join(' '));
      currentChunk = [];
    }

    currentChunk.push(sentences[i]);
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(' '));
  }

  return chunks;
}
```

**Best for**: Long documents with multiple topics
**Trade-off**: Requires embeddings for chunking (slow)

### 5. Recursive Chunking

Try larger chunks first, split if needed.

```javascript
function recursiveChunk(text, maxSize = 1000) {
  if (text.length <= maxSize) {
    return [text];
  }

  // Try splitting by headers
  const headerSplit = text.split(/(?=^#{1,3} )/m);
  if (headerSplit.length > 1) {
    return headerSplit.flatMap(s => recursiveChunk(s, maxSize));
  }

  // Try splitting by paragraphs
  const paraSplit = text.split(/\n\n+/);
  if (paraSplit.length > 1) {
    return paraSplit.flatMap(s => recursiveChunk(s, maxSize));
  }

  // Try splitting by sentences
  const sentSplit = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentSplit.length > 1) {
    const chunks = [];
    let current = '';
    for (const sent of sentSplit) {
      if ((current + sent).length > maxSize) {
        if (current) chunks.push(current);
        current = sent;
      } else {
        current += sent;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  // Force split by size
  return fixedChunk(text, { chunkSize: maxSize });
}
```

**Best for**: Mixed content, unpredictable structure
**Preserves**: Natural boundaries when possible

## Zettelkasten-Specific Strategy

For Zettelkasten notes, use this approach:

```javascript
function zettelChunk(noteContent) {
  const chunks = [];

  // 1. Extract and chunk main content (before "Connections")
  const [mainContent, connectionsSection] = noteContent.split(/^## Connections/m);

  // 2. If main content is short enough, keep as one chunk
  if (mainContent.length <= 800) {
    chunks.push({
      type: 'main',
      text: mainContent,
      weight: 1.0  // Primary chunk
    });
  } else {
    // Use markdown-aware chunking
    const mainChunks = markdownChunk(mainContent, { maxSize: 600 });
    chunks.push(...mainChunks.map((c, i) => ({
      type: 'main',
      text: c.text,
      weight: i === 0 ? 1.0 : 0.8,
      metadata: c.metadata
    })));
  }

  // 3. Optionally include connections as separate chunk
  if (connectionsSection) {
    chunks.push({
      type: 'connections',
      text: connectionsSection,
      weight: 0.5  // Lower weight for link descriptions
    });
  }

  return chunks;
}
```

## Chunk Size Guidelines

| Content Type | Recommended Size | Overlap |
|--------------|------------------|---------|
| Atomic notes | 300-500 | 20% |
| Literature notes | 500-800 | 15% |
| MOCs | 200-400 | 10% |
| Long articles | 400-600 | 20% |

## Handling Special Content

### Code Blocks

```javascript
function handleCodeBlocks(markdown) {
  // Extract code blocks
  const codeBlocks = [];
  const textWithPlaceholders = markdown.replace(
    /```[\s\S]*?```/g,
    (match, offset) => {
      codeBlocks.push({ content: match, offset });
      return `[CODE_BLOCK_${codeBlocks.length - 1}]`;
    }
  );

  // Chunk the text
  const chunks = markdownChunk(textWithPlaceholders);

  // Restore code blocks
  return chunks.map(chunk => ({
    ...chunk,
    text: chunk.text.replace(
      /\[CODE_BLOCK_(\d+)\]/g,
      (_, idx) => codeBlocks[parseInt(idx)].content
    ),
    hasCode: chunk.text.includes('[CODE_BLOCK_')
  }));
}
```

### YAML Frontmatter

```javascript
function extractFrontmatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (match) {
    return {
      frontmatter: match[1],
      content: match[2],
      metadata: parseYaml(match[1])
    };
  }

  return { frontmatter: null, content: markdown, metadata: {} };
}
```

### Links and References

```javascript
function preserveLinks(chunk) {
  // Extract wikilinks
  const links = chunk.match(/\[\[([^\]]+)\]\]/g) || [];

  return {
    text: chunk,
    links: links.map(l => l.slice(2, -2)),
    hasLinks: links.length > 0
  };
}
```

## Overlap Strategies

### Fixed Overlap

```
Chunk 1: |---------------------|
Chunk 2:              |---------------------|
         <--overlap-->
```

### Sliding Window

```
Chunk 1: |-----|
Chunk 2:    |-----|
Chunk 3:       |-----|
         <-step->
```

### Context Injection

Add header context to each chunk:

```javascript
function addContext(chunks, noteTitle) {
  return chunks.map(chunk => ({
    ...chunk,
    text: `[From: ${noteTitle}]\n\n${chunk.text}`
  }));
}
```

## Validation

Check chunk quality:

```javascript
function validateChunks(chunks) {
  const issues = [];

  for (const chunk of chunks) {
    // Too short
    if (chunk.text.length < 50) {
      issues.push(`Chunk too short: ${chunk.text.slice(0, 30)}...`);
    }

    // Too long
    if (chunk.text.length > 1500) {
      issues.push(`Chunk too long: ${chunk.text.length} chars`);
    }

    // Incomplete sentence
    if (!/[.!?]\s*$/.test(chunk.text)) {
      issues.push(`Chunk ends mid-sentence`);
    }

    // Orphaned reference
    if (/\[\[.*\]\]/.test(chunk.text) && chunk.text.length < 100) {
      issues.push(`Chunk is mostly links`);
    }
  }

  return issues;
}
```
