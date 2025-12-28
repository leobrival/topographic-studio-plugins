# Obsidian Zettelkasten Plugin

A Claude Code plugin for implementing the Zettelkasten note-taking methodology in Obsidian.

## Overview

This plugin provides an AI-powered assistant for building and maintaining a Zettelkasten (slip-box) knowledge management system in Obsidian. It helps you create atomic notes, establish meaningful connections, and develop your personal knowledge base following Niklas Luhmann's proven methodology.

## Features

- **Atomic Note Creation**: Create focused, single-idea permanent notes
- **Literature Notes**: Extract and process ideas from sources
- **Fleeting Notes**: Quick capture for ideas on the go
- **Maps of Content (MOCs)**: Build navigational structures for your notes
- **Intelligent Linking**: Discover and create meaningful connections
- **Note Review**: Refine and improve existing notes
- **Semantic Search**: Vector database for finding conceptually related notes
- **Note Validation**: TypeScript validators for frontmatter, structure, and links

## Commands

| Command | Description |
|---------|-------------|
| `/zettel` | Create a new atomic permanent note |
| `/literature` | Create a literature note from a source |
| `/fleeting` | Quick capture a fleeting idea |
| `/moc` | Create or update a Map of Content |
| `/link` | Find and create links between notes |
| `/review` | Review and refine existing notes |
| `/vectorize` | Build and query vector database for semantic search |
| `/validate` | Validate notes frontmatter, structure, and links |

## Zettelkasten Principles

The plugin follows core Zettelkasten principles:

1. **Atomicity**: One idea per note
2. **Autonomy**: Notes should be self-contained and understandable on their own
3. **Connectivity**: Notes gain value through links to other notes
4. **Personal Expression**: Write in your own words, not quotes
5. **Unique Identifiers**: Each note has a unique ID for permanent reference

## Note Types

### Fleeting Notes
Quick captures of ideas, thoughts, or observations. These are temporary and should be processed into permanent notes.

### Literature Notes
Notes taken while reading or consuming content. Capture ideas from sources in your own words with proper attribution.

### Permanent Notes (Zettel)
Atomic, fully-formed ideas written in your own words. These are the core of your Zettelkasten.

### Maps of Content (MOCs)
Index notes that organize and provide entry points to clusters of related notes.

## Installation

Add to your Claude Code plugins:

```bash
claude plugins:add topographic-studio-plugins/obsidian-zettelkasten
```

## Requirements

- Obsidian vault accessible from the terminal
- Claude Code CLI

## Configuration

Set your vault path in the conversation or let the agent detect it:

```bash
# Example: Set vault path
/zettel --vault ~/Documents/ObsidianVault
```

## Usage Examples

### Create a new permanent note

```bash
/zettel "The compound effect of daily habits"
```

### Create literature notes from a book

```bash
/literature "Atomic Habits by James Clear" --chapter 1
```

### Quick capture an idea

```bash
/fleeting "Connection between sleep quality and decision making"
```

### Build a Map of Content

```bash
/moc "Productivity Systems"
```

### Find connections for a note

```bash
/link "202312150930-compound-habits.md"
```

### Build vector database for semantic search

```bash
# Build the database
/vectorize --build

# Search semantically
/vectorize --search "how to build good habits"

# Find similar notes
/vectorize --similar "compound-habits.md"
```

## Vector Search

The plugin includes a powerful semantic search feature that goes beyond keyword matching. It understands the meaning of your notes and finds conceptually related content.

### How it works

1. **Build the index**: `/vectorize --build` processes all your notes
2. **Semantic search**: Find notes by meaning, not just keywords
3. **Similar notes**: Discover connections you might have missed

### Requirements for Vector Search

- **Ollama** (recommended, free, local): `ollama pull nomic-embed-text`
- **Or OpenAI API key**: `export OPENAI_API_KEY=sk-...`

## Note Validation

The plugin includes TypeScript validators (powered by Bun) to check note quality.

### Validate your vault

```bash
# Run all validators
/validate

# Validate only frontmatter
/validate --frontmatter

# Validate only structure
/validate --structure

# Validate only links
/validate --links

# Strict mode (warnings become errors)
/validate --strict

# Auto-fix common issues
/validate --fix
```

### What gets validated

**Frontmatter**:
- Valid YAML syntax
- Required fields by note type (id, title, created, type, status)
- ID format (YYYYMMDDHHmm)
- Date format (ISO 8601)
- Valid type and status values
- Source fields for literature notes

**Structure**:
- Atomicity (single concept per note)
- Heading hierarchy (H1 required, no level jumps)
- Word count limits by note type
- Required sections (Key Ideas for literature, etc.)
- No placeholder text (TODO, FIXME)

**Links**:
- All links resolve to existing notes
- No broken or self-referencing links
- Orphan notes detection (no connections)
- Weakly connected notes (< 2 links)

### Requirements for Validation

- **Bun** runtime: `curl -fsSL https://bun.sh/install | bash`

### Install validation scripts

```bash
cd your-vault/.scripts
bun install
```

## License

MIT
