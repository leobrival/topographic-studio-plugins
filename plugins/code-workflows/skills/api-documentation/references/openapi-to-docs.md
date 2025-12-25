# OpenAPI to Documentation

Generate documentation from OpenAPI/Swagger specifications.

## Tools Overview

| Tool | Output | Best For |
|------|--------|----------|
| Redoc | Single-page HTML | Beautiful public docs |
| Swagger UI | Interactive HTML | Try-it-out functionality |
| Widdershins | Markdown | Hugo/static sites |
| Stoplight | Full portal | Enterprise docs |
| Slate | Multi-column HTML | Three-panel docs |

## Redoc

### CLI Usage

```bash
# Install
npm install -g @redocly/cli

# Generate HTML
npx @redocly/cli build-docs openapi.yaml -o docs/index.html

# With options
npx @redocly/cli build-docs openapi.yaml \
  --output docs/index.html \
  --title "My API" \
  --disableGoogleFont
```

### Docker

```bash
docker run -p 8080:80 \
  -v $(pwd)/openapi.yaml:/usr/share/nginx/html/openapi.yaml \
  -e SPEC_URL=openapi.yaml \
  redocly/redoc
```

### Embed in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <redoc spec-url='./openapi.yaml'></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

### Configuration

```yaml
# redocly.yaml
theme:
  colors:
    primary:
      main: "#0066cc"
  typography:
    fontSize: '16px'
    fontFamily: '"Inter", sans-serif'
  sidebar:
    width: '280px'
  rightPanel:
    backgroundColor: '#1a1a1a'
```

## Swagger UI

### Static HTML

```bash
# Download
curl -L https://github.com/swagger-api/swagger-ui/archive/master.tar.gz | tar xz
cp -r swagger-ui-master/dist docs/swagger-ui
```

### Docker

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/spec/openapi.yaml \
  -v $(pwd):/spec \
  swaggerapi/swagger-ui
```

### Embed in HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "./openapi.yaml",
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      layout: "StandaloneLayout"
    });
  </script>
</body>
</html>
```

## Widdershins (OpenAPI to Markdown)

### Installation

```bash
npm install -g widdershins
```

### Basic Usage

```bash
# Generate Markdown
widdershins openapi.yaml -o api-reference.md

# With options
widdershins openapi.yaml \
  --language_tabs 'shell:cURL' 'javascript:JavaScript' 'python:Python' \
  --omitHeader \
  --summary \
  -o api-reference.md
```

### For Hugo

```bash
# Generate frontmatter-compatible Markdown
widdershins openapi.yaml \
  --user_templates ./templates \
  --omitHeader \
  -o content/api-reference/_index.md
```

### Custom Templates

Create templates in `./templates/`:

```handlebars
{{! main.dot }}
---
title: "{{=data.api.info.title}}"
description: "{{=data.api.info.description}}"
---

# {{=data.api.info.title}}

{{=data.api.info.description}}

{{#each operations}}
## {{summary}}
{{/each}}
```

## Stoplight Studio

### Features

- Visual OpenAPI editor
- Mock servers
- Automatic documentation
- Git integration

### CLI

```bash
# Install
npm install -g @stoplight/cli

# Preview
stoplight preview openapi.yaml

# Publish
stoplight publish openapi.yaml --token YOUR_TOKEN
```

## OpenAPI Generator

### Generate Documentation

```bash
# Install
npm install -g @openapitools/openapi-generator-cli

# Generate HTML
openapi-generator-cli generate \
  -i openapi.yaml \
  -g html2 \
  -o docs

# Generate Markdown
openapi-generator-cli generate \
  -i openapi.yaml \
  -g markdown \
  -o docs
```

## Spectral (Linting)

### Installation

```bash
npm install -g @stoplight/spectral-cli
```

### Usage

```bash
# Lint OpenAPI spec
spectral lint openapi.yaml

# With custom rules
spectral lint openapi.yaml --ruleset .spectral.yaml
```

### Custom Rules

```yaml
# .spectral.yaml
extends: spectral:oas
rules:
  operation-description:
    severity: warn
    given: "$.paths.*[get,post,put,patch,delete]"
    then:
      field: description
      function: truthy
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Generate API Docs

on:
  push:
    paths:
      - 'openapi.yaml'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint OpenAPI
        run: npx @stoplight/spectral-cli lint openapi.yaml

      - name: Generate Redoc
        run: npx @redocly/cli build-docs openapi.yaml -o docs/index.html

      - name: Deploy to Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

### Automation Script

```bash
#!/bin/bash
# generate-docs.sh

set -e

SPEC_FILE="openapi.yaml"
OUTPUT_DIR="docs"

echo "Validating OpenAPI spec..."
npx @stoplight/spectral-cli lint $SPEC_FILE

echo "Generating Redoc..."
npx @redocly/cli build-docs $SPEC_FILE -o $OUTPUT_DIR/index.html

echo "Generating Markdown for Hugo..."
npx widdershins $SPEC_FILE -o $OUTPUT_DIR/api-reference.md

echo "Generating Postman collection..."
npx openapi-to-postmanv2 -s $SPEC_FILE -o $OUTPUT_DIR/postman-collection.json

echo "Documentation generated successfully!"
```

## Best Practices

### OpenAPI Spec Quality

1. **Comprehensive descriptions**: Every operation, parameter, schema
2. **Examples**: Include request/response examples
3. **Tags**: Group operations logically
4. **Schemas**: Define reusable components
5. **Security**: Document authentication clearly

### Documentation Generation

1. **Automate**: Generate on every API change
2. **Lint first**: Validate spec before generating
3. **Multiple formats**: HTML, Markdown, Postman
4. **Version control**: Track generated docs
5. **Custom styling**: Match your brand

### Maintenance

1. **Single source of truth**: OpenAPI spec is authoritative
2. **CI/CD pipeline**: Auto-generate on merge
3. **Preview PRs**: Generate preview docs for PR review
4. **Changelog**: Document API changes
5. **Deprecation**: Mark deprecated endpoints in spec
