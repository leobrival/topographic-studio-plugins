---
name: vector-search
description: Semantic search infrastructure for Obsidian vaults using vector embeddings. Covers embedding models, chunking strategies, similarity search, and incremental indexing.
---

# Vector Search for Zettelkasten

Enable semantic search across your Obsidian vault using vector embeddings.

## Concept Overview

### What is Vector Search?

Traditional search matches exact keywords. Vector search understands **meaning**:

| Query | Keyword Search | Vector Search |
|-------|---------------|---------------|
| "building habits" | Matches "habit", "building" | Also finds "routine formation", "behavioral patterns" |
| "productivity" | Only exact matches | Finds "efficiency", "time management", "deep work" |

### How It Works

```
Note Text → Chunking → Embedding Model → Vector (768 numbers)
                                              ↓
Query Text → Embedding Model → Query Vector → Cosine Similarity → Results
```

## Embedding Models

### Local Options (Recommended)

#### Ollama + nomic-embed-text

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull embedding model
ollama pull nomic-embed-text

# Test
ollama embed nomic-embed-text "test query"
```

**Specs**:
- Dimensions: 768
- Context: 8192 tokens
- Speed: ~100 embeddings/second
- Privacy: 100% local

#### Ollama + all-minilm

```bash
ollama pull all-minilm
```

**Specs**:
- Dimensions: 384
- Context: 512 tokens
- Speed: ~200 embeddings/second
- Smaller, faster, less accurate

### API Options

#### OpenAI text-embedding-3-small

```bash
export OPENAI_API_KEY=sk-...

curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": "Your text here"
  }'
```

**Specs**:
- Dimensions: 1536 (or 512 with dimension param)
- Context: 8191 tokens
- Cost: $0.02 / 1M tokens
- Quality: Excellent

#### Voyage AI

```bash
export VOYAGE_API_KEY=...

curl https://api.voyageai.com/v1/embeddings \
  -H "Authorization: Bearer $VOYAGE_API_KEY" \
  -d '{
    "model": "voyage-2",
    "input": ["text"]
  }'
```

**Specs**:
- Dimensions: 1024
- Optimized for retrieval
- Cost: ~$0.10 / 1M tokens

## Chunking Strategies

### Why Chunk?

Long documents need splitting:
- Embedding models have token limits
- Smaller chunks = more precise matching
- Relevant section vs. whole document

### Fixed-Size Chunking

```javascript
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push({
      text: text.slice(start, end),
      start,
      end
    });
    start = end - overlap;
  }

  return chunks;
}
```

**Parameters**:
- `chunkSize`: 300-1000 characters (500 recommended)
- `overlap`: 10-20% of chunk size (prevents cutting context)

### Semantic Chunking

Split on natural boundaries:

```javascript
function semanticChunk(text) {
  // Split on headers
  const sections = text.split(/^##?\s+/m);

  // Split large sections on paragraphs
  return sections.flatMap(section => {
    if (section.length <= 1000) return [section];
    return section.split(/\n\n+/);
  });
}
```

### Markdown-Aware Chunking

Preserve structure:

```javascript
function markdownChunk(markdown) {
  const chunks = [];
  let currentChunk = { text: '', metadata: {} };

  const lines = markdown.split('\n');
  let currentHeader = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      currentHeader = line.slice(2);
    } else if (line.startsWith('## ')) {
      // Save current chunk
      if (currentChunk.text.trim()) {
        chunks.push({ ...currentChunk });
      }
      currentChunk = {
        text: line + '\n',
        metadata: { header: currentHeader, section: line.slice(3) }
      };
    } else {
      currentChunk.text += line + '\n';

      // Split if too long
      if (currentChunk.text.length > 1000) {
        chunks.push({ ...currentChunk });
        currentChunk = { text: '', metadata: currentChunk.metadata };
      }
    }
  }

  if (currentChunk.text.trim()) {
    chunks.push(currentChunk);
  }

  return chunks;
}
```

## Similarity Search

### Cosine Similarity

```javascript
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**Score interpretation**:
- 0.90+: Very similar (same topic)
- 0.80-0.90: Highly related
- 0.70-0.80: Moderately related
- 0.60-0.70: Loosely related
- <0.60: Different topics

### Euclidean Distance

Alternative metric:

```javascript
function euclideanDistance(vecA, vecB) {
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    sum += Math.pow(vecA[i] - vecB[i], 2);
  }
  return Math.sqrt(sum);
}
```

Lower = more similar (inverse of cosine).

### Hybrid Search

Combine keyword + semantic:

```javascript
function hybridSearch(query, db, alpha = 0.7) {
  // Semantic search
  const semanticResults = semanticSearch(query, db);

  // Keyword search (BM25)
  const keywordResults = keywordSearch(query, db);

  // Combine scores
  const combined = {};

  for (const r of semanticResults) {
    combined[r.id] = (combined[r.id] || 0) + alpha * r.score;
  }

  for (const r of keywordResults) {
    combined[r.id] = (combined[r.id] || 0) + (1 - alpha) * r.score;
  }

  return Object.entries(combined)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
}
```

