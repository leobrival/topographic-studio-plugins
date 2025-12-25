# Web Crawler - Project Memory

## 🔄 Documentation Maintenance

**IMPORTANT**: Quand vous modifiez ce projet, mettez à jour:
1. ✅ **Ce fichier (CLAUDE.md)** - Architecture, specs, conventions
2. ✅ **README.md** - Guide utilisateur, exemples
3. ✅ **Commandes associées** - `/Users/leobrival/.claude/commands/utils/crawler.md`
4. ✅ **Scripts Raycast** - `/Users/leobrival/.claude/scripts/raycast/crawl-website.sh`

---

## Overview

High-performance web crawler with **TypeScript/Bun frontend** and **Go backend**. Hybrid architecture for optimal balance between developer experience (TS) and raw performance (Go).

## Architecture

### Hybrid Design Pattern

```
┌─────────────────────────┐
│   TypeScript Frontend   │  (Bun Runtime)
│  ┌──────────────────┐   │
│  │ CLI Parser       │   │  - Argument validation
│  │ Config Manager   │   │  - Profile merging
│  │ Go Bridge        │   │  - Process spawn
│  │ HTML Generator   │   │  - Report generation
│  └──────────────────┘   │
└────────────┬────────────┘
             │ spawn()
             ↓
┌─────────────────────────┐
│     Go Backend          │  (Compiled Binary)
│  ┌──────────────────┐   │
│  │ Crawler Engine   │   │  - Concurrent crawling
│  │ Sitemap Parser   │   │  - XML discovery
│  │ Rate Limiter     │   │  - Token bucket
│  │ Checkpoint Mgr   │   │  - Auto-save/resume
│  └──────────────────┘   │
└─────────────────────────┘
```

### Why Hybrid?

- **TypeScript**: Dev velocity, config management, CLI UX
- **Go**: Concurrency (goroutines), performance, compiled binary
- **Bridge**: `child_process.spawn()` with JSON I/O

---

## Project Structure

```
crawler/
├── src/                      # TypeScript Frontend
│   ├── index.ts             # Main entry (orchestration)
│   ├── cli.ts               # CLI parser (arguments → options)
│   ├── raycast.ts           # Raycast integration
│   └── lib/
│       ├── config.ts        # Config + Profile manager
│       ├── go-bridge.ts     # TS ↔ Go communication
│       ├── logger.ts        # Structured logging (6 levels)
│       ├── formatters.ts    # Output formatting
│       ├── types.ts         # TypeScript interfaces
│       └── html-generator.ts # HTML report generator
│
├── engine/                   # Go Backend
│   ├── main.go              # Crawler engine (641 lines)
│   ├── go.mod               # Go dependencies
│   ├── go.sum               # Lock file
│   └── crawler              # Compiled binary (9.2 MB)
│
├── config/                   # JSON Configuration
│   ├── default.json         # Default values
│   └── profiles/            # Reusable profiles
│       ├── fast.json        # 50 workers, depth 3, rate 10
│       ├── deep.json        # 20 workers, depth 10, rate 3
│       └── gentle.json      # 5 workers, depth 5, rate 1
│
├── scripts/                  # Installation utilities
│   ├── install.sh           # Dependency check + setup
│   └── raycast.sh           # Raycast wrapper (legacy)
│
├── package.json             # npm config (no dependencies!)
├── tsconfig.json            # TypeScript config
├── .gitignore
├── README.md                # User documentation (13 KB)
└── CLAUDE.md                # This file - Project memory
```

---

## Configuration System

### Priority Order

```
CLI Arguments (highest)
    ↓
Profile JSON (if --profile specified)
    ↓
config/default.json
    ↓
Hardcoded defaults (lowest)
```

### Default Values

```json
{
  "maxDepth": 2,              // Crawl depth
  "maxWorkers": 20,           // Concurrent goroutines
  "rateLimit": 2,             // Requests per second
  "timeout": 30,              // HTTP timeout (seconds)
  "useSitemap": true,         // Auto-discover sitemap.xml
  "maxSitemapURLs": 1000,
  "respectRobotsTxt": true,
  "excludePatterns": [        // Auto-excluded
    "\.jpg$", "\.png$", "\.pdf$", "\.css$", "\.js$"
  ]
}
```

### Profile Example

```json
// config/profiles/fast.json
{
  "name": "Fast crawling",
  "description": "High concurrency for quick mapping",
  "maxWorkers": 50,
  "maxDepth": 3,
  "rateLimit": 10,
  "timeout": 15
}
```

