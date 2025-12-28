# Embedding Models Comparison

Guide to choosing the right embedding model for your Zettelkasten.

## Model Comparison Table

| Model | Provider | Dimensions | Context | Speed | Quality | Cost |
|-------|----------|------------|---------|-------|---------|------|
| nomic-embed-text | Ollama | 768 | 8192 | Fast | Excellent | Free |
| all-minilm | Ollama | 384 | 512 | Very Fast | Good | Free |
| mxbai-embed-large | Ollama | 1024 | 512 | Medium | Excellent | Free |
| text-embedding-3-small | OpenAI | 1536 | 8191 | Fast | Excellent | $0.02/1M |
| text-embedding-3-large | OpenAI | 3072 | 8191 | Fast | Best | $0.13/1M |
| voyage-2 | Voyage AI | 1024 | 4000 | Fast | Excellent | $0.10/1M |

## Local Models (Ollama)

### nomic-embed-text (Recommended)

Best balance of quality and speed for local use.

```bash
# Install
ollama pull nomic-embed-text

# Usage
curl http://localhost:11434/api/embeddings \
  -d '{"model": "nomic-embed-text", "prompt": "Your text"}'
```

**Pros**:
- Excellent retrieval quality
- Long context (8192 tokens)
- Fast inference
- 100% private

**Cons**:
- Requires Ollama running
- ~1GB model size

### all-minilm

Lightweight option for smaller systems.

```bash
ollama pull all-minilm
```

**Pros**:
- Very fast
- Small model (~50MB)
- Good for quick prototyping

**Cons**:
- Shorter context (512 tokens)
- Lower quality than nomic

### mxbai-embed-large

High quality for demanding use cases.

```bash
ollama pull mxbai-embed-large
```

**Pros**:
- Top-tier quality
- Good for specialized domains

**Cons**:
- Larger model (~1.5GB)
- Slower inference

## API Models

### OpenAI text-embedding-3-small

Best API option for most use cases.

```javascript
const response = await fetch('https://api.openai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'text-embedding-3-small',
    input: 'Your text here',
    dimensions: 512  // Optional: reduce dimensions
  })
});
```

**Pros**:
- No local resources needed
- Consistent quality
- Dimension reduction option

**Cons**:
- Requires API key
- Ongoing cost
- Data leaves your machine

### Dimension Reduction

OpenAI models support dimension reduction:

```javascript
// Full dimensions (1536)
{ model: 'text-embedding-3-small', input: text }

// Reduced dimensions (512) - faster, less storage
{ model: 'text-embedding-3-small', input: text, dimensions: 512 }
```

Trade-off:
- 512 dims: 3x less storage, ~5% quality loss
- 256 dims: 6x less storage, ~10% quality loss

## Performance Benchmarks

### Indexing Speed (100 notes, ~50 chunks each)

| Model | Time | RAM Usage |
|-------|------|-----------|
| all-minilm | 12s | 500MB |
| nomic-embed-text | 45s | 1.2GB |
| mxbai-embed-large | 90s | 2GB |
| OpenAI (API) | 8s | Minimal |

### Search Quality (MTEB benchmark)

| Model | Retrieval Score |
|-------|-----------------|
| text-embedding-3-large | 0.647 |
| mxbai-embed-large | 0.642 |
| nomic-embed-text | 0.631 |
| text-embedding-3-small | 0.624 |
| all-minilm | 0.589 |

### Storage Requirements (1000 notes)

| Model | Dimensions | Storage |
|-------|------------|---------|
| all-minilm | 384 | ~6MB |
| nomic-embed-text | 768 | ~12MB |
| mxbai-embed-large | 1024 | ~16MB |
| text-embedding-3-small | 1536 | ~24MB |
| text-embedding-3-large | 3072 | ~48MB |

## Recommendations

### For Personal Zettelkasten (< 500 notes)

**Use: nomic-embed-text**
- Excellent quality
- Runs locally
- Free forever

### For Large Vaults (500-5000 notes)

**Use: nomic-embed-text or text-embedding-3-small**
- nomic: if privacy matters
- OpenAI: if faster indexing needed

### For Resource-Constrained Systems

**Use: all-minilm**
- Runs on any machine
- Acceptable quality for basic search

### For Maximum Quality

**Use: text-embedding-3-large or mxbai-embed-large**
- Best retrieval accuracy
- Worth the cost/resources for large knowledge bases

## Switching Models

If you switch embedding models, you must rebuild the entire database:

```bash
# Backup old database
mv .vectors .vectors.backup

# Rebuild with new model
/vectorize --build --model new-model
```

Embeddings from different models are **not compatible**.

## Custom Fine-Tuning

For specialized domains, consider fine-tuning:

### Using Sentence Transformers

```python
from sentence_transformers import SentenceTransformer, InputExample
from sentence_transformers.losses import CosineSimilarityLoss

# Load base model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Prepare training data from your notes
train_examples = [
    InputExample(texts=['note1 content', 'related note content'], label=0.9),
    InputExample(texts=['note1 content', 'unrelated content'], label=0.1),
]

# Fine-tune
model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=3
)

# Save
model.save('my-zettelkasten-embedder')
```

This improves search quality for your specific note-taking style.
