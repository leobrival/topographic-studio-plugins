# Web Crawler Plugin

High-performance web crawler plugin for Claude Code.

## Structure

This plugin uses a git submodule-based skill architecture:

```
web-crawler/
├── .claude-plugin/
│   └── plugin.json              ← Plugin configuration
└── skills/
    └── website-crawler/         ← Submodule (rcrawler)
        ├── SKILL.md             ← Skill for Claude Code
        ├── reference.md         ← Command reference
        ├── README.md            ← Submodule documentation
        ├── src/                 ← Rust source code
        ├── Cargo.toml           ← Rust configuration
        └── ...
```

## Installation

The plugin automatically loads the `website-crawler` skill from the submodule.

For detailed documentation, see `skills/website-crawler/README.md`.

## License

MIT
