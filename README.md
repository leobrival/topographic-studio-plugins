# Topographic Studio Plugins

Topographic Studio plugins for Claude Code.

## Installation

### Add the marketplace

```bash
/plugin marketplace add leobrival/topographic-studio-plugins
```

### Install plugins

```bash
/plugin install <plugin-name>@topographic-studio-plugins
```

### Verify installation

```bash
/plugin list
```

## Available Plugins

_No plugins available yet._

## File Structure

```
topographic-studio-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── <plugin-name>/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── commands/
│       ├── agents/
│       ├── hooks/
│       └── README.md
└── README.md
```

## Development

### Adding New Plugins

Create a new directory under `plugins/` with the following structure:

```
plugins/my-new-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
├── agents/
├── hooks/
└── README.md
```

Then add the plugin entry to `.claude-plugin/marketplace.json`.

## License

MIT