---

## Go Engine Specifications

### Key Features (main.go)

**1. Sitemap Discovery**
- Tests: `sitemap.xml`, `sitemap_index.xml`, `wp-sitemap.xml`
- Parses XML with `encoding/xml`
- Lines 248-314

**2. Checkpoint/Resume**
- Auto-saves every 30 seconds
- Stores: visited URLs, results, stats
- Lines 196-246

**3. Concurrent Crawling**
- Worker pool pattern (buffered channel)
- 10,000 jobs buffer (prevents deadlock)
- Atomic counters for thread safety (`sync/atomic`)
- Lines 316-395

**4. Rate Limiting**
- Token bucket algorithm (`golang.org/x/time/rate`)
- Per-second limit enforcement
- Line 138

**5. Structured Logger**
```go
type LogLevel string
const (
    TRACE LogLevel = "TRACE"
    DEBUG LogLevel = "DEBUG"
    INFO  LogLevel = "INFO"
    WARN  LogLevel = "WARN"
    ERROR LogLevel = "ERROR"
    FATAL LogLevel = "FATAL"
)
```
Lines 37-97

---

## TypeScript Frontend Specifications

### CLI Parser (cli.ts)

**Arguments**:
```
<URL>                  Required first argument
-d, --domain          Allowed domain (default: extracted from URL)
-w, --workers         Concurrent workers (default: 20)
-D, --depth           Max depth (default: 2)
-r, --rate            Rate limit req/s (default: 2)
-p, --profile         Profile name (fast|deep|gentle)
-o, --output          Output directory
-s, --sitemap         Use sitemap.xml (default: true)
--debug               Enable debug logging
```

### Go Bridge (go-bridge.ts)

**Responsibilities**:
1. Check if `engine/crawler` binary exists
2. Compile if missing: `go build -o crawler main.go`
3. Spawn Go process: `spawn(binary, args)`
4. Stream stdout/stderr to console
5. Parse `results.json` on completion
6. 10-minute timeout protection

**Key Methods**:
```typescript
ensureCrawlerExists(): Promise<boolean>
compileCrawler(): Promise<boolean>
executeCrawler(config): Promise<GoProcessResult>
readResults(outputDir): Promise<CrawlResults>
```

### Logger (logger.ts)

**Format**: `[2025-11-15 05:00:00] LEVEL: message`

**Levels**: TRACE < DEBUG < INFO < WARN < ERROR < FATAL

**Colors**: ANSI codes (cyan DEBUG, red ERROR, etc.)

---

## Data Flow

### Complete Execution Flow

```
1. User executes: bun src/index.ts https://example.com --depth 3
          ↓
2. CLI Parser: Validates and parses arguments
          ↓
3. Config Manager: Merges default.json + CLI options
          ↓
4. Go Bridge: Ensures binary exists (compile if needed)
          ↓
5. Spawn Go Process: ./crawler --url ... --depth 3
          ↓
6. Go Crawler:
   - Fetch sitemap (if enabled)
   - Crawl pages (worker pool)
   - Save checkpoints (every 30s)
   - Write results.json
          ↓
7. TS reads results.json
          ↓
8. Generate index.html (dark theme)
          ↓
9. Display stats + open results
```

---

## Output Formats

### results.json
```json
{
  "stats": {
    "pages_found": 150,
    "pages_crawled": 147,
    "external_links": 23,
    "excluded_links": 89,
    "errors": 3,
    "start_time": "2025-11-15T05:00:00+01:00"
  },
  "results": [
    {
      "url": "https://example.com",
      "title": "Example Domain",
      "status_code": 200,
      "depth": 0,
      "links": ["https://example.com/about"],
      "crawled_at": "2025-11-15T05:00:01+01:00",
      "content_type": "text/html"
    }
  ]
}
```

### index.html
- Dark theme (inspired by Next.js docs)
- Collapsible link sections
- Statistics dashboard
- Mobile responsive
- Auto light/dark mode detection

---

## Raycast Integration

### Native Support

The crawler detects Raycast environment via:
```typescript
static isRaycastEnvironment(): boolean {
  return process.env.RAYCAST === "1";
}
```

**Raycast Mode**:
- Compact output format
- Auto-opens results with `RaycastAdapter.openResults()`
- Special error formatting

### Associated Script

**File**: `/Users/leobrival/.claude/scripts/raycast/crawl-website.sh`

