---
description: Build and query a vector database for semantic search across your Obsidian vault
argument-hint: "[--build] [--search <query>] [--similar <note>] [--status]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "AskUserQuestion", "Skill", "TodoWrite"]
---

# Vector Database for Semantic Search

Build a vector database from your Obsidian notes to enable semantic search and find conceptually related content.

**FIRST**: Load the `obsidian-zettelkasten:vector-search` skill for implementation details.

## Your Task

Manage vector database based on: `$ARGUMENTS`

## Modes

Parse `$ARGUMENTS`:

1. **--build**: Index all notes into vector database
2. **--search <query>**: Semantic search across notes
3. **--similar <note>**: Find notes similar to a specific note
4. **--status**: Show database status and stats
5. **--update**: Incrementally update changed notes
6. **No args**: Show help and current status

## Architecture

### Storage Structure

```
vault/
└── .vectors/
    ├── config.json          # Database configuration
    ├── embeddings.json      # Vector embeddings store
    ├── index.json           # Note metadata index
    └── cache/
        └── chunks/          # Chunked content cache
```

### Technology Stack

**Embeddings**: Use local or API-based embedding models
- **Local**: Ollama with nomic-embed-text or all-minilm
- **API**: OpenAI text-embedding-3-small (if API key available)

**Vector Store**: JSON-based for simplicity (no external DB needed)
- Cosine similarity for search
- HNSW-like indexing for speed (optional)

## Workflow

### Mode 1: Build Database

**Input**: `/vectorize --build`

#### Step 1: Check prerequisites

```bash
# Check for Ollama (local embeddings)
which ollama && ollama list | grep -E "(nomic-embed|all-minilm)"

# Or check for OpenAI API key
echo $OPENAI_API_KEY | head -c 10
```

If neither available:
```
Vector database requires an embedding model.

Options:
1. Install Ollama + nomic-embed-text (free, local, private)
   curl -fsSL https://ollama.com/install.sh | sh
   ollama pull nomic-embed-text

2. Use OpenAI API (requires API key)
   export OPENAI_API_KEY=sk-...

3. Use local sentence-transformers (Python required)
   pip install sentence-transformers

Which option? (1/2/3)
```

#### Step 2: Detect vault and notes

```bash
# Find vault
VAULT=$(ls -d ~/Documents/Obsidian* 2>/dev/null | head -1)

# Count notes to index
find "$VAULT" -name "*.md" -not -path "*/.vectors/*" | wc -l
```

#### Step 3: Initialize vector store

Create config:
```json
{
  "version": "1.0.0",
  "created": "2024-01-15T10:30:00Z",
  "updated": "2024-01-15T10:30:00Z",
  "model": "nomic-embed-text",
  "dimensions": 768,
  "chunk_size": 500,
  "chunk_overlap": 50,
  "total_notes": 0,
  "total_chunks": 0,
  "vault_path": "/path/to/vault"
}
```

#### Step 4: Process notes

```
Building vector database...

Phase 1: Scanning notes
Found 127 markdown files

Phase 2: Chunking content
├── Permanent notes: 89 files → 245 chunks
├── Literature notes: 23 files → 112 chunks
├── MOCs: 8 files → 24 chunks
└── Other: 7 files → 18 chunks

Total: 399 chunks to embed

Phase 3: Generating embeddings
[████████████████████░░░░] 85% (340/399)

Processing: compound-effect-habits.md
├── Chunks: 3
├── Tokens: ~450
└── Embedding time: 0.3s

Phase 4: Building index
Creating similarity index...
Optimizing for search...

Complete!
```

#### Step 5: Save database

Write to `.vectors/`:
```javascript
// embeddings.json structure
{
  "notes": {
    "202312150930-compound-habits": {
      "path": "2-permanent/202312150930-compound-habits.md",
      "title": "The compound effect of habits",
      "type": "permanent",
      "chunks": [
        {
          "id": "chunk_001",
          "text": "Small actions repeated...",
          "embedding": [0.023, -0.145, ...],  // 768 dimensions
          "start": 0,
          "end": 500
        }
      ],
      "indexed_at": "2024-01-15T10:35:00Z",
      "file_hash": "abc123..."
    }
  }
}
```

#### Step 6: Report

