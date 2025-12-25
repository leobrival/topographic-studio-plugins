---
description: Run the website crawler to discover and map site structure
allowed-tools: [Bash, Read]
argument-hint: <url> [--depth N] [--workers N] [--rate N]
---

# Website Crawler Command

Run the website crawler to discover and map site structure.

$ARGUMENTS

## Context

You are helping the user run the website crawler located at `./scripts/crawler/` (relative to the serum-plugin root).

The crawler:

- Discovers all pages on a website
- Maps site structure and link relationships
- Detects page patterns and templates
- Generates HTML reports with dark theme
- Exports results to JSON

## Available Options

- **--depth**: Crawl depth (default: 2)
- **--workers**: Concurrent workers (default: 5)
- **--rate**: Rate limit per second (default: 10)
- **--output**: Output directory

## Task

1. Parse the user's request to identify:
   - Target URL
   - Crawl depth (if specified)
   - Custom options (if any)

2. Run the crawler:

   ```bash
   cd /Users/leobrival/Developer/plugins/serum-plugin/scripts/crawler
   bun src/index.ts <url> --depth <depth> --workers <workers> --rate <rate> --output <output>
   ```

3. Monitor progress and provide updates

4. When complete, inform the user of:
   - Output location
   - Pages discovered
   - Next steps

## Examples

User: "Crawl example.com"
→ Run: `bun src/index.ts https://example.com --depth 2 --workers 5 --rate 10`

User: "Crawl my-site.com with depth 3"
→ Run: `bun src/index.ts https://my-site.com --depth 3`

User: "Quick crawl of docs.site.com"
→ Run: `bun src/index.ts https://docs.site.com --depth 1 --workers 10`

## Output

The crawler generates:

- `results.json`: Structured crawl data
- `index.html`: Dark-themed HTML report

## Response

Provide clear, concise updates in French. Do not use emojis unless explicitly requested.
