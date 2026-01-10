# Topographic Plugins (Official)

Official collection of Topographic Studio plugins for Claude Code - development CLI, GitHub workflows, and product design.

## Installation

### Add the marketplace

```bash
/plugin marketplace add leobrival/topographic-plugins-official
```

### Install plugins

```bash
# Install dev plugin (CLI skills + GitHub workflows)
/plugin install dev@topographic-plugins-official

# Install product design tools
/plugin install product@topographic-plugins-official
```

### Verify installation

```bash
/plugin list
```

## Available Plugins

### dev

Development CLI skills and GitHub workflows - Docker, Vercel, Railway, Neon, and automated Git/GitHub workflows for commits, PRs, worktrees, and branch management.

- **CLI Skills**: Docker, GitHub, Vercel, Railway, Neon, AdonisJS, Convex, Next.js, Playwright, Raycast
- **GitHub Workflows**: Commit, PR creation, worktree management, merge automation, debugging
- **Scripts**: worktree-manager for automated parallel development
- **Framework Guidance**: Infrastructure automation and deployment

**Use for:** Development workflows, deployment, CLI reference, GitHub automation, infrastructure setup, collaborative development

### product

Product design and management tools for building user-centric products.

- Product strategy frameworks
- User research methodologies
- Design system guidance
- Product analytics and metrics

**Use for:** Product strategy, design planning, user-centric development, product analysis

## File Structure

```
topographic-plugins-official/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── dev/
│   │   ├── skills/          (13 CLI skills)
│   │   ├── commands/        (8 Git/GitHub commands)
│   │   └── scripts/         (worktree-manager)
│   └── product/
├── README.md
└── LICENSE
```

## License

MIT