## Database Structure

### JSON-Based Store

```json
{
  "config": {
    "version": "1.0.0",
    "model": "nomic-embed-text",
    "dimensions": 768,
    "chunk_size": 500,
    "chunk_overlap": 50
  },
  "notes": {
    "note-id-1": {
      "path": "2-permanent/note.md",
      "title": "Note Title",
      "type": "permanent",
      "tags": ["tag1", "tag2"],
      "modified": "2024-01-15T10:00:00Z",
      "indexed": "2024-01-15T10:30:00Z",
      "hash": "abc123",
      "chunks": [
        {
          "id": "chunk_001",
          "text": "chunk content...",
          "embedding": [0.01, -0.02, ...],
          "section": "Introduction",
          "start": 0,
          "end": 500
        }
      ]
    }
  },
  "metadata": {
    "total_notes": 127,
    "total_chunks": 399,
    "last_updated": "2024-01-15T14:00:00Z"
  }
}
```

### Optimizations

#### Lazy Loading

```javascript
class VectorDB {
  constructor(path) {
    this.path = path;
    this.config = null;
    this.index = null;
    this.embeddings = null;  // Loaded on demand
  }

  async loadIndex() {
    // Load lightweight index first
    this.index = await this.readJSON('index.json');
  }

  async loadEmbeddings(noteIds) {
    // Load only needed embeddings
    const embeddings = {};
    for (const id of noteIds) {
      embeddings[id] = await this.readJSON(`chunks/${id}.json`);
    }
    return embeddings;
  }
}
```

#### Inverted Index for Pre-filtering

```javascript
// Build inverted index for tags
const tagIndex = {
  "productivity": ["note-1", "note-5", "note-12"],
  "habits": ["note-3", "note-5", "note-8"],
  // ...
};

// Pre-filter before semantic search
function searchWithFilter(query, tags) {
  const candidates = tags
    ? tags.flatMap(t => tagIndex[t] || [])
    : Object.keys(db.notes);

  return semanticSearch(query, candidates);
}
```

## Incremental Indexing

### Change Detection

```javascript
async function detectChanges(db, vaultPath) {
  const changes = { added: [], modified: [], deleted: [] };

  // Get current files
  const currentFiles = await glob(`${vaultPath}/**/*.md`);
  const indexed = Object.keys(db.notes);

  for (const file of currentFiles) {
    const id = pathToId(file);
    const hash = await fileHash(file);

    if (!indexed.includes(id)) {
      changes.added.push(file);
    } else if (db.notes[id].hash !== hash) {
      changes.modified.push(file);
    }
  }

  for (const id of indexed) {
    if (!currentFiles.includes(idToPath(id))) {
      changes.deleted.push(id);
    }
  }

  return changes;
}
```

### Batch Processing

```javascript
async function updateIndex(db, changes) {
  const BATCH_SIZE = 10;

  // Process in batches to avoid memory issues
  const toProcess = [...changes.added, ...changes.modified];

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);

    const texts = await Promise.all(
      batch.map(f => readFile(f))
    );

    const embeddings = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      await saveEmbedding(batch[j], embeddings[j]);
    }

    // Progress update
    console.log(`Processed ${i + batch.length}/${toProcess.length}`);
  }

  // Remove deleted
  for (const id of changes.deleted) {
    delete db.notes[id];
  }
}
```

## Integration with Zettelkasten

### Finding Connections

```javascript
async function suggestLinks(noteId, db) {
  const note = db.notes[noteId];
  const noteEmbedding = averageEmbedding(note.chunks);

  const suggestions = [];

  for (const [otherId, otherNote] of Object.entries(db.notes)) {
    if (otherId === noteId) continue;
    if (note.links.includes(otherId)) continue;  // Skip existing links

    const otherEmbedding = averageEmbedding(otherNote.chunks);
    const similarity = cosineSimilarity(noteEmbedding, otherEmbedding);

    if (similarity > 0.75) {
      suggestions.push({
        id: otherId,
        title: otherNote.title,
        similarity,
        reason: await explainConnection(note, otherNote)
      });
    }
  }

  return suggestions.sort((a, b) => b.similarity - a.similarity);
}
```

### MOC Generation

```javascript
async function suggestMOCStructure(topic, db) {
  // Search for topic-related notes
  const results = await search(topic, db, 50);

  // Cluster by sub-topics
  const clusters = await clusterNotes(results);

  return {
    topic,
    sections: clusters.map(c => ({
      name: c.label,
      notes: c.notes.map(n => ({
        id: n.id,
        title: n.title,
        relevance: n.similarity
      }))
    }))
  };
}
```

## Reference Files

- **Chunking Strategies**: See [references/chunking.md](references/chunking.md)
- **Embedding Models**: See [references/embedding-models.md](references/embedding-models.md)
- **Performance Tuning**: See [references/performance.md](references/performance.md)