```
Vector Database Built Successfully

Stats:
├── Notes indexed: 127
├── Total chunks: 399
├── Embedding model: nomic-embed-text
├── Vector dimensions: 768
├── Database size: 12.4 MB
└── Build time: 2m 34s

Storage: vault/.vectors/

Ready for semantic search!
Try: /vectorize --search "productivity techniques"
```

### Mode 2: Semantic Search

**Input**: `/vectorize --search "how to build good habits"`

#### Step 1: Load database

```bash
# Check database exists
if [ ! -f "$VAULT/.vectors/embeddings.json" ]; then
  echo "Database not found. Run /vectorize --build first."
  exit 1
fi
```

#### Step 2: Generate query embedding

```bash
# Using Ollama
ollama embed nomic-embed-text "how to build good habits"

# Or OpenAI
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model": "text-embedding-3-small", "input": "query"}'
```

#### Step 3: Calculate similarities

```python
# Cosine similarity calculation
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Compare query against all chunks
similarities = []
for note_id, note_data in embeddings["notes"].items():
    for chunk in note_data["chunks"]:
        sim = cosine_similarity(query_embedding, chunk["embedding"])
        similarities.append({
            "note_id": note_id,
            "chunk_id": chunk["id"],
            "similarity": sim,
            "text": chunk["text"][:200]
        })

# Sort by similarity
similarities.sort(key=lambda x: x["similarity"], reverse=True)
```

#### Step 4: Present results

```
Semantic Search: "how to build good habits"

Top Results (similarity score):

1. [[compound-effect-habits]] (0.92)
   "Small actions, repeated consistently, produce disproportionately
   large results over time. A 1% improvement daily leads to being
   37x better after one year..."
   → Section: Introduction

2. [[habit-stacking]] (0.89)
   "Habit stacking links a new behavior to an existing routine.
   The formula: After [CURRENT HABIT], I will [NEW HABIT]..."
   → Section: Core technique

3. [[atomic-habits-literature]] (0.87)
   "James Clear's framework focuses on making habits obvious,
   attractive, easy, and satisfying. The four laws of behavior
   change provide a systematic approach..."
   → Section: Key Ideas

4. [[implementation-intentions]] (0.84)
   "Specifying when and where you will perform a behavior
   increases follow-through by 2-3x compared to motivation alone..."
   → Section: Research findings

5. [[environment-design]] (0.81)
   "Design your environment to make good behaviors easier and
   bad behaviors harder. Remove friction from positive habits..."
   → Section: Application

Found 23 related notes. Showing top 5.
View more? (show 10 / show all / open note 1)
```

#### Step 5: Interactive options

```
Options:
1. Open a note: /vectorize --search "query" --open 1
2. Find similar to result: /vectorize --similar [[note-name]]
3. Refine search: /vectorize --search "new query"
4. Create note from insights: /zettel "synthesis of results"
```

### Mode 3: Find Similar Notes

**Input**: `/vectorize --similar [[compound-effect-habits]]`

#### Step 1: Get note embedding

```bash
# Find note in database
NOTE_ID="202312150930-compound-habits"
```

#### Step 2: Calculate similarity to all other notes

Average chunk embeddings for note-level similarity:
```python
# Get average embedding for target note
target_chunks = embeddings["notes"][note_id]["chunks"]
target_avg = np.mean([c["embedding"] for c in target_chunks], axis=0)

# Compare to all other notes
for other_id, other_data in embeddings["notes"].items():
    if other_id == note_id:
        continue
    other_avg = np.mean([c["embedding"] for c in other_data["chunks"]], axis=0)
    similarity = cosine_similarity(target_avg, other_avg)
```

#### Step 3: Present similar notes

```
Notes Similar to: [[compound-effect-habits]]

Highly Similar (0.85+):
├── [[habit-stacking]] (0.91)
│   Same topic: habit formation techniques
│
├── [[consistency-over-intensity]] (0.89)
│   Shared concept: small repeated actions
│
└── [[atomic-habits-literature]] (0.87)
    Source material for this note

Moderately Similar (0.70-0.85):
├── [[delayed-gratification]] (0.78)
│   Related: long-term thinking
│
├── [[exponential-growth]] (0.75)
│   Mathematical basis: compound growth
│
└── [[marginal-gains]] (0.72)
    Sports application of same principle

Conceptually Related (0.60-0.70):
├── [[decision-fatigue]] (0.68)
├── [[willpower-as-resource]] (0.65)
└── [[keystone-habits]] (0.63)

Link suggestions:
- [[consistency-over-intensity]] not currently linked (recommend!)
- [[marginal-gains]] not currently linked

Create links? (y/n/select)
```

