# Topographic Studio Plugins

Topographic Studio plugins for Claude Code - crawling, product strategy, and technical engineering agents.

## Installation

### Add the marketplace

```bash
/plugin marketplace add leobrival/topographic-studio-plugins
```

### Install plugins

```bash
# Install the crawler
/plugin install crawler@topographic-studio-plugins

# Install product/marketing agents
/plugin install ideabrowser@topographic-studio-plugins

# Install technical engineering agents
/plugin install roadmap@topographic-studio-plugins

# Install security hooks (Bun runtime)
/plugin install hookify@topographic-studio-plugins

# Install spec-kit CLI manager
/plugin install speckit@topographic-studio-plugins
```

### Verify installation

```bash
/plugin list
```

## Available Plugins

### crawler

High-performance web crawler for discovering and mapping website structure.

- Sitemap discovery and parsing
- Checkpoint/resume support
- Rate limiting
- HTML report generation

### ideabrowser

Product and marketing agents for ideation, strategy, and execution.

- 30+ specialized agents
- Landing pages, user personas, PRDs
- Marketing strategy, SEO, content
- Pricing, analytics, customer success

### roadmap

Technical engineering agents for software development and architecture.

- 28+ specialized agents
- System design, architecture patterns
- Frontend, backend, fullstack
- DevOps, cloud, data engineering
- AI/ML, prompt engineering

### hookify

Enhanced hookify with **24 pre-configured security rules** - Bun runtime, no Python required.

- 20 Bash security rules (block/warn dangerous commands)
- 4 File editing rules (secrets detection, debug code)
- Commands: `/hookify`, `/hookify:list`, `/hookify:configure`

### speckit

Complete lifecycle management for [spec-kit](https://github.com/github/spec-kit) - spec-driven development.

- Install spec-kit CLI with prerequisites check
- Update to latest version
- Version comparison (installed vs latest)
- Project initialization with AI agent selection

**Usage:**

```bash
/speckit           # Check version
/speckit install   # Install spec-kit
/speckit update    # Update to latest
/speckit init      # Initialize project
```

## File Structure

```
topographic-studio-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── crawler/
│   ├── ideabrowser/
│   ├── roadmap/
│   ├── hookify/
│   ├── security-hooks/
│   └── speckit/
└── README.md
```

## License

MIT
