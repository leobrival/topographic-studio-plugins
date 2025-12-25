---
name: api-documentation
description: Create professional API documentation using Hugo static site generator or Postman. Use when users need to generate API docs from OpenAPI specs, create developer portals, build interactive API explorers, or publish Postman collections. Supports multiple documentation themes and formats.
---

# API Documentation Generator

Create professional, interactive API documentation for developer portals.

## Decision Tree

```
User request → What format/tool?
    │
    ├─ Static Documentation Site → Hugo
    │   ├─ Which theme?
    │   │   ├─ Docsy → Enterprise docs, multi-language
    │   │   ├─ Doks → Modern, minimal, fast
    │   │   ├─ Geekdoc → Technical, clean
    │   │   └─ Book → Simple, book-like
    │   │
    │   └─ From OpenAPI? → Use widdershins or redoc-cli
    │
    ├─ Interactive API Explorer → Postman
    │   ├─ Collection → Organized endpoints
    │   ├─ Documentation → Published docs
    │   └─ Mock Server → Test without backend
    │
    ├─ Standalone API Reference →
    │   ├─ Redoc → Beautiful single-page
    │   ├─ Swagger UI → Interactive try-it
    │   └─ Stoplight → Full-featured portal
    │
    └─ OpenAPI-first workflow →
        └─ Generate from spec → See references/openapi-to-docs.md
```

## Quick Start

### Hugo API Documentation

```bash
# Install Hugo
brew install hugo

# Create new site with Doks theme
hugo new site api-docs
cd api-docs
git init
git submodule add https://github.com/h-enk/doks themes/doks

# Or use Docsy
git submodule add https://github.com/google/docsy themes/docsy

# Start dev server
hugo server -D
```

### Postman Documentation

```bash
# Install Newman (Postman CLI)
npm install -g newman

# Run collection
newman run collection.json -e environment.json

# Generate HTML report
newman run collection.json -r htmlextra
```

### From OpenAPI Spec

```bash
# Generate Markdown for Hugo
npx widdershins openapi.yaml -o api-reference.md

# Generate Redoc standalone HTML
npx @redocly/cli build-docs openapi.yaml -o docs/index.html

# Generate Swagger UI
docker run -p 8080:8080 -e SWAGGER_JSON=/spec/openapi.yaml \
  -v $(pwd):/spec swaggerapi/swagger-ui
```

## Tool Selection Guide

| Need | Tool | Best For |
|------|------|----------|
| Full dev portal | Hugo + Docsy | Enterprise, multi-product |
| Quick API docs | Hugo + Doks | Startups, single API |
| Interactive testing | Postman | API exploration, QA |
| Beautiful reference | Redoc | Public API docs |
| Try-it-out | Swagger UI | Developer onboarding |
| Mock + docs | Postman | Early development |

## Hugo Themes Comparison

| Theme | Pros | Cons |
|-------|------|------|
| **Docsy** | Full-featured, i18n, versioning | Heavy, complex setup |
| **Doks** | Fast, modern, simple | Less features |
| **Geekdoc** | Clean, technical | Basic customization |
| **Book** | Simple, familiar | Limited API features |

## Documentation Structure

```
api-docs/
├── content/
│   ├── _index.md              # Homepage
│   ├── getting-started/
│   │   ├── _index.md
│   │   ├── quickstart.md
│   │   └── authentication.md
│   ├── api-reference/
│   │   ├── _index.md
│   │   ├── users.md
│   │   ├── posts.md
│   │   └── webhooks.md
│   ├── guides/
│   │   ├── pagination.md
│   │   ├── rate-limits.md
│   │   └── errors.md
│   └── sdks/
│       ├── javascript.md
│       ├── python.md
│       └── go.md
├── static/
│   ├── openapi.yaml
│   └── postman-collection.json
└── config.toml
```

## Reference Files

- **Hugo Setup**: See [references/hugo-setup.md](references/hugo-setup.md)
- **Postman Collections**: See [references/postman-collections.md](references/postman-collections.md)
- **OpenAPI to Docs**: See [references/openapi-to-docs.md](references/openapi-to-docs.md)
- **Writing Style**: See [references/writing-guide.md](references/writing-guide.md)

## Best Practices

1. **Start with OpenAPI**: Single source of truth
2. **Code examples**: Show real requests/responses
3. **Multiple languages**: SDK examples in popular languages
4. **Interactive try-it**: Let developers test immediately
5. **Error documentation**: Explain all error codes
6. **Versioning**: Support multiple API versions
7. **Search**: Enable full-text search
8. **Changelog**: Document all changes
