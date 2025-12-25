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

## File Structure

```
topographic-studio-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── crawler/
│   ├── ideabrowser/
│   └── roadmap/
└── README.md
```

## License

MIT
