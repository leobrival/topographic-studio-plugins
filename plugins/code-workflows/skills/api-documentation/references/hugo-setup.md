# Hugo Setup for API Documentation

Complete guide to setting up Hugo for API documentation sites.

## Installation

### macOS

```bash
# Homebrew (recommended)
brew install hugo

# Verify installation
hugo version
```

### Windows

```bash
# Chocolatey
choco install hugo-extended

# Scoop
scoop install hugo-extended
```

### Linux

```bash
# Snap
sudo snap install hugo --channel=extended

# APT (Ubuntu/Debian)
sudo apt install hugo
```

## Creating a New Site

```bash
# Create new site
hugo new site api-docs
cd api-docs

# Initialize git
git init
```

## Theme Installation

### Doks Theme (Recommended for API Docs)

```bash
# As git submodule
git submodule add https://github.com/h-enk/doks themes/doks

# Or clone directly
git clone https://github.com/h-enk/doks themes/doks
```

### Docsy Theme (Enterprise)

```bash
# As git submodule
git submodule add https://github.com/google/docsy themes/docsy

# Install dependencies
cd themes/docsy
npm install
```

### Geekdoc Theme (Technical)

```bash
# Download release
mkdir -p themes/geekdoc
curl -L https://github.com/thegeeklab/hugo-geekdoc/releases/latest/download/hugo-geekdoc.tar.gz | tar -xz -C themes/geekdoc
```

## Project Structure

```
api-docs/
├── archetypes/
│   ├── default.md
│   ├── endpoint.md      # API endpoint template
│   └── guide.md         # Guide template
├── content/
│   ├── _index.md        # Homepage
│   ├── getting-started/
│   │   ├── _index.md
│   │   ├── quickstart.md
│   │   ├── authentication.md
│   │   └── errors.md
│   ├── api-reference/
│   │   ├── _index.md
│   │   ├── users/
│   │   │   ├── _index.md
│   │   │   ├── list-users.md
│   │   │   ├── get-user.md
│   │   │   └── create-user.md
│   │   └── resources/
│   │       └── ...
│   ├── guides/
│   │   ├── pagination.md
│   │   ├── rate-limits.md
│   │   └── webhooks.md
│   └── sdks/
│       ├── javascript.md
│       ├── python.md
│       └── go.md
├── layouts/
│   ├── shortcodes/
│   │   ├── api-endpoint.html
│   │   ├── code-tabs.html
│   │   ├── param-table.html
│   │   └── response-example.html
│   └── partials/
│       └── ...
├── static/
│   ├── openapi.yaml     # OpenAPI spec
│   ├── postman/         # Postman collections
│   └── images/
├── assets/
│   └── scss/
│       └── custom.scss
└── config.toml          # Hugo configuration
```

## Configuration

### Basic config.toml

```toml
baseURL = "https://docs.example.com/"
title = "API Documentation"
theme = "doks"

# Enable features
enableGitInfo = true
enableRobotsTXT = true

# Markup
[markup]
  [markup.goldmark.renderer]
    unsafe = true
  [markup.highlight]
    style = "dracula"
    lineNos = false

# Menu
[menu]
  [[menu.main]]
    name = "Getting Started"
    url = "/getting-started/"
    weight = 10
  [[menu.main]]
    name = "API Reference"
    url = "/api-reference/"
    weight = 20

# Params
[params]
  apiVersion = "v1"
  apiBaseUrl = "https://api.example.com"
```

## Development Workflow

### Local Development

```bash
# Start dev server with drafts
hugo server -D

# Start with specific bind address
hugo server -D --bind 0.0.0.0

# Start with live reload disabled
hugo server -D --disableLiveReload
```

### Building

```bash
# Build for production
hugo --minify

# Build with specific environment
hugo --environment production --minify

# Build to specific directory
hugo -d public --minify
```

## Content Creation

### New Endpoint

```bash
hugo new api-reference/users/create-user.md
```

### New Guide

```bash
hugo new guides/webhooks.md
```

## Deployment

### Vercel

```json
{
  "buildCommand": "hugo --minify",
  "outputDirectory": "public",
  "installCommand": "yum install -y hugo || apt-get install -y hugo"
}
```

### Netlify

```toml
# netlify.toml
[build]
  command = "hugo --minify"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.120.0"
```

### GitHub Pages

```yaml
# .github/workflows/hugo.yml
name: Deploy Hugo
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## Search Configuration

### FlexSearch (Doks)

```toml
[params]
  flexSearch = true
```

### Algolia DocSearch

```toml
[params.algolia]
  appId = "YOUR_APP_ID"
  apiKey = "YOUR_SEARCH_API_KEY"
  indexName = "api_docs"
```

## Multi-language Support

```toml
defaultContentLanguage = "en"

[languages]
  [languages.en]
    languageName = "English"
    weight = 1
  [languages.fr]
    languageName = "Français"
    weight = 2
    [languages.fr.params]
      apiBaseUrl = "https://api.example.com/fr"
```

## Versioning

### URL-based Versioning

```
content/
├── v1/
│   └── api-reference/
└── v2/
    └── api-reference/
```

### Branch-based Versioning

Use separate branches for each API version and deploy to subdomains.

## Best Practices

1. **Use shortcodes**: Create reusable components for endpoints, parameters, responses
2. **Automate from OpenAPI**: Generate content from your OpenAPI spec
3. **Include examples**: Every endpoint should have request/response examples
4. **Multiple languages**: Show code examples in different languages
5. **Keep updated**: Sync documentation with API changes
6. **Test links**: Regularly check for broken links
7. **Optimize images**: Compress and lazy-load images
8. **Enable search**: Make documentation searchable