**Usage**:
```bash
# From Raycast
URL: https://example.com
Depth: 2 (optional)
```

**Executes**:
```bash
cd ~/.claude/scripts/crawler
bun src/index.ts "$URL" --depth "$DEPTH" --debug
```

---

## Claude Code Command

**File**: `/Users/leobrival/.claude/commands/utils/crawler.md`

**Usage**: `/crawler https://example.com`

**What it does**:
1. Parses user request (URL, depth, options)
2. Runs: `cd ~/.claude/scripts/crawler && bun src/index.ts <url> <options>`
3. Monitors progress
4. Reports results

---

## Development

### Running Locally

```bash
# Direct execution
cd ~/.claude/scripts/crawler
bun src/index.ts https://example.com

# With options
bun src/index.ts https://example.com --depth 3 --workers 30 --rate 5

# Using profile
bun src/index.ts https://example.com --profile fast

# Debug mode
bun src/index.ts https://example.com --debug
```

### Compiling Go Backend

```bash
cd engine
go build -o crawler main.go

# Test binary
./crawler --url https://example.com --depth 1 --workers 5
```

### Adding a New Profile

```bash
# Create new profile
cat > config/profiles/custom.json << EOF
{
  "name": "Custom profile",
  "description": "Your description",
  "maxWorkers": 15,
  "maxDepth": 4,
  "rateLimit": 3
}
EOF

# Use it
bun src/index.ts https://example.com --profile custom
```

---

## Code Conventions

### TypeScript
- **ALWAYS** use camelCase for variables and functions
- Prefer `const` over `let`
- Use async/await (not callbacks)
- Type everything (strict mode)

### Go
- Follow standard Go conventions
- Use goroutines for concurrency
- Atomic operations for shared state
- Structured error handling

### Logging
- Use logger.info() for normal flow
- Use logger.debug() for detailed traces
- Use logger.error() for failures
- Use logger.fatal() only for unrecoverable errors

---

## Performance Benchmarks

**Typical Performance** (on example.com):
- 1 page: ~2 seconds
- 10 pages: ~8 seconds
- 100 pages: ~45 seconds
- 1000 pages: ~6 minutes

**Bottlenecks**:
1. Network latency (main factor)
2. Server rate limiting
3. Page size/complexity

**Optimizations**:
- Increase `--workers` for more concurrency
- Increase `--rate` if server allows
- Use `--sitemap` for faster discovery
- Reduce `--depth` for shallower crawls

---

## Troubleshooting

### Go binary not compiling

```bash
# Check Go installation
go version

# Install if missing
brew install go

# Manually compile
cd engine
go mod tidy
go build -o crawler main.go
```

### Rate limiting errors

```bash
# Reduce rate limit
bun src/index.ts <url> --rate 1

# Use gentle profile
bun src/index.ts <url> --profile gentle
```

### Timeout on large sites

```bash
# Increase depth limit (crawls more but faster per level)
bun src/index.ts <url> --depth 1 --workers 50

# Or use sitemap for quick discovery
bun src/index.ts <url> --sitemap
```

---

## Maintenance Checklist

When modifying the crawler:

- [ ] Update this CLAUDE.md with architecture changes
- [ ] Update README.md with user-facing changes
- [ ] Update `/Users/leobrival/.claude/commands/utils/crawler.md` if CLI changes
- [ ] Update `/Users/leobrival/.claude/scripts/raycast/crawl-website.sh` if needed
- [ ] Recompile Go binary: `cd engine && go build -o crawler main.go`
- [ ] Test with: `bun src/index.ts https://example.com --depth 1`
- [ ] Verify HTML output is generated
- [ ] Check checkpoint/resume works (Ctrl+C and restart)

---

## Related Files

### Scripts Raycast
- `/Users/leobrival/.claude/scripts/raycast/crawl-website.sh`

### Commandes Claude Code
- `/Users/leobrival/.claude/commands/utils/crawler.md`
- `/Users/leobrival/.claude/commands/utils/audit.md` (uses crawler)

### Config Files
- `config/default.json` - Default configuration
- `config/profiles/*.json` - Reusable profiles

---

## Known Limitations

- macOS/Linux only (Go binary compilation)
- Requires Bun runtime
- JavaScript rendering not supported (static HTML only)
- No authentication support yet
- Sitemap limited to 1000 URLs

---

**Last Updated**: 2025-11-15
**Version**: 1.0.0
**Maintainer**: leobrival
