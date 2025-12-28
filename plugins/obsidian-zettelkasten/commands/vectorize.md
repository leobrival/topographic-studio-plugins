---
description: Build and query a vector database for semantic search across your Obsidian vault
argument-hint: "[vault-path] [query]"
allowed-tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "AskUserQuestion", "TodoWrite"]
---

# Vector Database for Semantic Search

Build a vector database from your Obsidian notes to enable semantic search and find conceptually related content.

**FIRST**: Load the `obsidian-zettelkasten:vector-search` skill for implementation details.

## Your Task

Manage vector database for the vault. If `$ARGUMENTS` contains a query, perform semantic search. Otherwise, use interactive mode.

## Interactive Workflow

### Step 1: Detect or Ask for Vault Path

If vault not provided in `$ARGUMENTS`:

1. Try to auto-detect:
   ```bash
   ls -d ~/Documents/Obsidian* ~/Obsidian* 2>/dev/null | head -5
   ```

2. If multiple vaults or none found, use `AskUserQuestion`:
   ```
   question: "Which Obsidian vault do you want to use?"
   header: "Vault"
   options:
     - label: "~/Documents/Obsidian/MyVault"
       description: "Detected vault"
     - label: "Enter custom path"
       description: "Specify a different location"
   ```

### Step 2: Ask Action

Use `AskUserQuestion` to determine the action:

```
question: "What would you like to do?"
header: "Action"
options:
  - label: "Semantic search (Recommended)"
    description: "Search notes by meaning, not just keywords"
  - label: "Find similar notes"
    description: "Find notes related to a specific note"
  - label: "Build/rebuild database"
    description: "Index all notes for semantic search"
  - label: "Check status"
    description: "View database stats and health"
```

### Step 3a: Semantic Search Flow

If user chose "Semantic search":

```
question: "What are you looking for?"
header: "Query"
options:
  - label: "Enter search query"
    description: "Type your search in natural language"
```

After getting query, search and present results:

```
Semantic Search: "how to build good habits"

Top Results:

1. [[compound-effect-habits]] (92% match)
   "Small actions, repeated consistently..."

2. [[habit-stacking]] (89% match)
   "Link new behaviors to existing routines..."

3. [[atomic-habits-literature]] (87% match)
   "James Clear's framework focuses on..."
```

Then ask:

```
question: "What would you like to do next?"
header: "Next"
options:
  - label: "Open a result"
    description: "View one of these notes"
  - label: "Refine search"
    description: "Search with different terms"
  - label: "Find similar to result #1"
    description: "Explore related notes"
  - label: "Done"
    description: "Exit search"
```

### Step 3b: Find Similar Notes Flow

If user chose "Find similar notes":

```
question: "Which note do you want to find similar notes for?"
header: "Note"
options:
  - label: "Search by name"
    description: "Enter note title or filename"
  - label: "Recent permanent notes"
    description: "Choose from recently modified"
  - label: "Browse by MOC"
    description: "Select from a Map of Content"
```

Present similar notes:

```
Notes Similar to: [[compound-effect-habits]]

Highly Similar (85%+):
- [[habit-stacking]] (91%)
- [[consistency-over-intensity]] (89%)

Moderately Similar (70-85%):
- [[delayed-gratification]] (78%)
- [[exponential-growth]] (75%)

Not currently linked - consider adding?
- [[marginal-gains]] (72%)
```

Then ask:

```
question: "Add suggested links?"
header: "Links"
multiSelect: true
options:
  - label: "Yes, add all suggested"
    description: "Link to marginal-gains and others"
  - label: "Select which to add"
    description: "Choose specific connections"
  - label: "No, skip"
    description: "Don't add any links"
```

### Step 3c: Build Database Flow

If user chose "Build/rebuild database":

```
question: "How would you like to build the database?"
header: "Build"
options:
  - label: "Full build (Recommended)"
    description: "Index all notes from scratch"
  - label: "Update only"
    description: "Only process new/modified notes"
  - label: "Configure first"
    description: "Set chunk size, model, exclusions"
```

If "Configure first":

```
question: "Which embedding model to use?"
header: "Model"
options:
  - label: "Ollama nomic-embed-text (Recommended)"
    description: "Free, local, private - requires Ollama"
  - label: "OpenAI text-embedding-3-small"
    description: "Fast, accurate - requires API key"
  - label: "Ollama all-minilm"
    description: "Smaller model, faster but less accurate"
```

Show progress during build:

```
Building vector database...

Phase 1: Scanning notes
Found 127 markdown files

Phase 2: Chunking content
├── Permanent notes: 89 → 245 chunks
├── Literature notes: 23 → 112 chunks
└── MOCs: 8 → 24 chunks

Phase 3: Generating embeddings
[████████████░░░░░░░░] 60% (240/399)

Current: compound-effect-habits.md
```

### Step 3d: Status Flow

If user chose "Check status":

```
Vector Database Status

Created: 2024-01-15 10:30
Updated: 2024-01-15 14:22

Content:
├── Notes indexed: 127
├── Total chunks: 399
├── Database size: 12.4 MB

Health:
├── Up to date: 120 notes
├── Need update: 7 notes
├── New (unindexed): 3 notes

Model: nomic-embed-text (768 dimensions)
```

Then ask:

```
question: "Database needs updates. What would you like to do?"
header: "Action"
options:
  - label: "Update now (Recommended)"
    description: "Index 10 changed notes"
  - label: "View outdated notes"
    description: "See which notes need updating"
  - label: "Skip for now"
    description: "Continue without updating"
```

## Prerequisites Check

Before any operation, verify:

```bash
# Check for embedding model
which ollama && ollama list | grep nomic-embed

# Or OpenAI key
test -n "$OPENAI_API_KEY" && echo "OpenAI configured"
```

If neither available:

```
question: "No embedding model found. How would you like to proceed?"
header: "Setup"
options:
  - label: "Install Ollama (Recommended)"
    description: "Free, local, private - I'll guide you"
  - label: "Use OpenAI API"
    description: "Requires API key - set OPENAI_API_KEY"
  - label: "Cancel"
    description: "Exit without setting up"
```

## Storage Structure

```
vault/
└── .vectors/
    ├── config.json          # Database configuration
    ├── embeddings.json      # Vector embeddings store
    └── index.json           # Note metadata index
```

## Error Handling

**If Ollama not running**:
```
question: "Ollama is installed but not running. Start it?"
header: "Ollama"
options:
  - label: "Yes, start Ollama"
    description: "Run 'ollama serve' in background"
  - label: "Use OpenAI instead"
    description: "Switch to API-based embeddings"
  - label: "Cancel"
    description: "Exit and start manually"
```

**If database corrupted**:
```
question: "Vector database appears corrupted. How to proceed?"
header: "Recovery"
options:
  - label: "Rebuild from scratch (Recommended)"
    description: "Delete and recreate database"
  - label: "Try to repair"
    description: "Attempt to fix corrupted entries"
  - label: "Cancel"
    description: "Exit without changes"
```