### Mode 4: Database Status

**Input**: `/vectorize --status`

```
Vector Database Status

Database: vault/.vectors/
Created: 2024-01-15 10:30
Updated: 2024-01-15 14:22

Configuration:
├── Model: nomic-embed-text
├── Dimensions: 768
├── Chunk size: 500 tokens
└── Overlap: 50 tokens

Content:
├── Total notes: 127
├── Total chunks: 399
├── Database size: 12.4 MB
└── Average chunks/note: 3.1

Coverage:
├── Permanent notes: 89/89 (100%)
├── Literature notes: 23/23 (100%)
├── MOCs: 8/8 (100%)
└── Fleeting notes: 0/7 (excluded)

Freshness:
├── Up to date: 120 notes
├── Modified since index: 7 notes
└── New (unindexed): 3 notes

Actions needed:
! 10 notes need re-indexing
  Run: /vectorize --update

Health: Good
Last search: 2024-01-15 14:20
Total searches: 47
```

### Mode 5: Incremental Update

**Input**: `/vectorize --update`

```
Updating Vector Database...

Checking for changes:
├── New notes: 3
├── Modified notes: 7
├── Deleted notes: 1

Processing updates:
[████████████████████] 100%

├── Added: new-note-1.md (2 chunks)
├── Added: new-note-2.md (3 chunks)
├── Added: new-note-3.md (1 chunk)
├── Updated: modified-note-1.md (3 chunks)
├── Updated: modified-note-2.md (2 chunks)
├── ...
└── Removed: deleted-note.md

Update complete!
├── Notes: 127 → 129
├── Chunks: 399 → 412
├── Time: 45s
└── Database size: 12.4 MB → 12.8 MB
```

## Implementation Script

Create helper script at `.vectors/search.js`:

```javascript
#!/usr/bin/env node
// Vector search implementation for Obsidian Zettelkasten

const fs = require('fs');
const path = require('path');

class VectorDB {
  constructor(vaultPath) {
    this.vaultPath = vaultPath;
    this.dbPath = path.join(vaultPath, '.vectors');
    this.config = null;
    this.embeddings = null;
  }

  async load() {
    this.config = JSON.parse(
      fs.readFileSync(path.join(this.dbPath, 'config.json'))
    );
    this.embeddings = JSON.parse(
      fs.readFileSync(path.join(this.dbPath, 'embeddings.json'))
    );
  }

  cosineSimilarity(a, b) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async search(query, topK = 10) {
    const queryEmbedding = await this.embed(query);
    const results = [];

    for (const [noteId, noteData] of Object.entries(this.embeddings.notes)) {
      for (const chunk of noteData.chunks) {
        const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        results.push({
          noteId,
          title: noteData.title,
          path: noteData.path,
          chunkId: chunk.id,
          text: chunk.text,
          similarity
        });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  async embed(text) {
    // Use Ollama for local embedding
    const response = await fetch('http://localhost:11434/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt: text
      })
    });
    const data = await response.json();
    return data.embedding;
  }
}

module.exports = VectorDB;
```

## Error Handling

**If Ollama not running**:
```
Ollama is not running.

Start it with:
  ollama serve

Or use OpenAI API:
  export OPENAI_API_KEY=sk-...
  /vectorize --build --model openai
```

**If database corrupted**:
```
Vector database appears corrupted.

Options:
1. Rebuild from scratch: /vectorize --build --force
2. Restore from backup: vault/.vectors/backup/
3. Check specific file: vault/.vectors/embeddings.json
```

**If note not found in database**:
```
Note not found in vector database.

The note may be:
- Recently created (run /vectorize --update)
- Excluded (fleeting notes are not indexed)
- In .vectorignore

To index: /vectorize --update
```

## Performance Tips

```
For large vaults (1000+ notes):

1. Use incremental updates: /vectorize --update
   Faster than full rebuild

2. Exclude fleeting notes (default)
   They're temporary anyway

3. Consider chunk size:
   Larger chunks = faster build, less precise search
   Smaller chunks = slower build, more precise search

4. Use local embeddings (Ollama)
   No API costs, works offline
```
